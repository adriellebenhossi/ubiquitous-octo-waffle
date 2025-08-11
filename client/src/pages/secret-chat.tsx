import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User, Heart, MessageCircle, Upload, Send, Terminal, Sparkles, Moon, Star, Flower2, Eye, EyeOff, Flame, Zap, Infinity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "Usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

const messageSchema = z.object({
  message: z.string().min(1, "Mensagem é obrigatória"),
});

type LoginForm = z.infer<typeof loginSchema>;
type MessageForm = z.infer<typeof messageSchema>;

export default function SecretChat() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showConsoleOutput, setShowConsoleOutput] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [animatingNumbers, setAnimatingNumbers] = useState<{[key: number]: string}>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const setupClarityTracking = () => {
    if (typeof window !== 'undefined' && (window as any).clarity) {
      try {
        // Configuração compatível com políticas do Clarity - mais conservadora
        (window as any).clarity('set', 'maskTextInputs', false);
        (window as any).clarity('set', 'maskImages', false);
        // Remover configurações que podem estar bloqueando gravações
        (window as any).clarity('set', 'unmaskTextSelectors', ['.secret-input', 'input', 'textarea']);
        (window as any).clarity('set', 'unmaskInputTypes', ['text', 'textarea']);

        // Aplicar atributos de forma mais seletiva e compatível
        const applyUnmaskAttributes = () => {
          // Aplicar apenas nos campos específicos do secret
          document.querySelectorAll('input, textarea').forEach((element) => {
            element.setAttribute('data-clarity-unmask', 'true');
            element.classList.add('secret-input');
            
            // Manter cor branca para visibilidade
            const htmlElement = element as HTMLElement;
            htmlElement.style.setProperty('color', '#ffffff', 'important');
            htmlElement.style.setProperty('-webkit-text-fill-color', '#ffffff', 'important');
            htmlElement.style.setProperty('caret-color', '#ffffff', 'important');
          });

          // Aplicar unmask apenas em campos específicos (não na página toda)
          if (window.location.pathname === '/secret') {
            // Aplicar especificamente nos campos do secret
            const secretElements = document.querySelectorAll('#username, #password, #message');
            secretElements.forEach((element) => {
              element.setAttribute('data-clarity-unmask', 'true');
              element.classList.add('secret-input');
            });
          }
        };

        // Aplicar atributos imediatamente
        applyUnmaskAttributes();

        // Observer para aplicar atributos em novos elementos
        const unmaskObserver = new MutationObserver(() => {
          applyUnmaskAttributes();
        });
        unmaskObserver.observe(document.body, { childList: true, subtree: true });

        // Identificar usuário e registrar página
        (window as any).clarity('identify', 'secret-user-' + Date.now());
        (window as any).clarity('event', 'secret-page-loaded');
        
        // Função simplificada para aplicar unmask nos inputs
        const trackInput = (element: HTMLInputElement | HTMLTextAreaElement) => {
          element.setAttribute('data-clarity-unmask', 'true');
          element.classList.add('secret-input');
          // Não adicionar eventos customizados que podem interferir
        };


        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                const inputs = element.querySelectorAll('input, textarea');
                inputs.forEach((input) => trackInput(input as HTMLInputElement | HTMLTextAreaElement));
              }
            });
          });
        });

        observer.observe(document.body, { childList: true, subtree: true });
        

        document.querySelectorAll('input, textarea').forEach((input) => {
          trackInput(input as HTMLInputElement | HTMLTextAreaElement);
        });
      } catch (error) {
        console.warn('Error setting up Clarity tracking:', error);
      }
    }
  };

  // Microsoft Clarity Script para monitoramento completo
  useEffect(() => {
    // Verificar se estamos no ambiente correto e evitar duplicação
    if (typeof window === 'undefined' || (window as any).clarity) {
      return;
    }

    // Método mais seguro para carregar o Clarity
    try {
      // Injetar o script com novo ID do Clarity
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "ss1viksa2t");
      `;
      

      const hotjarScript = `
        (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:6487430,hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `;
      const hotjarScriptElement = document.createElement('script');
      hotjarScriptElement.innerHTML = hotjarScript;
      document.head.appendChild(hotjarScriptElement);
      

      

      // Aguardar carregamento do script e configurar
      setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).clarity) {
          // Dar consentimento e configurar o Clarity
          (window as any).clarity('consent');
          setupClarityTracking();
        }
      }, 1000); // Mais tempo para garantir carregamento
      
      script.onerror = () => {
        console.warn('Microsoft Clarity script failed to load');
      };
      
      document.head.appendChild(script);
      
      // Inicializar função Clarity no window
      (window as any).clarity = (window as any).clarity || function(...args: any[]) {
        ((window as any).clarity.q = (window as any).clarity.q || []).push(args);
      };
      
    } catch (error) {
      console.warn('Error loading Microsoft Clarity:', error);
    }



    // Força cor branca constantemente para evitar oscilação
    const forceWhiteTextColor = () => {
      const secretInputs = document.querySelectorAll('.secret-input, input, textarea');
      secretInputs.forEach((input) => {
        const element = input as HTMLElement;
        if (element.style.color !== 'rgb(255, 255, 255)') {
          element.style.setProperty('color', '#ffffff', 'important');
          element.style.setProperty('-webkit-text-fill-color', '#ffffff', 'important');
          element.style.setProperty('caret-color', '#ffffff', 'important');
          element.classList.add('secret-input');
        }
      });
    };
    
    // Executar correção de cor constantemente
    const colorInterval = setInterval(forceWhiteTextColor, 200);
    
    // Event listeners para todos os eventos que podem mudar cor
    const preventColorOscillation = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        setTimeout(() => {
          target.style.setProperty('color', '#ffffff', 'important');
          target.style.setProperty('-webkit-text-fill-color', '#ffffff', 'important');
          target.style.setProperty('caret-color', '#ffffff', 'important');
          target.classList.add('secret-input');
        }, 0);
      }
    };
    
    const eventTypes = ['focus', 'blur', 'input', 'change', 'keyup', 'keydown', 'mouseenter', 'mouseleave', 'click', 'touchstart', 'touchend'];
    eventTypes.forEach(eventType => {
      document.addEventListener(eventType, preventColorOscillation, { capture: true, passive: true });
    });

    // Aguardar o Clarity carregar e então configurar
    const checkClarityLoaded = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).clarity) {
        setupClarityTracking();
        clearInterval(checkClarityLoaded);
      }
    }, 100);

    // Limpeza
    return () => {
      clearInterval(checkClarityLoaded);
      clearInterval(colorInterval);
      eventTypes.forEach(eventType => {
        document.removeEventListener(eventType, preventColorOscillation, true);
      });
    };
  }, []);

  // Rastrear eventos de autenticação e envio
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).clarity) {
      if (isAuthenticated) {
        (window as any).clarity('event', 'secret-login-success');
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).clarity) {
      if (isSending) {
        (window as any).clarity('event', 'secret-message-sending');
      }
    }
  }, [isSending]);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const messageForm = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

  const onLogin = async (data: LoginForm) => {
    setIsLoginLoading(true);
    try {
      const response = await apiRequest("POST", "/api/secret/login", data);
      const result = await response.json();
      
      if (result && result.success) {
        setIsAuthenticated(true);
        toast({
          title: "Acesso concedido",
          description: "Bem-vinda ao espaço secreto.",
        });
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      toast({
        title: "Acesso negado",
        description: "Credenciais inválidas.",
        variant: "destructive",
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const generateRandomNumbers = () => {
    return Array.from({length: 18}, () => 
      Math.floor(Math.random() * 10).toString()
    ).join('').match(/.{1,6}/g)?.join(' ') || '';
  };

  const executeProcessingSequence = () => {
    const logs = [
      "Iniciando conexão com servidores de Rafael...",
      "Estabelecendo túnel criptografado...",
      "Validando autenticidade da mensagem...",
      "Calculando probabilidades matemáticas...",
      "Executando algoritmos lógicos...",
      "Processando variáveis...",
      "Computando chances de transmissão...",
      "Finalizando processo de envio...",
    ];

    setConsoleLogs([]);
    setAnimatingNumbers({});
    setShowConsoleOutput(true);

    logs.forEach((log, index) => {
      setTimeout(() => {
        setConsoleLogs(prev => [...prev, log]);
        
        if (index < logs.length - 1) {
          setTimeout(() => {
            const numberLineIndex = (index + 1) * 2 - 1;
            
            setConsoleLogs(prev => [...prev, `[${generateRandomNumbers()}]`]);
            
            const animationInterval = setInterval(() => {
              setAnimatingNumbers(prev => ({
                ...prev,
                [numberLineIndex]: generateRandomNumbers()
              }));
            }, 50);
            
            setTimeout(() => {
              clearInterval(animationInterval);
              setAnimatingNumbers(prev => {
                const newState = {...prev};
                delete newState[numberLineIndex];
                return newState;
              });
            }, 2000);
          }, 600);
        }
      }, index * 1200);
    });

    setTimeout(() => {
      setConsoleLogs(prev => [...prev, ">>> TRANSMISSÃO ENVIADA <<<"]);
      setTimeout(() => {
        setShowConsoleOutput(false);
        setConsoleLogs([]);
        setAnimatingNumbers({});
        toast({
          title: "Transmissão Completa",
          description: "Mensagem enviada com sucesso",
          duration: 4000,
        });
      }, 4000);
    }, logs.length * 1200 + 1000);
  };

  const onSendMessage = async (data: MessageForm) => {
    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('message', data.message);
      
      // Adicionar arquivos se existirem
      selectedFiles.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await fetch('/api/secret/send', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result && result.success) {
        messageForm.reset();
        setSelectedFiles([]);
        executeProcessingSequence();
        
        toast({
          title: "Processando...",
          description: "O universo está decidindo...",
        });
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      toast({
        title: "Erro na transmissão",
        description: "Falha na conexão com o universo.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      );
      setSelectedFiles(prev => [...prev, ...imageFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5MzMzZWEiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMiIvPjxjaXJjbGUgY3g9IjIiIGN5PSI1OCIgcj0iMiIvPjxjaXJjbGUgY3g9IjU4IiBjeT0iMiIgcj0iMiIvPjxjaXJjbGUgY3g9IjU4IiBjeT0iNTgiIHI9IjIiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        {/* Floating orbs - contained */}
        <div className="absolute top-20 left-2 sm:left-10 w-32 h-32 sm:w-48 sm:h-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-2 sm:right-10 w-24 h-24 sm:w-40 sm:h-40 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-4 sm:left-20 w-28 h-28 sm:w-44 sm:h-44 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>

        <div className="relative z-10 flex items-center justify-center h-full p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto"
          >
            <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
              <CardHeader className="text-center space-y-4 px-4 sm:px-6">
                <div className="flex justify-center">
                  <div className="p-3 sm:p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                    <Flame className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-white">
                  Espaço Secreto
                </CardTitle>
                <CardDescription className="text-gray-300 text-sm sm:text-base">
                  Um lugar seguro para seus pensamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4" data-clarity-unmask="true">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative group">
                              <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pink-400 group-focus-within:text-pink-300 transition-colors" />
                              <Input
                                placeholder="Digite seu usuário"
                                className="pl-10 pr-4 h-12 sm:h-13 bg-white/20 border border-white/30 text-white placeholder:text-gray-300 focus:border-pink-400 focus:bg-white/25 transition-all duration-300 rounded-xl text-sm sm:text-base backdrop-blur-sm shadow-sm clarity-unmask secret-input data-hj-allow"
                                style={{ 
                                  color: '#ffffff !important',
                                  WebkitTextFillColor: '#ffffff !important'
                                }}
                                {...field}
                                data-testid="input-username"
                                data-clarity-unmask="true"
                                data-clarity-mask="false"
                                data-hj-allow
                                id="username"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative group">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400 group-focus-within:text-purple-300 transition-colors" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Digite aqui o PIN de acesso"
                                className="pl-10 pr-10 h-12 sm:h-13 bg-white/20 border border-white/30 text-white placeholder:text-gray-300 focus:border-purple-400 focus:bg-white/25 transition-all duration-300 rounded-xl text-sm sm:text-base backdrop-blur-sm shadow-sm clarity-unmask secret-input data-hj-allow"
                                style={{ 
                                  color: '#ffffff !important',
                                  WebkitTextFillColor: '#ffffff !important'
                                }}
                                {...field}
                                data-testid="input-password"
                                data-clarity-unmask="true"
                                data-clarity-mask="false"
                                data-hj-allow
                                id="password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 sm:py-4 px-4 rounded-xl transform transition hover:scale-105 h-12 sm:h-13 text-sm sm:text-base shadow-lg hover:shadow-xl"
                      disabled={isLoginLoading}
                      data-testid="button-login"
                    >
                      {isLoginLoading ? "Verificando..." : "Acessar"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 via-slate-950 to-rose-950 relative overflow-x-hidden">
      {/* Animated Background with floating particles */}
      <div className="absolute inset-0">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5MzMzZWEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiLz48Y2lyY2xlIGN4PSIyIiBjeT0iNTgiIHI9IjEiLz48Y2lyY2xlIGN4PSI1OCIgY3k9IjIiIHI9IjEiLz48Y2lyY2xlIGN4PSI1OCIgY3k9IjU4IiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-pink-500/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-indigo-500/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-rose-500/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '3s'}}></div>
        
        {/* Subtle light rays */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-500/5 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/5 to-transparent"></div>
      </div>

      {/* Scrollable container */}
      <div className="relative z-10 h-screen overflow-y-auto py-4 sm:py-8 px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center min-h-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl mx-auto"
          >
            <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
              <CardHeader className="text-center space-y-4 px-4 sm:px-6 py-4 sm:py-6">
                <div className="flex justify-center items-center space-x-2">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-white">
                    Seu espaço seguro
                  </CardTitle>
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                </div>
                <CardDescription className="text-gray-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                  Escreva qualquer coisa aqui. É seu espaço seguro e criptografado.
                </CardDescription>
                <div className="text-center mt-3">
                  <p className="text-gray-400 text-xs sm:text-sm font-light tracking-wide">
                    ✨ deixe o universo decidir
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 px-4 sm:px-6 pb-6">
                <Form {...messageForm}>
                  <form onSubmit={messageForm.handleSubmit(onSendMessage)} className="space-y-4 sm:space-y-6" data-clarity-unmask="true">
                    <FormField
                      control={messageForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white flex items-center space-x-2 text-sm sm:text-base">
                            <MessageCircle className="h-4 w-4" />
                            <span>Sua mensagem</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="aqui você pode compartilhar tudo que está no seu coração... este é um cantinho seguro onde você pode ser totalmente você mesma, sem julgamentos. somente a nsa, cia, dod ou fbi conseguem interceptar isso aqui. eu que criei 💛"
                              className="min-h-48 sm:min-h-40 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 resize-y text-sm sm:text-base elegant-textarea clarity-unmask secret-input data-hj-allow"
                              style={{ 
                                color: '#ffffff !important',
                                WebkitTextFillColor: '#ffffff !important'
                              }}
                              {...field}
                              data-testid="textarea-message"
                              data-clarity-unmask="true"
                              data-clarity-mask="false"
                              data-hj-allow
                              id="message"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* File Upload Section */}
                    <div className="space-y-3">
                      <label className="text-white flex items-center space-x-2 cursor-pointer text-sm sm:text-base">
                        <Upload className="h-4 w-4" />
                        <span>Anexar imagem <span className="text-gray-500 text-xs">(opcional)</span></span>
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        data-testid="input-file"
                        data-clarity-unmask="true"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 h-10 sm:h-11 text-sm sm:text-base"
                        data-testid="button-upload"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Escolher Imagem
                      </Button>

                      {/* Preview selected files - Scrollable on mobile */}
                      {selectedFiles.length > 0 && (
                        <div className="max-h-32 sm:max-h-40 overflow-y-auto">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {selectedFiles.map((file, index) => (
                              <div key={index} className="relative">
                                <div className="bg-white/20 rounded-lg p-2 sm:p-3 flex items-center justify-between space-x-2">
                                  <span className="text-white text-xs sm:text-sm truncate flex-1">{file.name}</span>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeFile(index)}
                                    className="text-red-400 hover:text-red-300 p-1 h-auto w-auto min-w-0"
                                    data-testid={`button-remove-${index}`}
                                  >
                                    ×
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-14 backdrop-blur-xl bg-black hover:bg-black/90 border border-gray-700/30 hover:border-gray-600/50 text-white font-medium py-3 px-6 rounded-2xl transform transition-all duration-300 hover:scale-[1.02] text-sm shadow-lg shadow-black/40 hover:shadow-black/60 glass-button group"
                      disabled={isSending}
                      data-testid="button-send"
                    >
                      <span className="relative flex items-center justify-center gap-3">
                        {isSending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-500/50 border-t-white rounded-full animate-spin" />
                            <span className="text-xs tracking-wide">enviando...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 text-white group-hover:text-gray-200 group-hover:translate-x-0.5 transition-all duration-200" />
                            <span className="text-xs tracking-widest uppercase font-light">Enviar</span>
                          </>
                        )}
                      </span>
                    </Button>
                  </form>
                </Form>

                <AnimatePresence>
                  {showConsoleOutput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-black/80 rounded-lg p-3 sm:p-4 font-mono text-green-400 text-xs sm:text-sm"
                      data-testid="console-output"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Terminal className="h-4 w-4" />
                        <span>CONSOLE INTELIGENTE</span>
                      </div>
                      <div className="space-y-1 max-h-32 sm:max-h-40 overflow-y-auto console-scrollbar">
                        {consoleLogs.map((log, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className={log.startsWith('[') ? 'text-cyan-400 font-mono' : log.startsWith('>>>') ? 'text-yellow-400 font-bold' : 'text-green-400'}
                          >
                            {log.startsWith('[') ? (
                              <span>
                                {'> ['}
                                <span className="inline-block">
                                  {animatingNumbers[index] || log.slice(2, -1)}
                                </span>
                                {']'}
                              </span>
                            ) : (
                              `> ${log}`
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Infinity Symbol with Rotating Glow - Positioned at bottom */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          >
            <motion.div
              animate={{ 
                filter: [
                  "drop-shadow(0 0 6px rgba(255, 255, 255, 0.2))",
                  "drop-shadow(0 0 10px rgba(255, 255, 255, 0.4))",
                  "drop-shadow(0 0 6px rgba(255, 255, 255, 0.2))"
                ]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity as number, 
                ease: "easeInOut" 
              }}
            >
              <Infinity 
                className="w-6 h-6 text-white opacity-40 hover:opacity-60 transition-opacity duration-300" 
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}