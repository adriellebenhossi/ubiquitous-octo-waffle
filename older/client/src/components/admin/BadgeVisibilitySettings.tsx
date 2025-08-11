import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SiteConfig } from "@shared/schema";

interface BadgeVisibilitySettingsProps {
  configs: SiteConfig[];
}

export function BadgeVisibilitySettings({ configs }: BadgeVisibilitySettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar configuração atual de badges
  const badgeConfig = configs?.find((c: any) => c.key === "show_badges")?.value as any || { enabled: true };
  const showBadges = badgeConfig.enabled !== false;

  const updateBadgeVisibility = useMutation({
    mutationFn: async (enabled: boolean) => {
      await apiRequest("POST", "/api/admin/config", {
        key: "show_badges",
        value: { enabled }
      });
    },
    onSuccess: (response, enabled) => {
      // Atualizar cache admin
      queryClient.setQueryData(["/api/admin/config"], (oldData: any[] = []) => {
        const newBadgeConfig = { enabled };
        const existingIndex = oldData.findIndex((config: any) => config.key === "show_badges");
        if (existingIndex >= 0) {
          return oldData.map((config, index) => 
            index === existingIndex 
              ? { ...config, value: newBadgeConfig }
              : config
          );
        } else {
          return [...oldData, { key: "show_badges", value: newBadgeConfig }];
        }
      });
      
      // Atualizar cache público
      queryClient.setQueryData(["/api/config"], (oldData: any[] = []) => {
        const newBadgeConfig = { enabled };
        const existingIndex = oldData.findIndex((config: any) => config.key === "show_badges");
        if (existingIndex >= 0) {
          return oldData.map((config, index) => 
            index === existingIndex 
              ? { ...config, value: newBadgeConfig }
              : config
          );
        } else {
          return [...oldData, { key: "show_badges", value: newBadgeConfig }];
        }
      });
      
      toast({
        title: "✨ Configuração salva",
        description: `Badges ${enabled ? 'habilitados' : 'desabilitados'} com sucesso!`,
      });
    },
    onError: () => {
      toast({
        title: "❌ Erro",
        description: "Não foi possível salvar a configuração",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (enabled: boolean) => {
    updateBadgeVisibility.mutate(enabled);
  };

  return (
    <div className="space-y-4 sm:space-y-6">


      {/* Main Control Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Toggle Control */}
            <div className="relative">
              <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                showBadges 
                  ? 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50' 
                  : 'border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  {/* Icon and Status */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 shrink-0 ${
                      showBadges 
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' 
                        : 'bg-gray-400 text-white shadow-lg shadow-gray-200'
                    }`}>
                      {showBadges ? (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <Label htmlFor="badge-visibility" className="font-bold text-gray-900 text-sm sm:text-base cursor-pointer truncate">
                          Exibir Badges nas Seções
                        </Label>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${
                          showBadges 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {showBadges ? 'ATIVO' : 'INATIVO'}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {showBadges 
                          ? "Os badges estão sendo exibidos em todas as seções (ex: DEPOIMENTOS, SERVIÇOS, FAQ)" 
                          : "Badges ocultos para um design mais limpo e minimalista"
                        }
                      </p>
                    </div>
                  </div>

                  {/* Switch */}
                  <div className="flex flex-col items-center gap-2 self-start sm:self-center">
                    <Switch
                      id="badge-visibility"
                      checked={showBadges}
                      onCheckedChange={handleToggle}
                      disabled={updateBadgeVisibility.isPending}
                      className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-gray-300"
                    />
                    {updateBadgeVisibility.isPending && (
                      <div className="text-xs text-gray-500 animate-pulse">Salvando...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Examples */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl border bg-white">
                <div className="text-xs font-medium text-gray-500 mb-2">COM BADGES</div>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs font-bold text-purple-600 tracking-wide">DEPOIMENTOS</span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-700">O que nossos pacientes dizem</div>
                </div>
              </div>
              
              <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl border bg-white">
                <div className="text-xs font-medium text-gray-500 mb-2">SEM BADGES</div>
                <div className="space-y-1 sm:space-y-2">
                  <div className="text-xs sm:text-sm text-gray-700">O que nossos pacientes dizem</div>
                </div>
              </div>
            </div>

            {/* Design Tip */}
            <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">💡</span>
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-blue-800 text-xs sm:text-sm mb-1">Dica de Design</div>
                  <p className="text-blue-700 text-xs leading-relaxed">
                    Remover os badges deixará seu site com um visual mais <strong>limpo e minimalista</strong>, 
                    focando a atenção do visitante no conteúdo principal e criando uma experiência mais elegante.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}