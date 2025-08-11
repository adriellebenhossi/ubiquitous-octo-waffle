/**
 * ProfessionalTitleColorManager.tsx
 * 
 * Componente para configurar a cor do título profissional "Psicóloga CFP"
 * Permite alterar a cor exibida abaixo do nome na seção sobre
 */

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SiteConfig } from "@shared/schema";

const professionalTitleColorSchema = z.object({
  color: z.string().min(1, "Cor é obrigatória")
});

type ProfessionalTitleColorForm = z.infer<typeof professionalTitleColorSchema>;

interface ProfessionalTitleColorManagerProps {
  configs: SiteConfig[];
}

export function ProfessionalTitleColorManager({ configs }: ProfessionalTitleColorManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getConfigValue = (key: string) => {
    const config = configs.find(c => c.key === key);
    return config ? config.value : {};
  };

  const professionalTitleColorConfig = getConfigValue('professional_title_color') as any;
  const generalInfo = getConfigValue('general_info') as any;
  const professionalTitleInfo = getConfigValue('professional_title') as any;

  const form = useForm<ProfessionalTitleColorForm>({
    resolver: zodResolver(professionalTitleColorSchema),
    defaultValues: {
      color: professionalTitleColorConfig.color || "#ec4899"
    },
  });

  // Popula o formulário quando os dados chegam
  React.useEffect(() => {
    if (professionalTitleColorConfig && professionalTitleColorConfig.color) {
      form.setValue("color", professionalTitleColorConfig.color);
    }
  }, [professionalTitleColorConfig, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: ProfessionalTitleColorForm) => {
      const response = await apiRequest("POST", "/api/admin/config", {
        key: "professional_title_color",
        value: data
      });
      return response.json();
    },
    onSuccess: (response, variables) => {
      console.log("🎯 PROFESSIONAL TITLE COLOR: Atualizando cache admin e público");
      
      // Atualização do cache admin
      queryClient.setQueryData(["/api/admin/config"], (oldData: any) => {
        if (!oldData) return oldData;
        const existingConfigIndex = oldData.findIndex((config: any) => config.key === "professional_title_color");
        if (existingConfigIndex >= 0) {
          return oldData.map((config: any, index: number) => 
            index === existingConfigIndex 
              ? { ...config, value: variables }
              : config
          );
        } else {
          return [...oldData, { key: "professional_title_color", value: variables }];
        }
      });
      
      // Atualização do cache público para sincronização com a interface
      queryClient.setQueryData(["/api/config"], (oldData: any) => {
        if (!oldData) return oldData;
        const existingConfigIndex = oldData.findIndex((config: any) => config.key === "professional_title_color");
        if (existingConfigIndex >= 0) {
          return oldData.map((config: any, index: number) => 
            index === existingConfigIndex 
              ? { ...config, value: variables }
              : config
          );
        } else {
          return [...oldData, { key: "professional_title_color", value: variables }];
        }
      });
      
      toast({ title: "Cor do título profissional atualizada com sucesso!" });
    },
    onError: () => {
      toast({ 
        title: "Erro ao atualizar", 
        description: "Não foi possível salvar a cor do título profissional",
        variant: "destructive" 
      });
    }
  });

  const onSubmit = (data: ProfessionalTitleColorForm) => {
    updateMutation.mutate(data);
  };

  // Cores predefinidas comuns para títulos profissionais
  const predefinedColors = [
    { name: "Rosa Vibrante", color: "#ec4899" },
    { name: "Roxo Suave", color: "#8b5cf6" },
    { name: "Azul Profissional", color: "#3b82f6" },
    { name: "Verde Menta", color: "#10b981" },
    { name: "Laranja Energia", color: "#f97316" },
    { name: "Vermelho Elegante", color: "#ef4444" },
    { name: "Indigo Moderno", color: "#6366f1" },
    { name: "Teal Serenidade", color: "#0891b2" },
  ];

  const currentColor = form.watch("color");
  const currentCrp = generalInfo.crp || "08/123456";
  const currentTitle = professionalTitleInfo.title || "Psicóloga Clínica";

  return (
    <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="w-5 h-5 text-purple-600" />
          Cor do Título Profissional
        </CardTitle>
        <CardDescription>
          Configure a cor do título profissional exibido na seção "sobre mim"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Preview do título */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Visualização</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg text-gray-900">Dra. Adrielle Benhossi</h3>
                <p className="text-sm font-medium" style={{ color: currentColor }}>
                  {currentTitle} • CFP: {currentCrp}
                </p>
              </div>
            </div>

            {/* Configuração da cor */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Cor personalizada</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <Input 
                        type="color" 
                        className="w-16 h-12 rounded-lg border-2 cursor-pointer" 
                        {...field} 
                      />
                      <Input 
                        placeholder="#ec4899" 
                        className="flex-1 font-mono text-sm" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cores predefinidas */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Cores Sugeridas</h4>
              <div className="grid grid-cols-4 gap-2">
                {predefinedColors.map((colorOption) => (
                  <button
                    key={colorOption.color}
                    type="button"
                    onClick={() => form.setValue("color", colorOption.color)}
                    className={`group relative p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                      currentColor === colorOption.color 
                        ? "border-purple-300 shadow-lg ring-2 ring-purple-200" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    title={colorOption.name}
                  >
                    <div 
                      className="w-full h-6 rounded-md border border-white shadow-sm"
                      style={{ backgroundColor: colorOption.color }}
                    />
                    <span className="text-xs text-gray-600 mt-1 block text-center">
                      {colorOption.name}
                    </span>
                    {currentColor === colorOption.color && (
                      <Badge className="absolute -top-2 -right-2 bg-purple-100 text-purple-700 text-xs">
                        ✓
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Botão salvar */}
            <Button 
              type="submit" 
              className="btn-admin w-full"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Salvando..." : "Salvar Cor"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}