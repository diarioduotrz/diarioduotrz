import { LayoutDashboard, DollarSign, Gamepad2, Loader2, Target, TrendingUp, Crosshair, Wallet, Zap, PieChart, Info, Trophy, X } from "lucide-react";
import { useState } from "react";
import { useAdminStats } from "@/hooks/useAdmin";
import { useTorneios } from "@/hooks/useRanking";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdminDashboard = () => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const hasFilter = dateFrom || dateTo;
  const { data: stats, isLoading, isError } = useAdminStats(
    hasFilter ? { from: dateFrom || undefined, to: dateTo || undefined } : undefined
  );
  const { data: torneios } = useTorneios();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const statCards = [
    { label: "Arrecadação", value: stats ? formatCurrency(stats.arrecadacao) : "R$ 0,00", icon: DollarSign, color: "text-blue-400" },
    { label: "LUCRO LÍQUIDO", value: stats ? formatCurrency(stats.lucroReal) : "R$ 0,00", icon: Wallet, color: "text-emerald-400" },
    { label: "Prêmios (Total)", value: stats ? formatCurrency(stats.premiosPagos) : "R$ 0,00", icon: Trophy, color: "text-purple-400" },
    { label: "Prêmio Médio", value: stats ? formatCurrency(stats.premioMedioPorSala) : "R$ 0,00", icon: PieChart, color: "text-indigo-400" },
    { label: "Lucro Médio/Sala", value: stats ? formatCurrency(stats.lucroMedioPorSala) : "R$ 0,00", icon: TrendingUp, color: "text-teal-400" },
    { label: "Lucro Médio/Dia", value: stats ? formatCurrency(stats.lucroMedioPorDia) : "R$ 0,00", icon: TrendingUp, color: "text-cyan-400" },
    { label: "Horário de Ouro", value: stats?.bestHour || "N/A", icon: Zap, color: "text-yellow-400" },
    { label: "Kills/Partida", value: stats?.killsPorPartida || "0.00", icon: Crosshair, color: "text-orange-400" },
    { label: "Partidas", value: stats?.partidas || "0", icon: Gamepad2, color: "text-white" },
    { label: "Kills", value: stats?.kills || "0", icon: Target, color: "text-red-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground font-medium">Visão geral do desempenho da Arena</p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">De</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="h-9 w-40 bg-card text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Até</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="h-9 w-40 bg-card text-sm"
            />
          </div>
          {hasFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="h-9 gap-1 text-muted-foreground hover:text-white"
            >
              <X size={14} /> Limpar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="group rounded-xl border border-border/50 bg-card p-6 shadow-sm hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{s.label}</span>
              <s.icon className={`h-5 w-5 ${s.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
            </div>
            <div className="mt-3 text-2xl font-black text-white">
              {isLoading ? <Loader2 className="animate-spin h-6 w-6 text-primary" /> : isError ? <span className="text-sm text-red-400">Erro</span> : s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 mt-2 rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="border-b border-border/50 bg-white/[0.02] px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-foreground">Últimas 5 partidas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.01] text-left text-muted-foreground text-[10px] tracking-widest uppercase">
                <tr>
                  <th className="px-6 py-3">Data/Hora</th>
                  <th className="px-6 py-3">Nome do Torneio</th>
                  <th className="px-6 py-3">Modo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                {torneios?.slice(0, 5).map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">{format(new Date(t.data_torneio), "dd/MM/yyyy HH:mm")}</td>
                    <td className="px-6 py-4 font-bold">{t.nome}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {t.modo}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!torneios || torneios.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-6 py-20 text-center text-muted-foreground italic">Nenhuma partida registrada ainda.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] overflow-hidden flex flex-col">
          <div className="border-b border-emerald-500/20 bg-emerald-500/5 px-6 py-4 flex items-center gap-2">
            <Wallet className="text-emerald-400" size={20} />
            <h2 className="text-lg font-bold tracking-tight text-white">Fechamento de Caixa</h2>
          </div>
          <div className="p-6 flex-1 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bruto (Inscrições)</span>
                <span className="font-bold text-white">{stats ? formatCurrency(stats.arrecadacao) : "---"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">(-) Prêmios Pagos</span>
                <span className="font-bold text-red-400">{stats ? formatCurrency(stats.premiosPagos) : "---"}</span>
              </div>
              <div className="border-b border-white/5 pb-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">(-) Taxa ADM (Salas)</span>
                  <span className="font-bold text-orange-400">{stats ? formatCurrency(stats.custoAdm) : "---"}</span>
                </div>
                {stats && stats.salasTaxaAntiga > 0 && (
                  <div className="flex justify-between text-xs pl-3">
                    <span className="text-muted-foreground/70">└ {stats.salasTaxaAntiga} salas × R$10</span>
                    <span className="text-orange-400/70">{formatCurrency(stats.salasTaxaAntiga * 10)}</span>
                  </div>
                )}
                {stats && stats.salasTaxaNova > 0 && (
                  <div className="flex justify-between text-xs pl-3">
                    <span className="text-muted-foreground/70">└ {stats.salasTaxaNova} salas × R$15</span>
                    <span className="text-orange-400/70">{formatCurrency(stats.salasTaxaNova * 15)}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">(-) Despesas Fixas</span>
                <span className="font-bold text-orange-400">{stats ? formatCurrency(stats.custosFixos) : "---"}</span>
              </div>
              {stats && stats.custosManuais > 0 && (
                <div className="border-b border-white/5 pb-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">(-) Custos Extras</span>
                    <span className="font-bold text-orange-400">{formatCurrency(stats.custosManuais)}</span>
                  </div>
                  {stats.custosManualList.map((c) => (
                    <div key={c.id} className="flex justify-between text-xs pl-3">
                      <span className="text-muted-foreground/70">└ {c.descricao} <span className="opacity-60">[{c.data.split("-").reverse().join("/")}]</span></span>
                      <span className="text-orange-400/70">{formatCurrency(c.valor)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="pt-4 mt-auto">
              <div className="rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/20">
                <div className="text-xs font-bold uppercase text-emerald-400 mb-1">Lucro Líquido Real</div>
                <div className="text-3xl font-black text-white">
                  {stats ? formatCurrency(stats.lucroReal) : "---"}
                </div>
              </div>
              <p className="mt-3 text-[10px] text-muted-foreground flex items-center gap-1">
                <Info size={12} />
                Valores calculados com base em todas as salas realizadas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
