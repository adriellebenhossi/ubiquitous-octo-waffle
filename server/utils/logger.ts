/**
 * Sistema de Logs para o Espaço administrativo
 * Registra alterações e acessos com informações detalhadas
 */

import fs from 'fs';
import path from 'path';

// Criar diretório de logs se não existir
const logsDir = path.join(process.cwd(), 'logs');
const adminLogsDir = path.join(logsDir, 'admin');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

if (!fs.existsSync(adminLogsDir)) {
  fs.mkdirSync(adminLogsDir, { recursive: true });
}

interface LogEntry {
  timestamp: string;
  ip: string;
  userAgent?: string;
  action: string;
  section?: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  status?: string;
  details?: string;
}

export class AdminLogger {
  private static formatTimestamp(): string {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  }

  private static getMonthYear(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private static writeLog(filename: string, entry: string): void {
    const logPath = path.join(adminLogsDir, filename);
    const logEntry = `${entry}\n`;
    
    fs.appendFileSync(logPath, logEntry, 'utf8');
  }

  // Log de alterações no espaço administrativo
  static logAdminChange(data: LogEntry): void {
    const monthYear = this.getMonthYear();
    const filename = `admin-changes-${monthYear}.log`;
    
    let logEntry = `[${data.timestamp}]`;
    logEntry += ` [IP: ${data.ip}]`;
    logEntry += ` [Action: ${data.action}]`;
    
    if (data.section) logEntry += ` [Section: ${data.section}]`;
    if (data.field) logEntry += ` [Field: ${data.field}]`;
    if (data.oldValue !== undefined) logEntry += ` [Old: "${data.oldValue}"]`;
    if (data.newValue !== undefined) logEntry += ` [New: "${data.newValue}"]`;
    if (data.details) logEntry += ` [Details: ${data.details}]`;

    this.writeLog(filename, logEntry);
  }

  // Log de acessos ao espaço administrativo
  static logAdminAccess(data: LogEntry): void {
    const monthYear = this.getMonthYear();
    const filename = `admin-access-${monthYear}.log`;
    
    let logEntry = `[${data.timestamp}]`;
    logEntry += ` [IP: ${data.ip}]`;
    if (data.userAgent) logEntry += ` [User-Agent: ${data.userAgent}]`;
    logEntry += ` [Action: ${data.action}]`;
    if (data.status) logEntry += ` [Status: ${data.status}]`;
    if (data.details) logEntry += ` [Details: ${data.details}]`;

    this.writeLog(filename, logEntry);
  }

  // Método helper para extrair IP da requisição
  static getClientIP(req: any): string {
    return req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress ||
           req.ip ||
           'unknown';
  }

  // Método helper para registrar alteração com detalhes automáticos
  static logChange(req: any, section: string, field: string, oldValue: any, newValue: any): void {
    this.logAdminChange({
      timestamp: this.formatTimestamp(),
      ip: this.getClientIP(req),
      action: 'UPDATE',
      section,
      field,
      oldValue: typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue),
      newValue: typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue)
    });
  }

  // Método helper para registrar acesso
  static logAccess(req: any, action: 'LOGIN' | 'LOGOUT' | 'ACCESS', status: 'SUCCESS' | 'FAILED' | 'ATTEMPT', details?: string): void {
    this.logAdminAccess({
      timestamp: this.formatTimestamp(),
      ip: this.getClientIP(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      action,
      status,
      details
    });
  }

  // Método para criar log de criação de item
  static logCreate(req: any, section: string, itemId: string, data: any): void {
    this.logAdminChange({
      timestamp: this.formatTimestamp(),
      ip: this.getClientIP(req),
      action: 'CREATE',
      section,
      field: itemId,
      newValue: typeof data === 'object' ? JSON.stringify(data) : String(data),
      details: `Created new ${section} item`
    });
  }

  // Método para criar log de exclusão de item
  static logDelete(req: any, section: string, itemId: string, data?: any): void {
    this.logAdminChange({
      timestamp: this.formatTimestamp(),
      ip: this.getClientIP(req),
      action: 'DELETE',
      section,
      field: itemId,
      oldValue: typeof data === 'object' ? JSON.stringify(data) : String(data),
      details: `Deleted ${section} item`
    });
  }

  // Método para ler logs (para exibição no painel admin)
  static readLogs(type: 'changes' | 'access', monthYear?: string): string[] {
    const targetMonth = monthYear || this.getMonthYear();
    const filename = `admin-${type}-${targetMonth}.log`;
    const logPath = path.join(adminLogsDir, filename);
    
    try {
      if (fs.existsSync(logPath)) {
        const content = fs.readFileSync(logPath, 'utf8');
        return content.split('\n').filter(line => line.trim() !== '').reverse(); // Mais recentes primeiro
      }
    } catch (error) {
      console.error(`Erro ao ler log ${filename}:`, error);
    }
    
    return [];
  }

  // Método para listar meses disponíveis
  static getAvailableMonths(): string[] {
    try {
      const files = fs.readdirSync(adminLogsDir);
      const months = new Set<string>();
      
      files.forEach(file => {
        const match = file.match(/admin-(?:changes|access)-(\d{4}-\d{2})\.log/);
        if (match) {
          months.add(match[1]);
        }
      });
      
      return Array.from(months).sort().reverse(); // Mais recentes primeiro
    } catch (error) {
      console.error('Erro ao listar meses disponíveis:', error);
      return [];
    }
  }
}

export default AdminLogger;