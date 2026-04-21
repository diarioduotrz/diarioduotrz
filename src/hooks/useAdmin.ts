import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// --- Configurações Globais ---

export const useConfig = (chave: string) => {
  return useQuery({
    queryKey: ["config", chave],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("configuracoes_globais")
        .select("valor")
        .eq("chave", chave)
        .single();
      
      // PGRST116 = row not found (chave ainda não existe no banco) — retorna null sem erro
      if (error?.code === "PGRST116") return null;
      if (error) throw error;
      return data.valor;
    },
  });
};

export const useUpdateConfig = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ chave, valor }: { chave: string; valor: any }) => {
      const { error } = await supabase
        .from("configuracoes_globais")
        .upsert({ chave, valor, updated_at: new Date().toISOString() });
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["config", variables.chave] });
      toast({ title: "Configuração atualizada!" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error?.message || "Verifique as permissões RLS no painel do Supabase.",
        variant: "destructive",
      });
    },
  });
};

// --- Estatísticas do Dashboard ---

/** Busca todos os resultados de um conjunto de torneios, paginando de 1000 em 1000 */
const fetchAllResultados = async (torneioIds?: string[]) => {
  const PAGE_SIZE = 1000;
  let page = 0;
  let all: { torneio_id: string | null; premio_total: number | null; kills: number | null }[] = [];

  while (true) {
    let query = supabase
      .from("resultados")
      .select("torneio_id, premio_total, kills")
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (torneioIds && torneioIds.length > 0) {
      query = query.in("torneio_id", torneioIds);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < PAGE_SIZE) break;
    page++;
  }

  return all;
};

export interface DateFilter { from?: string; to?: string }

export const useAdminStats = (dateFilter?: DateFilter) => {
  const from = dateFilter?.from;
  const to = dateFilter?.to;

  return useQuery({
    queryKey: ["admin-stats", from, to],
    queryFn: async () => {
      let torneiosQuery = supabase.from("torneios").select("id, configuracao_json, data_torneio");
      if (from) torneiosQuery = torneiosQuery.gte("data_torneio", from);
      if (to)   torneiosQuery = torneiosQuery.lte("data_torneio", to + "T23:59:59");

      const [
        { data: torneiosData, error: torneiosError },
        { data: configPremiosData },
        { data: configCustosData },
      ] = await Promise.all([
        torneiosQuery,
        supabase.from("configuracoes_globais").select("valor").eq("chave", "premios_padrao").single(),
        supabase.from("configuracoes_globais").select("valor").eq("chave", "config_custos").single(),
      ]);

      if (torneiosError) throw torneiosError;

      const torneioIds = torneiosData?.map(t => t.id) ?? [];
      // Se há filtro de datas mas nenhum torneio encontrado, não busca resultados
      const resultadosData = (from || to)
        ? (torneioIds.length > 0 ? await fetchAllResultados(torneioIds) : [])
        : await fetchAllResultados();

      if (torneiosError) throw torneiosError;

      const configPremios = configPremiosData?.valor as any;
      const configCustos = configCustosData?.valor as any;
      
      const entryFeePadrao = Number(configPremios?.valorInscricao || 0);
      const custoPorSala = Number(configCustos?.custoPorSala ?? 15);
      const custosFixos = Number(configCustos?.custosFixos ?? 0);
      const TAXA_ADM_CORTE = new Date('2026-02-22T00:00:00');
      const TAXA_ADM_ANTIGA = 10;

      const equipesPorTorneio: Record<string, number> = {};
      const premiosPorTorneio: Record<string, number> = {};
      let totalPremios = 0;
      let totalKills = 0;

      resultadosData.forEach(r => {
        if (r.torneio_id) {
          equipesPorTorneio[r.torneio_id] = (equipesPorTorneio[r.torneio_id] || 0) + 1;
          premiosPorTorneio[r.torneio_id] = (premiosPorTorneio[r.torneio_id] || 0) + Number(r.premio_total || 0);
        }
        totalPremios += Math.round(Number(r.premio_total || 0) * 100);
        totalKills += Number(r.kills || 0);
      });
      totalPremios = totalPremios / 100;

      let arrecadacao = 0;
      const countTorneios = torneiosData?.length || 0;
      const hourStats: Record<number, { revenue: number, expense: number }> = {};

      torneiosData?.forEach(t => {
        const config = t.configuracao_json as any;
        let revenue = 0;
        if (config?.entryFee && config?.slotsSold) {
          revenue = Number(config.entryFee) * Number(config.slotsSold);
        } else {
          revenue = entryFeePadrao * (equipesPorTorneio[t.id] || 0);
        }
        arrecadacao += revenue;

        // Hour analysis
        const hour = new Date(t.data_torneio).getHours();
        if (!hourStats[hour]) hourStats[hour] = { revenue: 0, expense: 0 };
        hourStats[hour].revenue += revenue;
        hourStats[hour].expense += (premiosPorTorneio[t.id] || 0) + custoPorSala;
      });

      let custoAdm = 0;
      let salasTaxaAntiga = 0;
      let salasTaxaNova = 0;
      torneiosData?.forEach(t => {
        const dataTorneio = new Date(t.data_torneio);
        const taxa = dataTorneio < TAXA_ADM_CORTE ? TAXA_ADM_ANTIGA : custoPorSala;
        custoAdm += taxa;
        if (dataTorneio < TAXA_ADM_CORTE) salasTaxaAntiga++; else salasTaxaNova++;
      });

      const lucro = arrecadacao - totalPremios;
      const lucroReal = arrecadacao - totalPremios - custoAdm - custosFixos;

      const diasUnicos = new Set(
        torneiosData?.map(t => t.data_torneio.substring(0, 10)) || []
      ).size;

      const killsPorPartida = countTorneios > 0 ? (totalKills / countTorneios).toFixed(2) : "0.00";
      const premioMedioPorSala = countTorneios > 0 ? (totalPremios / countTorneios) : 0;
      const lucroMedioPorSala = countTorneios > 0 ? lucroReal / countTorneios : 0;
      const lucroMedioPorDia = diasUnicos > 0 ? lucroReal / diasUnicos : 0;

      // Find most profitable hour
      let bestHour = -1;
      let maxProfit = -Infinity;
      Object.entries(hourStats).forEach(([hour, stats]) => {
        const profit = stats.revenue - stats.expense;
        if (profit > maxProfit) {
          maxProfit = profit;
          bestHour = Number(hour);
        }
      });

      return {
        arrecadacao,
        lucro,
        lucroReal,
        premiosPagos: totalPremios,
        partidas: countTorneios,
        kills: totalKills,
        killsPorPartida,
        premioMedioPorSala,
        lucroMedioPorSala,
        lucroMedioPorDia,
        custoAdm,
        custosFixos,
        salasTaxaAntiga,
        salasTaxaNova,
        bestHour: bestHour !== -1 ? `${bestHour}:00` : "N/A"
      };
    },
  });
};

// --- Gestão de Grupos ---

export const useGrupos = () => {
  return useQuery({
    queryKey: ["grupos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grupos")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useUpsertGrupo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (grupo: any) => {
      const { error } = await supabase.from("grupos").upsert(grupo);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupos"] });
    },
  });
};

export const useDeleteGrupo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("grupos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupos"] });
    },
  });
};
