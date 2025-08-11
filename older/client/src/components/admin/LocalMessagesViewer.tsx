/**
 * LocalMessagesViewer.tsx
 * 
 * Visualizador de mensagens armazenadas localmente
 * Contorna problema de API interceptada pelo Vite
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Trash2, Copy, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LocalMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  type: string;
  timestamp: string;
  emailData?: {
    to: string;
    from: string;
    subject: string;
    text: string;
    replyTo: string;
  };
  status?: string;
}

export function LocalMessagesViewer() {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const { toast } = useToast();

  // Carregar mensagens do localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('pendingMessages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
      }
    }
  }, []);

  // Limpar todas as mensagens
  const clearAllMessages = () => {
    localStorage.removeItem('pendingMessages');
    setMessages([]);
    toast({
      title: "Mensagens limpa",
      description: "Todas as mensagens foram removidas do armazenamento local.",
    });
  };

  // Copiar dados do email para clipboard
  const copyEmailData = (message: LocalMessage) => {
    if (message.emailData) {
      const emailText = `Para: ${message.emailData.to}
De: ${message.emailData.from}
Assunto: ${message.emailData.subject}
Reply-To: ${message.emailData.replyTo}

${message.emailData.text}`;
      
      navigator.clipboard.writeText(emailText);
      toast({
        title: "Copiado!",
        description: "Dados do email foram copiados para o clipboard.",
      });
    }
  };

  // Remover mensagem específica
  const removeMessage = (id: number) => {
    const updatedMessages = messages.filter(msg => msg.id !== id);
    setMessages(updatedMessages);
    localStorage.setItem('pendingMessages', JSON.stringify(updatedMessages));
    toast({
      title: "Mensagem removida",
      description: "A mensagem foi removida do armazenamento local.",
    });
  };

  // Formatar tipo da mensagem
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'support': 'Suporte',
      'contact': 'Contato',
      'feedback': 'Feedback',
      'bug': 'Bug Report',
      'feature': 'Feature Request'
    };
    return labels[type] || 'Geral';
  };

  // Cores por tipo
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'support': 'bg-blue-100 text-blue-800',
      'contact': 'bg-green-100 text-green-800',
      'feedback': 'bg-yellow-100 text-yellow-800',
      'bug': 'bg-red-100 text-red-800',
      'feature': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Mail className="w-4 h-4 text-white" />
              </div>
              Mensagens Armazenadas Localmente
            </CardTitle>
            {messages.length > 0 && (
              <Button
                onClick={clearAllMessages}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Limpar Todas
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <Alert>
              <Mail className="w-4 h-4" />
              <AlertDescription>
                Nenhuma mensagem armazenada localmente. 
                As mensagens aparecerão aqui quando o formulário for usado.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <Alert>
                <Send className="w-4 h-4" />
                <AlertDescription>
                  <strong>{messages.length} mensagem(s)</strong> pendente(s). 
                  Devido a problemas na API, estas mensagens estão salvas localmente.
                  Use "Copiar email" para enviar manualmente para <strong>rafaelhorvan@hotmail.com</strong>.
                </AlertDescription>
              </Alert>

              {messages.map((message) => (
                <Card key={message.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(message.type)}>
                          {getTypeLabel(message.type)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(message.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => copyEmailData(message)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Copiar Email
                        </Button>
                        <Button
                          onClick={() => removeMessage(message.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Nome:</span>
                        <p>{message.name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Email:</span>
                        <p>{message.email}</p>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Mensagem:</span>
                      <p className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                        {message.message}
                      </p>
                    </div>
                    {message.emailData && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-600 font-medium mb-1">
                          Dados preparados para envio:
                        </p>
                        <p className="text-xs text-blue-800">
                          <strong>Para:</strong> {message.emailData.to}<br/>
                          <strong>Assunto:</strong> {message.emailData.subject}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}