import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTorneios = () => {
  return useQuery({
    queryKey: ["torneios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("torneios")
        .select("*")
        .order("data_torneio", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useResultados = (torneioId: string | undefined) => {
  return useQuery({
    queryKey: ["resultados", torneioId],
    queryFn: async () => {
      if (!torneioId) return [];
      const { data, error } = await supabase
        .from("resultados")
        .select("*")
        .eq("torneio_id", torneioId)
        .order("posicao", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!torneioId,
  });
};
