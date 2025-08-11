import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Copy, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AIInstructionsProps {
  type: 'articles' | 'marketing';
  className?: string;
}

export function AIInstructions({ type, className = "" }: AIInstructionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Prompt copiado para a área de transferência",
    });
  };

  const instructions = {
    articles: {
      title: "Assistente de IA para artigos",
      description: "Use IAs como ChatGPT, Claude ou Grok para converter seus textos em HTML profissional",
      sections: [
        {
          title: "📝 Formatação de texto",
          prompt: `Por favor, formate este texto para HTML seguindo estas regras:

1. Use apenas tags HTML básicas (p, h1, h2, h3, strong, em, ul, li, ol, br)
2. NÃO inclua tags <!DOCTYPE>, <html>, <head>, <body> ou <section>
3. Retorne APENAS o conteúdo HTML formatado
4. Use quebras de linha adequadas entre parágrafos
5. Destaque palavras importantes com <strong>
6. Use <h2> e <h3> para subtítulos
7. Mantenha o estilo científico e profissional

Texto para formatar:
[COLE SEU TEXTO AQUI]`,
          description: "Use este prompt para converter texto simples em HTML formatado"
        },
        {
          title: "🔬 Artigo científico",
          prompt: `Converta este artigo científico para HTML seguindo o padrão acadêmico:

REGRAS IMPORTANTES:
- Use apenas HTML básico (p, h2, h3, strong, em, ul, li, ol)
- NÃO inclua <!DOCTYPE>, <html>, <head>, <body>
- Estruture com: Introdução, Metodologia, Resultados, Discussão, Conclusão
- Use <h2> para seções principais e <h3> para subseções
- Destaque termos técnicos com <strong>
- Formate listas com <ul> e <li>
- Mantenha linguagem científica e objetiva

Artigo:
[COLE SEU ARTIGO AQUI]`,
          description: "Para artigos científicos com estrutura acadêmica completa"
        },
        {
          title: "📚 Bibliografia e referências",
          prompt: `Formate estas referências bibliográficas em HTML:

REGRAS:
- Use apenas <p>, <strong>, <em> e <br>
- Siga padrão ABNT ou APA
- Uma referência por parágrafo <p>
- Destaque autores com <strong>
- Títulos em <em>
- NÃO use outras tags HTML

Referências:
[COLE SUAS REFERÊNCIAS AQUI]`,
          description: "Para formatar referências bibliográficas corretamente"
        }
      ]
    },
    marketing: {
      title: "Assistente de IA para marketing",
      description: "Use IAs para criar códigos de marketing, pixels de rastreamento e scripts personalizados",
      sections: [
        {
          title: "📊 Pixel de Rastreamento",
          prompt: `Preciso de um código para pixel de rastreamento. Forneça:

INFORMAÇÕES NECESSÁRIAS:
- Plataforma: [Facebook/Google/TikTok/LinkedIn]
- ID do Pixel: [seu ID aqui]
- Eventos a rastrear: [PageView, ViewContent, Purchase, etc.]

REGRAS IMPORTANTES:
- Retorne APENAS o código JavaScript/HTML
- NÃO inclua explicações ou comentários extensos
- Use async/defer quando apropriado
- Código otimizado para performance

Minha necessidade:
[DESCREVA O QUE PRECISA]`,
          description: "Para gerar códigos de pixels de rastreamento de redes sociais"
        },
        {
          title: "🎯 Scripts Personalizados",
          prompt: `Crie um script personalizado com estas especificações:

DETALHES:
- Função: [Ex: popup de saída, chat bot, formulário]
- Quando ativar: [Ex: 30 segundos, scroll 50%, sair da página]
- Estilo: [cores, posição, animação]

REQUISITOS TÉCNICOS:
- JavaScript puro (sem jQuery)
- Código minificado e otimizado
- Compatível com dispositivos móveis
- NÃO quebrar outras funcionalidades do site

Especificação:
[DESCREVA SEU SCRIPT]`,
          description: "Para criar scripts JavaScript personalizados"
        },
        {
          title: "📈 Google Analytics/Tag Manager",
          prompt: `Configure o código do Google Analytics/Tag Manager:

DADOS NECESSÁRIOS:
- ID de Medição: [G-XXXXXXXXXX ou GTM-XXXXXXX]
- Eventos personalizados: [listar se necessário]
- Conversões a rastrear: [formulários, cliques, etc.]

CONFIGURAÇÃO:
- Use gtag ou dataLayer conforme apropriado
- Inclua consentimento de cookies (LGPD)
- Otimize para velocidade de carregamento

Informações:
[COLE SUAS INFORMAÇÕES AQUI]`,
          description: "Para configurar Google Analytics e Tag Manager corretamente"
        },
        {
          title: "💬 Chat e Widgets",
          prompt: `Integre este widget/chat no site:

WIDGET: [WhatsApp, Intercom, Zendesk, etc.]
CONFIGURAÇÕES:
- Posição: [canto direito, esquerdo, etc.]
- Cores do tema: [principais cores do site]
- Texto de boas-vindas: [sua mensagem]
- Horário de funcionamento: [se aplicável]

REQUISITOS:
- Responsivo para mobile
- Não interferir na navegação
- Carregamento assíncrono

Detalhes:
[ESPECIFIQUE O WIDGET]`,
          description: "Para integrar chats e widgets de terceiros"
        }
      ]
    }
  };

  const currentInstructions = instructions[type];

  return (
    <Card className={`border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                {currentInstructions.title}
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  IA Helper
                </Badge>
              </CardTitle>
              <p className="text-sm text-purple-700 mt-1">
                {currentInstructions.description}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid gap-4">
            {currentInstructions.sections.map((section, index) => (
              <div key={index} className="bg-white rounded-lg border border-purple-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-purple-900 text-sm">
                    {section.title}
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(section.prompt)}
                    className="text-xs h-7 px-2 border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar
                  </Button>
                </div>
                <p className="text-xs text-purple-600 mb-3">
                  {section.description}
                </p>
                <div className="bg-gray-50 rounded-md p-3 border">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                    {section.prompt}
                  </pre>
                </div>
              </div>
            ))}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-2">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-800 text-xs font-bold">!</span>
                </div>
                <div>
                  <h5 className="font-semibold text-amber-800 text-sm mb-1">
                    Dicas Importantes:
                  </h5>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li>• Sempre teste usando o botão "Prévia" do painel antes de publicar</li>
                    <li>• Cole apenas o conteúdo HTML/JS, sem tags estruturais</li>
                    <li>• Use o botão "Copiar" para pegar o prompt completo</li>
                    <li>• Funciona com ChatGPT, Claude, Grok e outras IAs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}