/**
 * App.tsx
 * 
 * Componente raiz da aplicação React
 * Configura roteamento e providers globais
 * Define as rotas disponíveis no site
 */

import { useEffect } from "react";
import { Switch, Route } from "wouter"; // Sistema de rotas client-side
import { queryClient } from "./lib/queryClient"; // Cliente configurado para requisições
import { QueryClientProvider } from "@tanstack/react-query"; // Provider de estado servidor
import { Toaster } from "@/components/ui/toaster"; // Notificações toast
import { TooltipProvider } from "@/components/ui/tooltip"; // Provider de tooltips
import Home from "@/pages/home"; // Página principal
import NotFound from "@/pages/not-found"; // Página 404
import AdminLogin from "@/pages/admin-login"; // Login administrativo
import AdminDashboard from "@/pages/admin-dashboard"; // Painel administrativo
import SecretChat from "@/pages/secret-chat"; // Chat secreto
import PrivacyPolicyPage from "@/pages/privacy-policy"; // Página de política de privacidade
import TermsOfUsePage from "@/pages/terms-of-use"; // Página de termos de uso
import ArticlesPage from "@/pages/articles"; // Página de listagem de artigos
import ArticlePage from "@/pages/article"; // Página individual de artigo
import { useTheme } from "@/hooks/useTheme"; // Hook para aplicar cores dinâmicas
import MarketingPixels from "@/components/MarketingPixels"; // Pixels de marketing dinâmicos
import { CustomCodesRenderer } from "@/components/CustomCodesRenderer"; // Renderizar códigos customizados
import { CookieConsent } from "@/components/CookieConsent"; // Pop-up de consentimento de cookies
import { SEOHead } from "@/components/SEOHead"; // Meta tags SEO dinâmicas
import { loadSiteFavicon } from "@/utils/favicon";

// Componente de roteamento da aplicação
function Router() {
  // Carrega e aplica configurações de tema/cores
  useTheme();

  return (
    <>
      {/* Meta tags SEO e Open Graph dinâmicas */}
      <SEOHead />
      {/* Pixels de marketing carregados dinamicamente */}
      <MarketingPixels />
      {/* Códigos customizados do header e body */}
      <CustomCodesRenderer />
      {/* Pop-up de consentimento de cookies */}
      <CookieConsent />
      <Switch>
        {/* Rota principal - homepage com todas as seções */}
        <Route path="/" component={Home} />
        {/* Rotas de políticas */}
        <Route path="/privacy-policy" component={PrivacyPolicyPage} />
        <Route path="/terms-of-use" component={TermsOfUsePage} />
        {/* Rotas de artigos */}
        <Route path="/artigos" component={ArticlesPage} />
        <Route path="/artigo/:id" component={ArticlePage} />
        {/* Rota de login administrativo */}
        <Route path="/09806446909" component={AdminLogin} />
        {/* Rota do painel administrativo */}
        <Route path="/09806446909/dashboard" component={AdminDashboard} />
        {/* Rota secreta do chat */}
        <Route path="/secret" component={SecretChat} />
        {/* Rota catch-all - página 404 para rotas não encontradas */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

// Componente principal da aplicação com todos os providers
function App() {
  useEffect(() => {
    loadSiteFavicon();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="relative main-container min-h-screen flex flex-col">
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;