/**
 * LogsManager.tsx
 * 
 * Componente para visualizar logs do painel administrativo
 * Mostra logs de alterações e acessos com filtros por mês
 * Interface responsiva com informações detalhadas
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Activity, Calendar, Clock, User, Settings, Eye, Shield, AlertCircle } from "lucide-react";
import { ResponsiveAdminContainer } from "./base/ResponsiveAdminContainer";

interface LogsData {
  logs: string[];
  months: string[];
}

export function LogsManager() {
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // Query para logs de alterações
  const { data: changesData, isLoading: changesLoading } = useQuery<LogsData>({
    queryKey: ["/api/admin/logs/changes", selectedMonth],
    queryFn: async () => {
      const url = selectedMonth 
        ? `/api/admin/logs/changes?month=${selectedMonth}`
        : "/api/admin/logs/changes";
      const response = await fetch(url);
      return response.json();
    },
  });

  // Query para logs de acesso
  const { data: accessData, isLoading: accessLoading } = useQuery<LogsData>({
    queryKey: ["/api/admin/logs/access", selectedMonth],
    queryFn: async () => {
      const url = selectedMonth 
        ? `/api/admin/logs/access?month=${selectedMonth}`
        : "/api/admin/logs/access";
      const response = await fetch(url);
      return response.json();
    },
  });

  const availableMonths = changesData?.months || accessData?.months || [];

  // Função para parsear uma linha de log
  const parseLogLine = (line: string) => {
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
      rawLine: line
    };
  };

  // Função para obter badge de status
  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
        return <Badge variant="default" className="bg-green-100 text-green-800">Sucesso</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Falha</Badge>;
      case 'ATTEMPT':
        return <Badge variant="secondary">Tentativa</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Função para obter badge de ação
  const getActionBadge = (action: string) => {
    switch (action.toUpperCase()) {
      case 'LOGIN':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Login</Badge>;
      case 'LOGOUT':
        return <Badge variant="outline">Logout</Badge>;
      case 'ACCESS':
        return <Badge variant="secondary">Acesso</Badge>;
      case 'CREATE':
        return <Badge variant="default" className="bg-green-100 text-green-800">Criar</Badge>;
      case 'UPDATE':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Atualizar</Badge>;
      case 'DELETE':
        return <Badge variant="destructive">Excluir</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  // Componente para renderizar log de alteração
  const ChangeLogItem = ({ logLine }: { logLine: string }) => {
    const parsed = parseLogLine(logLine);
    
    return (
      <div className="border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-500" />
            {getActionBadge(parsed.action)}
            {parsed.section && (
              <Badge variant="outline" className="text-xs">
                {parsed.section}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {parsed.timestamp}
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600">IP:</span>
            <code className="bg-gray-100 px-1 rounded text-xs">{parsed.ip}</code>
          </div>
          
          {parsed.field && (
            <div>
              <span className="font-medium text-gray-700">Campo:</span>
              <span className="ml-2">{parsed.field}</span>
            </div>
          )}
          
          {parsed.oldValue && (
            <div>
              <span className="font-medium text-red-600">Valor Anterior:</span>
              <div className="ml-4 mt-1 p-2 bg-red-50 rounded text-xs font-mono max-w-full overflow-x-auto">
                {parsed.oldValue.length > 100 ? `${parsed.oldValue.substring(0, 100)}...` : parsed.oldValue}
              </div>
            </div>
          )}
          
          {parsed.newValue && (
            <div>
              <span className="font-medium text-green-600">Valor Novo:</span>
              <div className="ml-4 mt-1 p-2 bg-green-50 rounded text-xs font-mono max-w-full overflow-x-auto">
                {parsed.newValue.length > 100 ? `${parsed.newValue.substring(0, 100)}...` : parsed.newValue}
              </div>
            </div>
          )}
          
          {parsed.details && (
            <div>
              <span className="font-medium text-gray-700">Detalhes:</span>
              <span className="ml-2 text-gray-600">{parsed.details}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Componente para renderizar log de acesso
  const AccessLogItem = ({ logLine }: { logLine: string }) => {
    const parsed = parseLogLine(logLine);
    
    return (
      <div className="border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-500" />
            {getActionBadge(parsed.action)}
            {parsed.status && getStatusBadge(parsed.status)}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {parsed.timestamp}
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600">IP:</span>
            <code className="bg-gray-100 px-1 rounded text-xs">{parsed.ip}</code>
          </div>
          
          {parsed.userAgent && (
            <div>
              <span className="font-medium text-gray-700">User-Agent:</span>
              <div className="ml-4 mt-1 p-2 bg-gray-50 rounded text-xs font-mono max-w-full overflow-x-auto">
                {parsed.userAgent.length > 100 ? `${parsed.userAgent.substring(0, 100)}...` : parsed.userAgent}
              </div>
            </div>
          )}
          
          {parsed.details && (
            <div>
              <span className="font-medium text-gray-700">Detalhes:</span>
              <span className="ml-2 text-gray-600">{parsed.details}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ResponsiveAdminContainer
      title="Logs do Sistema"
      icon={<Activity className="w-5 h-5 text-white" />}
      description="Visualize logs de alterações e acessos do painel administrativo"
    >
      <div className="space-y-6">
        {/* Filtro por mês */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecionar mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Mês atual</SelectItem>
              {availableMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {new Date(month + '-01').toLocaleDateString('pt-BR', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="changes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="changes" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Alterações
            </TabsTrigger>
            <TabsTrigger value="access" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Acessos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="changes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Logs de Alterações
                </CardTitle>
                <CardDescription>
                  Registro de todas as modificações feitas no painel administrativo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] w-full">
                  {changesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-gray-500">Carregando logs...</div>
                    </div>
                  ) : changesData?.logs.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-gray-500">Nenhum log de alteração encontrado</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {changesData?.logs.map((line, index) => (
                        <ChangeLogItem key={index} logLine={line} />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="access" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Logs de Acesso
                </CardTitle>
                <CardDescription>
                  Registro de logins e acessos ao painel administrativo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] w-full">
                  {accessLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-gray-500">Carregando logs...</div>
                    </div>
                  ) : accessData?.logs.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-gray-500">Nenhum log de acesso encontrado</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {accessData?.logs.map((line, index) => (
                        <AccessLogItem key={index} logLine={line} />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveAdminContainer>
  );
}

export default LogsManager;