import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface CustomCode {
  id: number;
  name: string;
  code: string;
  location: 'header' | 'body';
  isActive: boolean;
  order: number;
}

export function CustomCodesRenderer() {
  const { data: customCodes = [] } = useQuery<CustomCode[]>({
    queryKey: ["/api/admin/custom-codes"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/custom-codes");
      return response.json();
    },
  });

  useEffect(() => {
    // Limpar códigos anteriores
    const existingCustomScripts = document.querySelectorAll('[data-custom-code]');
    existingCustomScripts.forEach(script => script.remove());

    // Adicionar códigos do header
    const headerCodes = customCodes.filter(code => code.location === 'header' && code.isActive);
    headerCodes.forEach(code => {
      const script = document.createElement('div');
      script.innerHTML = code.code;
      script.setAttribute('data-custom-code', `header-${code.id}`);
      document.head.appendChild(script);
    });

    // Adicionar códigos do body
    const bodyCodes = customCodes.filter(code => code.location === 'body' && code.isActive);
    bodyCodes.forEach(code => {
      const script = document.createElement('div');
      script.innerHTML = code.code;
      script.setAttribute('data-custom-code', `body-${code.id}`);
      document.body.appendChild(script);
    });

    // Cleanup na desmontagem
    return () => {
      const customScripts = document.querySelectorAll('[data-custom-code]');
      customScripts.forEach(script => script.remove());
    };
  }, [customCodes]);

  return null; // Componente apenas para efeitos colaterais
}