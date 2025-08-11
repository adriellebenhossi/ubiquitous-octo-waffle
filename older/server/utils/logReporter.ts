/**
 * Gerador de Relatórios de Log
 * Cria arquivos de relatório em formato texto legível
 */

import fs from 'fs';
import path from 'path';
import AdminLogger from './logger';

interface LogReport {
  month: string;
  generatedAt: string;
  totalChanges: number;
  totalAccess: number;
  changes: Array<{
    timestamp: string;
    ip: string;
    action: string;
    section: string;
    field: string;
    details: string;
  }>;
  access: Array<{
    timestamp: string;
    ip: string;
    action: string;
    status: string;
    userAgent: string;
    details: string;
  }>;
}

export class LogReporter {
  
  // Método para gerar relatório mensal com resultado estruturado
  async generateMonthlyReport(monthYear?: string): Promise<{
    success: boolean;
    month?: string;
    content?: string;
    error?: string;
    availableMonths?: string[];
  }> {
    try {
      const targetMonth = monthYear || new Date().toISOString().slice(0, 7);
      
      // Verificar se existem logs para o mês
      const availableMonths = AdminLogger.getAvailableMonths();
      if (!availableMonths.includes(targetMonth)) {
        return {
          success: false,
          error: `Nenhum log encontrado para o mês ${targetMonth}`,
          availableMonths
        };
      }
      
      const content = LogReporter.generateTextReport(targetMonth);
      
      return {
        success: true,
        month: targetMonth,
        content
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Erro ao gerar relatório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }
  
  // Método para gerar resumo dos logs
  async generateSummary(): Promise<{
    success: boolean;
    totalMonths: number;
    availableMonths: string[];
    summary: string;
    monthsData: Array<{
      month: string;
      monthName: string;
      totalChanges: number;
      totalAccess: number;
      total: number;
    }>;
  }> {
    try {
      const availableMonths = AdminLogger.getAvailableMonths();
      const monthsData = availableMonths.map(month => {
        const report = LogReporter.generateReport(month);
        const monthName = new Date(month + '-01').toLocaleDateString('pt-BR', { 
          year: 'numeric', 
          month: 'long' 
        });
        
        return {
          month,
          monthName,
          totalChanges: report.totalChanges,
          totalAccess: report.totalAccess,
          total: report.totalChanges + report.totalAccess
        };
      });
      
      return {
        success: true,
        totalMonths: availableMonths.length,
        availableMonths,
        summary: LogReporter.generateSummaryReport(),
        monthsData
      };
      
    } catch (error) {
      return {
        success: false,
        totalMonths: 0,
        availableMonths: [],
        summary: '',
        monthsData: []
      };
    }
  }

  private static parseLogLine(line: string) {
    const timestampMatch = line.match(/\[([\d-\s:]+)\]/);
    const ipMatch = line.match(/\[IP: ([^\]]+)\]/);
    const actionMatch = line.match(/\[Action: ([^\]]+)\]/);
    const sectionMatch = line.match(/\[Section: ([^\]]+)\]/);
    const fieldMatch = line.match(/\[Field: ([^\]]+)\]/);
    const statusMatch = line.match(/\[Status: ([^\]]+)\]/);
    const userAgentMatch = line.match(/\[User-Agent: ([^\]]+)\]/);
    const oldMatch = line.match(/\[Old: "([^"]*)"\]/);
    const newMatch = line.match(/\[New: "([^"]*)"\]/);
    const detailsMatch = line.match(/\[Details: ([^\]]+)\]/);

    return {
      timestamp: timestampMatch?.[1] || "",
      ip: ipMatch?.[1] || "",
      action: actionMatch?.[1] || "",
      section: sectionMatch?.[1] || "",
      field: fieldMatch?.[1] || "",
      status: statusMatch?.[1] || "",
      userAgent: userAgentMatch?.[1] || "",
      oldValue: oldMatch?.[1] || "",
      newValue: newMatch?.[1] || "",
      details: detailsMatch?.[1] || "",
    };
  }

  static generateReport(monthYear?: string): LogReport {
    const targetMonth = monthYear || new Date().toISOString().slice(0, 7);
    const changesLogs = AdminLogger.readLogs('changes', targetMonth);
    const accessLogs = AdminLogger.readLogs('access', targetMonth);

    const changes = changesLogs.map(line => {
      const parsed = this.parseLogLine(line);
      return {
        timestamp: parsed.timestamp,
        ip: parsed.ip,
        action: parsed.action,
        section: parsed.section,
        field: parsed.field,
        details: `${parsed.oldValue ? `De: "${parsed.oldValue}" ` : ''}${parsed.newValue ? `Para: "${parsed.newValue}" ` : ''}${parsed.details}`
      };
    });

    const access = accessLogs.map(line => {
      const parsed = this.parseLogLine(line);
      return {
        timestamp: parsed.timestamp,
        ip: parsed.ip,
        action: parsed.action,
        status: parsed.status,
        userAgent: parsed.userAgent,
        details: parsed.details
      };
    });

    return {
      month: targetMonth,
      generatedAt: new Date().toLocaleString('pt-BR'),
      totalChanges: changes.length,
      totalAccess: access.length,
      changes,
      access
    };
  }

  static generateTextReport(monthYear?: string): string {
    const report = this.generateReport(monthYear);
    
    let textReport = '';
    textReport += '═══════════════════════════════════════════════════════════════\n';
    textReport += '                    RELATÓRIO DE LOGS DO SISTEMA\n';
    textReport += '═══════════════════════════════════════════════════════════════\n';
    textReport += `Período: ${new Date(report.month + '-01').toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })}\n`;
    textReport += `Gerado em: ${report.generatedAt}\n`;
    textReport += `Total de Alterações: ${report.totalChanges}\n`;
    textReport += `Total de Acessos: ${report.totalAccess}\n`;
    textReport += '═══════════════════════════════════════════════════════════════\n\n';

    // Seção de Alterações
    textReport += '📝 LOGS DE ALTERAÇÕES\n';
    textReport += '─────────────────────────────────────────────────────────────\n';
    
    if (report.changes.length === 0) {
      textReport += 'Nenhuma alteração registrada neste período.\n\n';
    } else {
      report.changes.forEach((change, index) => {
        textReport += `${index + 1}. ${change.timestamp}\n`;
        textReport += `   IP: ${change.ip}\n`;
        textReport += `   Ação: ${change.action}\n`;
        textReport += `   Seção: ${change.section}\n`;
        textReport += `   Campo: ${change.field}\n`;
        if (change.details.trim()) {
          textReport += `   Detalhes: ${change.details}\n`;
        }
        textReport += '\n';
      });
    }

    // Seção de Acessos
    textReport += '🔐 LOGS DE ACESSO\n';
    textReport += '─────────────────────────────────────────────────────────────\n';
    
    if (report.access.length === 0) {
      textReport += 'Nenhum acesso registrado neste período.\n\n';
    } else {
      report.access.forEach((access, index) => {
        textReport += `${index + 1}. ${access.timestamp}\n`;
        textReport += `   IP: ${access.ip}\n`;
        textReport += `   Ação: ${access.action}\n`;
        textReport += `   Status: ${access.status}\n`;
        if (access.userAgent && access.userAgent !== 'unknown') {
          textReport += `   Navegador: ${access.userAgent.substring(0, 80)}${access.userAgent.length > 80 ? '...' : ''}\n`;
        }
        if (access.details.trim()) {
          textReport += `   Detalhes: ${access.details}\n`;
        }
        textReport += '\n';
      });
    }

    textReport += '═══════════════════════════════════════════════════════════════\n';
    textReport += '                         FIM DO RELATÓRIO\n';
    textReport += '═══════════════════════════════════════════════════════════════\n';

    return textReport;
  }

  static saveTextReport(monthYear?: string): string {
    const report = this.generateTextReport(monthYear);
    const targetMonth = monthYear || new Date().toISOString().slice(0, 7);
    
    // Criar diretório de relatórios se não existir
    const reportsDir = path.join(process.cwd(), 'logs', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filename = `relatorio-logs-${targetMonth}.txt`;
    const filepath = path.join(reportsDir, filename);
    
    fs.writeFileSync(filepath, report, 'utf8');
    
    return filepath;
  }

  static generateSummaryReport(): string {
    const availableMonths = AdminLogger.getAvailableMonths();
    
    let summary = '';
    summary += '═══════════════════════════════════════════════════════════════\n';
    summary += '                    RESUMO GERAL DOS LOGS\n';
    summary += '═══════════════════════════════════════════════════════════════\n';
    summary += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    summary += `Meses com logs: ${availableMonths.length}\n`;
    summary += '═══════════════════════════════════════════════════════════════\n\n';

    availableMonths.forEach(month => {
      const report = this.generateReport(month);
      const monthName = new Date(month + '-01').toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      summary += `📅 ${monthName}\n`;
      summary += `   Alterações: ${report.totalChanges}\n`;
      summary += `   Acessos: ${report.totalAccess}\n`;
      summary += `   Total: ${report.totalChanges + report.totalAccess}\n\n`;
    });

    return summary;
  }

  static saveSummaryReport(): string {
    const summary = this.generateSummaryReport();
    
    const reportsDir = path.join(process.cwd(), 'logs', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filename = 'resumo-geral-logs.txt';
    const filepath = path.join(reportsDir, filename);
    
    fs.writeFileSync(filepath, summary, 'utf8');
    
    return filepath;
  }
}

export default LogReporter;