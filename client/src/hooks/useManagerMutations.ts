/**
 * useManagerMutations.ts
 * 
 * Hook padronizado para mutações dos managers
 * Sistema uniforme de CRUD com cache otimizado
 * Sistema otimizado com atualizações diretas de cache
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UseManagerMutationsProps {
  adminQueryKey: string;
  publicQueryKey?: string;
  entityName: string;
}

export function useManagerMutations({ adminQueryKey, publicQueryKey, entityName }: UseManagerMutationsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", adminQueryKey, data);
      return response.json();
    },
    onSuccess: (newItem) => {
      console.log(`🎯 CREATE: Item ${newItem.id} - ${entityName}`);
      
      // ÚNICA atualização de cache - SEM operações extras
      queryClient.setQueriesData({ queryKey: [adminQueryKey] }, (old: any[] = []) => {
        return [...old, newItem].sort((a, b) => a.order - b.order);
      });

      toast({ title: `${entityName} criado!` });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `${adminQueryKey}/${id}`, data);
      return response.json();
    },
    onSuccess: (updatedItem) => {
      console.log(`🎯 UPDATE SUCCESS: Item ${updatedItem.id} para ${entityName}`);
      
      // Atualização otimizada do cache sem causar re-renders desnecessários
      queryClient.setQueriesData({ queryKey: [adminQueryKey] }, (old: any[] = []) => {
        if (!Array.isArray(old)) return [updatedItem];
        return old.map((item) => item.id === updatedItem.id ? updatedItem : item);
      });

      toast({ title: `${entityName} atualizado!` });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `${adminQueryKey}/${id}`);
      return response.json();
    },
    onSuccess: (_, deletedId) => {
      // ÚNICA atualização - SEM comentários excessivos
      queryClient.setQueriesData({ queryKey: [adminQueryKey] }, (old: any[] = []) => {
        return old.filter((item) => item.id !== deletedId);
      });

      toast({ title: `${entityName} removido!` });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: Array<{ id: number; order: number }>) => {
      console.log(`🔄 FIXED: Enviando para PUT ${adminQueryKey}/reorder:`, items);
      try {
        const response = await apiRequest("PUT", `${adminQueryKey}/reorder`, items);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ REORDER API ERROR - Response não ok:", response.status, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        const result = await response.json();
        console.log(`✅ FIXED: Reordenação sem erro:`, result);
        return result;
      } catch (error) {
        console.error("❌ REORDER API ERROR - Exception capturada:", error);
        console.error("❌ REORDER API ERROR - Error type:", typeof error);
        console.error("❌ REORDER API ERROR - Error message:", error instanceof Error ? error.message : String(error));
        console.error("❌ REORDER API ERROR - Error stack:", error instanceof Error ? error.stack : 'No stack');
        throw error;
      }
    },
    onMutate: async (newItems: Array<{ id: number; order: number }>) => {
      console.log("🎯 OPTIMISTIC UPDATE: Atualizando interface imediatamente");
      
      // Cancelar qualquer query em andamento para evitar conflitos
      await queryClient.cancelQueries({ queryKey: [adminQueryKey] });
      
      // Obter dados atuais do cache
      const previousData = queryClient.getQueryData([adminQueryKey]);
      console.log("🎯 OPTIMISTIC: Dados anteriores:", previousData);
      
      // Atualizar cache com nova ordem (atualização otimista)
      queryClient.setQueryData([adminQueryKey], (oldData: any[]) => {
        if (!Array.isArray(oldData)) {
          console.warn("⚠️ OPTIMISTIC: Dados antigos não são array");
          return oldData;
        }
        
        // Criar mapa de novas ordens
        const orderMap = new Map(newItems.map(item => [item.id, item.order]));
        
        // Aplicar novas ordens aos dados existentes
        const updatedData = oldData.map(item => ({
          ...item,
          order: orderMap.get(item.id) ?? item.order
        }));
        
        // Ordenar pela nova ordem
        const sortedData = updatedData.sort((a, b) => a.order - b.order);
        console.log("✅ OPTIMISTIC: Cache atualizado com", sortedData.length, "itens reordenados");
        return sortedData;
      });
      
      // Retornar contexto para rollback em caso de erro
      return { previousData };
    },
    onSuccess: (reorderedItems) => {
      console.log("🎯 REORDER SUCCESS: Servidor confirmou a mudança");
      console.log("🎯 REORDER SUCCESS: Dados do servidor:", reorderedItems);
      
      // NÃO atualizar o cache admin aqui - manter a atualização otimística
      // O cache já foi atualizado no onMutate e deve permanecer assim
      console.log("✅ REORDER SUCCESS: Mantendo ordem otimística no painel admin");

      // Invalidar APENAS cache público para refletir mudanças na página pública
      if (publicQueryKey) {
        console.log("🔄 REORDER SUCCESS: Invalidando cache público:", publicQueryKey);
        queryClient.invalidateQueries({ queryKey: [publicQueryKey] });
        queryClient.removeQueries({ queryKey: [publicQueryKey] });
      }
      
      // Para artigos, invalidar apenas cache de artigos públicos (não o admin)
      if (adminQueryKey.includes('/api/admin/articles')) {
        console.log("🔄 REORDER SUCCESS: Invalidando apenas caches públicos de artigos");
        
        // Aguardar um pouco para garantir que a UI se estabilize antes de invalidar caches públicos
        setTimeout(() => {
          // Invalidar APENAS caches públicos, não o admin
          queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
          queryClient.removeQueries({ queryKey: ['/api/articles'] });
          queryClient.invalidateQueries({ queryKey: ['/api/articles/featured'] });
          queryClient.removeQueries({ queryKey: ['/api/articles/featured'] });
          
          console.log('✅ REORDER SUCCESS: Cache público de artigos limpo, admin preservado');
        }, 100);
      }

      // Notificação de sucesso para reordenação
      toast({ 
        title: "Ordem atualizada!", 
        description: `${entityName} reordenado com sucesso.`
      });
    },
    onError: (error, newItems, context) => {
      console.error("❌ REORDER ERROR: Revertendo mudanças otimistas:", error);
      
      // Fazer rollback dos dados otimistas em caso de erro
      if (context?.previousData) {
        console.log("🔄 ROLLBACK: Revertendo para dados anteriores");
        queryClient.setQueryData([adminQueryKey], context.previousData);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      // Toast com detalhes do erro
      toast({ 
        title: "Erro na reordenação", 
        description: `${errorMessage}. A ordem foi revertida. Tente novamente.`,
        variant: "destructive" 
      });
    }
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    reorderMutation,
  };
}