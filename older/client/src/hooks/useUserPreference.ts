import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

export function useUserPreference(key: string, defaultValue: string = "true") {
  const [value, setValue] = useState<string>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar preferência ao montar o componente
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const response = await apiRequest("GET", `/api/user-preference/${key}`);
        const preference = await response.json();
        setValue(preference.value);
      } catch (error) {
        // Se a preferência não existe, usa o valor padrão
        setValue(defaultValue);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreference();
  }, [key, defaultValue]);

  // Função para atualizar a preferência
  const updatePreference = async (newValue: string) => {
    try {
      await apiRequest("POST", "/api/user-preference", {
        body: JSON.stringify({ key, value: newValue }),
        headers: { "Content-Type": "application/json" }
      });
      setValue(newValue);
    } catch (error) {
      console.error("Erro ao atualizar preferência:", error);
    }
  };

  return {
    value,
    updatePreference,
    isLoading,
    // Helpers para valores booleanos
    boolValue: value === "true",
    setBoolValue: (newValue: boolean) => updatePreference(newValue.toString())
  };
}