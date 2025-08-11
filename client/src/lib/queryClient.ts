
import { QueryClient } from "@tanstack/react-query";
import { isSlowConnection, debounce } from "@/utils/performance";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// Cache simples para requests GET
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Debounce para requests múltiplos
const debouncedRequests = new Map<string, Promise<Response>>();

export async function apiRequest(
  method: string,
  endpoint: string,
  body?: any
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  const cacheKey = `${method}:${url}${body ? ':' + JSON.stringify(body) : ''}`;

  // Cache apenas para GET requests
  if (method === 'GET') {
    const cached = requestCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return new Response(JSON.stringify(cached.data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Evitar requests duplicados
    if (debouncedRequests.has(cacheKey)) {
      return debouncedRequests.get(cacheKey)!;
    }
  }

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": isSlowConnection() ? "max-age=300" : "max-age=60",
    },
    // Keepalive para melhor reutilização de conexão
    keepalive: true,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const requestPromise = fetch(url, options);
  
  if (method === 'GET') {
    debouncedRequests.set(cacheKey, requestPromise);
  }

  try {
    const response = await requestPromise;

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Cache successful GET responses
    if (method === 'GET' && response.ok) {
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      requestCache.set(cacheKey, { data, timestamp: Date.now() });
      
      // Limpar cache se ficar muito grande
      if (requestCache.size > 100) {
        const oldestKey = requestCache.keys().next().value;
        if (oldestKey) {
          requestCache.delete(oldestKey);
        }
      }
    }

    return response;
  } finally {
    if (method === 'GET') {
      debouncedRequests.delete(cacheKey);
    }
  }
}

// Função de query padrão otimizada para evitar erros de queryFn ausente
const defaultQueryFn = async ({ queryKey }: { queryKey: readonly unknown[] }) => {
  const endpoint = String(queryKey[0]);
  
  // Usar apiRequest otimizado para aproveitar cache
  const response = await apiRequest('GET', endpoint);
  return response.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn, // Define queryFn padrão para evitar erros
      staleTime: Infinity, // NEVER consider data stale - SINGLE UPDATE ONLY
      gcTime: Infinity, // NEVER remove from cache - SINGLE UPDATE ONLY  
      refetchOnMount: false, // NEVER refetch on mount - SINGLE UPDATE ONLY
      refetchOnWindowFocus: false, // NEVER refetch on focus - SINGLE UPDATE ONLY
      refetchOnReconnect: false, // NEVER refetch on reconnect - SINGLE UPDATE ONLY
      refetchInterval: false, // NEVER auto-refetch - SINGLE UPDATE ONLY
      retry: false, // NEVER retry - SINGLE UPDATE ONLY
      retryOnMount: false, // NEVER retry on mount - SINGLE UPDATE ONLY
      networkMode: 'offlineFirst', // Cache first - SINGLE UPDATE ONLY
      refetchIntervalInBackground: false, // NEVER background refetch
    },
    mutations: {
      retry: false, // NEVER retry mutations - SINGLE UPDATE ONLY
      networkMode: 'offlineFirst', // Cache first - SINGLE UPDATE ONLY
    },
  },
});

// Interceptar invalidações de cache para logs
const originalInvalidateQueries = queryClient.invalidateQueries.bind(queryClient);
queryClient.invalidateQueries = function(filters?: any) {
  console.log("🔥🔥🔥 INVALIDATE QUERIES CHAMADO 🔥🔥🔥");
  console.log("🔥 Filters:", filters);
  console.log("🔥 Timestamp:", Date.now());
  console.log("🔥 Stack trace:", new Error().stack);
  
  const result = originalInvalidateQueries(filters);
  console.log("🔥 Invalidation result:", result);
  return result;
};

// Interceptar setQueryData para logs
const originalSetQueryData = queryClient.setQueryData.bind(queryClient);
queryClient.setQueryData = function(queryKey: any, updater: any) {
  console.log("🔥🔥🔥 SET QUERY DATA CHAMADO 🔥🔥🔥");
  console.log("🔥 QueryKey:", queryKey);
  console.log("🔥 Updater:", updater);
  console.log("🔥 Timestamp:", Date.now());
  
  const result = originalSetQueryData(queryKey, updater);
  console.log("🔥 SetQueryData result:", result);
  return result;
};
