import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Code, Archive, FileText, Trash2, Plus, ChevronUp, ChevronDown, Eye, EyeOff, Target, Users, TrendingUp, Zap, Brain, Filter } from "lucide-react";
import { SiFacebook, SiGoogle, SiTiktok, SiLinkedin, SiInstagram, SiWhatsapp } from "react-icons/si";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DragAndDropContainer } from "./base/DragAndDropContainer";
import { DragAndDropItem } from "./base/DragAndDropItem";
import { AIInstructions } from "./base/AIInstructions";

const customCodeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  code: z.string().min(1, "Código é obrigatório"),
  location: z.enum(['header', 'body']),
  isActive: z.boolean(),
});

type CustomCodeForm = z.infer<typeof customCodeSchema>;

export function CustomCodesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCode, setEditingCode] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: customCodes = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/custom-codes"],
  });

  const headerCodes = customCodes.filter((code) => code.location === 'header');
  const bodyCodes = customCodes.filter((code) => code.location === 'body');

  const form = useForm<CustomCodeForm>({
    resolver: zodResolver(customCodeSchema),
    defaultValues: {
      name: "",
      code: "",
      location: "header",
      isActive: true,
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (reorderData: Array<{ id: number | string; order: number }>) => {
      const response = await apiRequest("PUT", "/api/admin/custom-codes/reorder", reorderData);
      return response.json();
    },
    onSuccess: (updatedData) => {
      queryClient.setQueryData(["/api/admin/custom-codes"], updatedData);
      toast({ title: "Ordem dos códigos atualizada!" });
    },
    onError: () => {
      toast({ title: "Erro ao reordenar códigos", variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CustomCodeForm) => {
      const response = await apiRequest("POST", "/api/admin/custom-codes", data);
      return response.json();
    },
    onSuccess: (newCode) => {
      queryClient.setQueryData(["/api/admin/custom-codes"], (old: any[] = []) => [...old, newCode]);
      toast({ title: "Código customizado criado com sucesso!" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro ao criar código", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CustomCodeForm> }) => {
      const response = await apiRequest("PUT", `/api/admin/custom-codes/${id}`, data);
      return response.json();
    },
    onSuccess: (updatedCode, { id }) => {
      queryClient.setQueryData(["/api/admin/custom-codes"], (old: any[] = []) => 
        old.map(code => code.id === id ? updatedCode : code)
      );
      toast({ title: "Código atualizado com sucesso!" });
      setIsDialogOpen(false);
      setEditingCode(null);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar código", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/custom-codes/${id}`);
      return response.json();
    },
    onSuccess: (response, deletedId) => {
      queryClient.setQueryData(["/api/admin/custom-codes"], (old: any[] = []) => 
        old.filter(code => code.id !== deletedId)
      );
      toast({ title: "Código removido com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover código", variant: "destructive" });
    },
  });

  const onSubmit = (data: CustomCodeForm) => {
    if (editingCode) {
      updateMutation.mutate({ id: editingCode.id, data });
    } else {
      // Adicionar order baseado na quantidade existente para a localização
      const codesInLocation = customCodes.filter((c) => c.location === data.location);
      const finalData = { ...data, order: codesInLocation.length };
      createMutation.mutate(finalData);
    }
  };

  const handleEdit = (code: any) => {
    setEditingCode(code);
    form.reset({
      name: code.name,
      code: code.code,
      location: code.location,
      isActive: code.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = (id: number, isActive: boolean) => {
    updateMutation.mutate({ id, data: { isActive } });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este código?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleReorder = (reorderedItems: Array<{ id: string | number; order: number }>) => {
    const normalizedItems = reorderedItems.map(item => ({
      id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
      order: item.order
    }));
    reorderMutation.mutate(normalizedItems);
  };

  const CodesList = ({ codes, location }: { codes: any[]; location: 'header' | 'body' }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          {location === 'header' ? <Archive className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          {location === 'header' ? 'Códigos do Header' : 'Códigos do Body'}
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCode(null);
                form.reset({ location });
              }}
              size="sm"
              className="btn-admin"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar código
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {codes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Code className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhum código {location === 'header' ? 'do header' : 'do body'} cadastrado</p>
        </div>
      ) : (
        <DragAndDropContainer
          items={codes}
          onReorder={handleReorder}
        >
          {codes.map((code) => (
            <div
              key={code.id}
              className="bg-white border rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900 truncate">{code.name}</h4>
                    <Badge variant={code.isActive ? "default" : "secondary"}>
                      {code.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="bg-gray-50 rounded p-2 max-h-20 overflow-y-auto">
                    <code className="text-xs text-gray-600 whitespace-pre-wrap">
                      {code.code.substring(0, 200)}
                      {code.code.length > 200 && "..."}
                    </code>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(code.id, !code.isActive)}
                  >
                    {code.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(code)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(code.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </DragAndDropContainer>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Marketing Digital & Pixels de Rastreamento
        </CardTitle>
        <CardDescription>
          Configure pixels de rastreamento para análise comportamental, remarketing e otimização de campanhas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Instruções de IA para Marketing */}
        <AIInstructions type="marketing" className="mb-6" />

        {/* Seção Educativa sobre Pixels */}
        <div className="mb-8 space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              O que são Pixels de Rastreamento?
            </h3>
            <div className="text-sm text-purple-800 space-y-3">
              <p>
                <strong>Pixels são códigos invisíveis</strong> que rastreiam o comportamento dos visitantes no seu site. 
                Eles funcionam como "espiões digitais" que coletam dados sobre quem visita suas páginas.
              </p>
              <div className="bg-white/50 rounded-lg p-4 border border-purple-200">
                <p className="font-medium text-purple-900 mb-2">🎯 Como Funciona o Rastreamento:</p>
                <ol className="list-decimal list-inside space-y-1 text-purple-700">
                  <li>Visitante entra no seu site → Pixel é ativado</li>
                  <li>Pixel registra: página visitada, tempo gasto, ações realizadas</li>
                  <li>Dados são enviados para plataformas (Facebook, Google, TikTok)</li>
                  <li>Plataformas criam um "perfil comportamental" do visitante</li>
                  <li>Você pode criar campanhas direcionadas para esse perfil</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Estratégias de Marketing */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Estratégias Práticas para Psicólogos
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Públicos Inteligentes
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Pessoas que leram artigos sobre ansiedade</li>
                  <li>• Visitantes que ficaram 3+ minutos no site</li>
                  <li>• Quem visitou a página de serviços</li>
                  <li>• Usuários que preencheram formulários</li>
                </ul>
              </div>
              <div className="bg-white/50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Segmentação Avançada
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Idade: 25-45 anos</li>
                  <li>• Interesses: Saúde Mental, Autocuidado</li>
                  <li>• Comportamento: Pesquisou "terapia online"</li>
                  <li>• Localização: Sua cidade + 50km</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Exemplos com IA */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
            <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Inteligência Artificial em Ação
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 rounded-lg p-4 border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-2">🤖 Exemplo Real: "Perseguição Inteligente"</h4>
                <p className="text-sm text-amber-700 mb-3">
                  Uma pessoa pesquisa "como lidar com ansiedade" no Google, clica no seu anúncio e visita seu site. 
                  Não agenda consulta, mas lê 3 artigos sobre ansiedade.
                </p>
                <div className="bg-amber-100/50 rounded p-3">
                  <p className="text-xs font-medium text-amber-800 mb-2">🎯 O que o Pixel registra:</p>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li>• Interesse alto em conteúdo sobre ansiedade</li>
                    <li>• Tempo de permanência: 8 minutos</li>
                    <li>• Não converteu (não agendou)</li>
                    <li>• Perfil: Pessoa em busca de ajuda psicológica</li>
                  </ul>
                </div>
                <p className="text-sm text-amber-700 mt-3">
                  <strong>Resultado:</strong> Nos próximos 30 dias, essa pessoa verá seus anúncios no Facebook, Instagram e TikTok 
                  com mensagens personalizadas sobre ansiedade, aumentando as chances de conversão.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações Técnicas */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Code className="w-4 h-4" />
            Instruções Técnicas
          </h4>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Header:</strong> Meta Pixel, Google Analytics, Google Ads, TikTok Pixel, LinkedIn Insight</p>
            <p><strong>Body:</strong> Chat widgets, pop-ups de saída, códigos de conversão, remarketing</p>
            <p className="text-xs mt-2 font-medium">
              ⚠️ <strong>Importante:</strong> Teste sempre antes de ativar. Códigos incorretos podem quebrar o site.
            </p>
          </div>
        </div>

        {/* Templates de Pixels Populares */}
        <div className="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
          <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
            <Code className="w-5 h-5" />
            Templates Prontos - Pixels Principais
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Meta Pixel (Facebook/Instagram) */}
            <div className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <SiFacebook className="w-6 h-6 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">Meta Pixel</h4>
                  <p className="text-xs text-gray-600">Facebook + Instagram</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">Rastreia visitantes para campanhas no Facebook e Instagram. Essencial para remarketing.</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setEditingCode(null);
                  form.reset({
                    name: "Meta Pixel (Facebook/Instagram)",
                    location: "header",
                    code: `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'SEU_PIXEL_ID_AQUI');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=SEU_PIXEL_ID_AQUI&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->`,
                    isActive: false
                  });
                  setIsDialogOpen(true);
                }}
              >
                Usar Template
              </Button>
            </div>

            {/* Google Analytics */}
            <div className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <SiGoogle className="w-6 h-6 text-red-500" />
                <div>
                  <h4 className="font-semibold text-gray-900">Google Analytics</h4>
                  <p className="text-xs text-gray-600">GA4 + Conversões</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">Análise completa de tráfego, comportamento e conversões. Fundamental para qualquer site.</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setEditingCode(null);
                  form.reset({
                    name: "Google Analytics 4 (GA4)",
                    location: "header",
                    code: `<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=SEU_GA4_ID_AQUI"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'SEU_GA4_ID_AQUI');
</script>
<!-- End Google Analytics 4 -->`,
                    isActive: false
                  });
                  setIsDialogOpen(true);
                }}
              >
                Usar Template
              </Button>
            </div>

            {/* TikTok Pixel */}
            <div className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <SiTiktok className="w-6 h-6 text-black" />
                <div>
                  <h4 className="font-semibold text-gray-900">TikTok Pixel</h4>
                  <p className="text-xs text-gray-600">TikTok Ads Manager</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">Rastreia audiência jovem para campanhas no TikTok. Crescimento exponencial em 2024.</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setEditingCode(null);
                  form.reset({
                    name: "TikTok Pixel",
                    location: "header",
                    code: `<!-- TikTok Pixel Code -->
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('SEU_TIKTOK_PIXEL_ID_AQUI');
  ttq.page();
}(window, document, 'ttq');
</script>
<!-- End TikTok Pixel Code -->`,
                    isActive: false
                  });
                  setIsDialogOpen(true);
                }}
              >
                Usar Template
              </Button>
            </div>

            {/* LinkedIn Insight */}
            <div className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <SiLinkedin className="w-6 h-6 text-blue-700" />
                <div>
                  <h4 className="font-semibold text-gray-900">LinkedIn Insight</h4>
                  <p className="text-xs text-gray-600">B2B Profissional</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">Ideal para psicólogos corporativos e coaching executivo. Audiência profissional.</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setEditingCode(null);
                  form.reset({
                    name: "LinkedIn Insight Tag",
                    location: "header",
                    code: `<!-- LinkedIn Insight Tag -->
<script type="text/javascript">
_linkedin_partner_id = "SEU_LINKEDIN_PARTNER_ID_AQUI";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script><script type="text/javascript">
(function(l) {
if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}
var s = document.getElementsByTagName("script")[0];
var b = document.createElement("script");
b.type = "text/javascript";b.async = true;
b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b, s);})(window.lintrk);
</script>
<noscript>
<img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=SEU_LINKEDIN_PARTNER_ID_AQUI&fmt=gif" />
</noscript>
<!-- End LinkedIn Insight Tag -->`,
                    isActive: false
                  });
                  setIsDialogOpen(true);
                }}
              >
                Usar Template
              </Button>
            </div>

            {/* Google Ads */}
            <div className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <SiGoogle className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">Google Ads</h4>
                  <p className="text-xs text-gray-600">Conversões + Remarketing</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">Rastreia conversões do Google Ads. Otimiza campanhas automaticamente via machine learning.</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setEditingCode(null);
                  form.reset({
                    name: "Google Ads Conversion Tracking",
                    location: "header",
                    code: `<!-- Google Ads Conversion Tracking -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-SEU_CONVERSION_ID_AQUI"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-SEU_CONVERSION_ID_AQUI');
</script>
<!-- End Google Ads Conversion Tracking -->`,
                    isActive: false
                  });
                  setIsDialogOpen(true);
                }}
              >
                Usar Template
              </Button>
            </div>

            {/* WhatsApp Business */}
            <div className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <SiWhatsapp className="w-6 h-6 text-green-500" />
                <div>
                  <h4 className="font-semibold text-gray-900">WhatsApp Business</h4>
                  <p className="text-xs text-gray-600">Chat Direto</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">Botão flutuante para WhatsApp. Facilita agendamento de consultas direto pelo chat.</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setEditingCode(null);
                  form.reset({
                    name: "WhatsApp Business - Botão Flutuante",
                    location: "body",
                    code: `<!-- WhatsApp Business Button -->
<div id="whatsapp-button" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
  <a href="https://wa.me/5511999999999?text=Olá! Gostaria de agendar uma consulta." 
     target="_blank" 
     style="display: flex; align-items: center; justify-content: center; width: 60px; height: 60px; background-color: #25D366; border-radius: 50%; text-decoration: none; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: transform 0.3s ease;"
     onmouseover="this.style.transform='scale(1.1)'"
     onmouseout="this.style.transform='scale(1)'">
    <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
    </svg>
  </a>
</div>
<!-- End WhatsApp Business Button -->`,
                    isActive: false
                  });
                  setIsDialogOpen(true);
                }}
              >
                Usar Template
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="header" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="header">Header ({headerCodes.length})</TabsTrigger>
            <TabsTrigger value="body">Body ({bodyCodes.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="header" className="mt-4">
            <CodesList codes={headerCodes} location="header" />
          </TabsContent>
          <TabsContent value="body" className="mt-4">
            <CodesList codes={bodyCodes} location="body" />
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>
                {editingCode ? "Editar código" : "Adicionar código"}
              </DialogTitle>
              <DialogDescription>
                {editingCode 
                  ? "Modifique as informações do código personalizado"
                  : "Adicione um novo código HTML, CSS ou JavaScript ao seu site"
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome descritivo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Google Analytics, Facebook Pixel, Chat Widget..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização</FormLabel>
                      <FormControl>
                        <select {...field} className="w-full p-2 border rounded">
                          <option value="header">Header (dentro do &lt;head&gt;)</option>
                          <option value="body">Body (antes do &lt;/body&gt;)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código HTML/CSS/JavaScript</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Cole aqui o código fornecido pelo serviço (Google, Facebook, etc.)"
                          rows={8}
                          className="font-mono text-sm w-full resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Código Ativo</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Quando ativo, o código será inserido no site
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingCode(null);
                      form.reset();
                    }}
                    className="w-full sm:w-auto"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="w-full sm:w-auto btn-admin"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Salvando..."
                      : editingCode
                      ? "Atualizar"
                      : "Criar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}