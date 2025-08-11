import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Sparkles, Flower, ArrowLeft, Star, Crown, Gem, Flower2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, "Usuário é obrigatório"),
  password: z.string().min(1, "PIN é obrigatório"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      console.log("Tentando login com:", data);
      const response = await apiRequest("POST", "/api/admin/login", data);
      const result = await response.json();
      console.log("Resposta da API:", result);
      
      if (result && result.success) {
        localStorage.setItem("admin_logged_in", "true");
        localStorage.setItem("admin_user", JSON.stringify(result.admin));
        setLocation("/09806446909/dashboard");
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      toast({
        title: "Erro no login",
        description: "Credenciais inválidas. Verifique usuário e PIN.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Elementos decorativos femininos */}
      <div className="absolute inset-0">
        {/* Padrão de ícones elegantes - responsivo */}
        <div className="absolute top-8 sm:top-12 left-4 sm:left-8 w-12 sm:w-16 h-12 sm:h-16 opacity-25">
          <Crown className="w-full h-full text-rose-400" />
        </div>
        <div className="absolute top-16 sm:top-20 right-8 sm:right-16 w-10 sm:w-12 h-10 sm:h-12 opacity-30">
          <Gem className="w-full h-full text-pink-400" />
        </div>
        <div className="absolute top-32 sm:top-40 left-12 sm:left-24 w-10 sm:w-14 h-10 sm:h-14 opacity-20">
          <Star className="w-full h-full text-purple-400" />
        </div>
        <div className="absolute top-2/3 sm:top-3/4 right-6 sm:right-8 w-12 sm:w-18 h-12 sm:h-18 opacity-25">
          <Flower2 className="w-full h-full text-rose-300" />
        </div>
        <div className="absolute bottom-16 sm:bottom-24 left-6 sm:left-16 w-14 sm:w-20 h-14 sm:h-20 opacity-20">
          <Sparkles className="w-full h-full text-pink-300" />
        </div>
        <div className="absolute bottom-8 sm:bottom-32 right-16 sm:right-24 w-10 sm:w-14 h-10 sm:h-14 opacity-30">
          <Heart className="w-full h-full text-purple-300" />
        </div>
        <div className="absolute top-1/2 right-2 sm:right-4 w-8 sm:w-10 h-8 sm:h-10 opacity-35">
          <Zap className="w-full h-full text-rose-400" />
        </div>
        <div className="absolute bottom-12 sm:bottom-16 left-1/4 sm:left-1/3 w-10 sm:w-12 h-10 sm:h-12 opacity-25">
          <Star className="w-full h-full text-pink-400" />
        </div>
        
        {/* Círculos suaves flutuantes */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-rose-200/30 to-pink-200/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-40 h-40 bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full blur-xl animate-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-gradient-to-br from-purple-200/25 to-rose-200/25 rounded-full blur-xl animate-float" style={{ animationDelay: '1.5s' }}></div>


      </div>

      {/* Container principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-full max-w-lg"
        >
          {/* Card principal com glass-morphism delicado */}
          <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl shadow-2xl p-10 relative overflow-hidden">
            {/* Efeito de brilho suave */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-100/30 via-pink-100/20 to-purple-100/30 rounded-3xl"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-3xl"></div>
            
            {/* Header delicado */}
            <div className="relative z-10 text-center mb-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 10 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 via-pink-400 to-purple-400 mb-6 shadow-xl relative"
              >
                <Heart className="w-10 h-10 text-white" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>

              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-3xl font-light text-gray-700 mb-3"
              >
                <span className="font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Espaço administrativo
                </span>
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-center gap-2 text-gray-600"
              >
                <span className="text-sm font-medium">Dra. Adrielle Benhossi</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </motion.div>
            </div>

            {/* Formulário elegante */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-600 font-medium flex items-center gap-2">
                          <Flower className="w-4 h-4 text-rose-400" />
                          Usuário
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                              <Heart className="w-5 h-5 text-rose-400 group-focus-within:text-rose-500 transition-colors" />
                            </div>
                            <Input 
                              placeholder="Digite seu usuário" 
                              className="pl-12 pr-6 h-12 bg-white/60 border-2 border-white/50 text-gray-700 placeholder:text-gray-400 focus:bg-white/80 focus:border-rose-300 transition-all duration-500 rounded-2xl backdrop-blur-sm shadow-lg font-medium group-hover:shadow-xl group-focus-within:shadow-xl group-focus-within:scale-[1.02]" 
                              {...field} 
                            />
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-rose-500 font-medium" />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-600 font-medium flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-pink-400" />
                          PIN de Acesso
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                              <Sparkles className="w-5 h-5 text-pink-400 group-focus-within:text-pink-500 transition-colors" />
                            </div>
                            <Input 
                              type="password"
                              placeholder="Digite seu PIN..." 
                              className="pl-12 pr-6 h-12 bg-white/60 border-2 border-white/50 text-gray-700 placeholder:text-gray-400 focus:bg-white/80 focus:border-rose-300 transition-all duration-500 rounded-2xl backdrop-blur-sm shadow-lg font-medium tracking-wider group-hover:shadow-xl group-focus-within:shadow-xl group-focus-within:scale-[1.02]" 
                              {...field} 
                            />
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-rose-500 font-medium" />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 hover:from-rose-500 hover:via-pink-500 hover:to-purple-500 text-white font-semibold text-lg rounded-2xl shadow-xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                    disabled={isLoading}
                  >
                    {/* Efeito de brilho no botão */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    {isLoading ? (
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Acessando seu espaço...</span>
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center relative z-10">
                        <span>Acessar</span>
                      </div>
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>

            {/* Link de retorno delicado */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="mt-8 text-center relative z-10"
            >
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-gray-500 hover:text-rose-500 text-sm font-medium transition-all duration-300 group hover:bg-white/30 px-4 py-2 rounded-full"
              >
                <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300" />
                <span>Voltar ao site principal</span>
                <Star className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>

            {/* Detalhes decorativos */}
            <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-rose-200/30 to-pink-200/30 rounded-full blur-lg"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-purple-200/20 to-rose-200/20 rounded-full blur-lg"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}