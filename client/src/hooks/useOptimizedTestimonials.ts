/**
 * useOptimizedTestimonials.ts
 * 
 * Hook otimizado para gerenciar depoimentos com atualização local inteligente
 * Evita duplas atualizações e pisca
 * Sistema de cache local para atualizações instantâneas
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Testimonial } from "@shared/schema";

interface UseOptimizedTestimonialsProps {
  testimonials: Testimonial[];
  adminQueryKey: string;
  publicQueryKey?: string;
  entityName: string;
}

export function useOptimizedTestimonials({
  testimonials,
  adminQueryKey,
  publicQueryKey,
  entityName
}: UseOptimizedTestimonialsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // Remover estado local desnecessário que causa conflitos
  const sortedTestimonials = [...testimonials].sort((a, b) => a.order - b.order);

  // Mutação simplificada para criação - SEM otimistic updates
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", adminQueryKey, data);
      return response.json();
    },
    onSuccess: (newItem) => {
      console.log(`✅ CREATE: ${entityName} id ${newItem.id}`);
      
      // ÚNICA atualização de cache 
      queryClient.setQueriesData({ queryKey: [adminQueryKey] }, (old: any[] = []) => {
        return [...old, newItem].sort((a, b) => a.order - b.order);
      });

      toast({ title: `${entityName} criado com sucesso!` });
    },
    onError: () => {
      toast({ 
        title: `Erro ao criar ${entityName}`, 
        variant: "destructive" 
      });
    }
  });

  // Mutação simplificada para atualização
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `${adminQueryKey}/${id}`, data);
      return response.json();
    },
    onSuccess: (updatedItem) => {
      console.log(`✅ UPDATE: ${entityName} id ${updatedItem.id}`);
      
      // ÚNICA atualização de cache 
      queryClient.setQueriesData({ queryKey: [adminQueryKey] }, (old: any[] = []) => {
        return old.map((item) => item.id === updatedItem.id ? updatedItem : item);
      });

      toast({ title: `${entityName} atualizado com sucesso!` });
    },
    onError: () => {
      toast({ 
        title: `Erro ao atualizar ${entityName}`, 
        variant: "destructive" 
      });
    }
  });

  // Mutação simplificada para exclusão
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `${adminQueryKey}/${id}`);
      return response.json();
    },
    onSuccess: (_, deletedId) => {
      console.log(`✅ DELETE: ${entityName} id ${deletedId}`);
      
      // ÚNICA atualização de cache
      queryClient.setQueriesData({ queryKey: [adminQueryKey] }, (old: any[] = []) => {
        return old.filter((item) => item.id !== deletedId);
      });

      toast({ title: `${entityName} removido com sucesso!` });
    },
    onError: () => {
      toast({ 
        title: `Erro ao remover ${entityName}`, 
        variant: "destructive" 
      });
    }
  });

  // Mutação simplificada para reordenação
  const reorderMutation = useMutation({
    mutationFn: async (items: Array<{ id: number; order: number }>) => {
      console.log(`🔄 Reordenando ${entityName}:`, items);
      const response = await apiRequest("PUT", `${adminQueryKey}/reorder`, items);
      return response.json();
    },
    onSuccess: (reorderedItems) => {
      console.log(`✅ REORDER: ${entityName} ordenação concluída`);
      
      // ÚNICA atualização de cache
      queryClient.setQueriesData({ queryKey: [adminQueryKey] }, (oldData: any[]) => {
        if (!Array.isArray(reorderedItems)) return oldData;
        return reorderedItems.sort((a, b) => a.order - b.order);
      });
      
      toast({ 
        title: "Ordem atualizada!", 
        description: `${entityName} reordenado com sucesso.`
      });
    },
    onError: (error) => {
      console.error("❌ REORDER ERROR:", error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({ 
        title: "Erro na reordenação", 
        description: `${errorMessage}. Verifique a conexão e tente novamente.`,
        variant: "destructive" 
      });
    }
  });

  return {
    testimonials: sortedTestimonials,
    createMutation,
    updateMutation,
    deleteMutation,
    reorderMutation
  };
}