import { Bot, Save, Loader2, Coins, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useConfig, useUpdateConfig } from "@/hooks/useAdmin";

type CustoManual = { id: string; data: string; descricao: string; valor: number };

const inputClass =
  "flex h-10 w-full rounded-md border border-input bg-white/[0.02] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const AdminConfig = () => {
  const { data: dbAiSettings, isLoading: loadingAi } = useConfig("ai_settings");
  const { data: dbCustos, isLoading: loadingCustos } = useConfig("config_custos");
  const { data: dbCustosExtras, isLoading: loadingExtras } = useConfig("custos_manuais");
  const updateConfig = useUpdateConfig();

  const [aiConfig, setAiConfig] = useState({
    systemPrompt: "",
    knowledgeBase: "",
  });

  const [custos, setCustos] = useState({
    custoPorSala: 15,
    custosFixos: 0,
    dataFimAdm: "2026-04-27",
  });

  const [custosExtras, setCustosExtras] = useState<CustoManual[]>([]);
  const [novoExtra, setNovoExtra] = useState({ data: "", descricao: "", valor: "" });

  useEffect(() => {
    if (dbAiSettings) {
      setAiConfig(dbAiSettings as { systemPrompt: string; knowledgeBase: string });
    }
  }, [dbAiSettings]);

  useEffect(() => {
    if (dbCustos) {
      const loaded = dbCustos as any;
      setCustos({
        custoPorSala: loaded.custoPorSala ?? 15,
        custosFixos: loaded.custosFixos ?? 0,
        dataFimAdm: loaded.dataFimAdm ?? "2026-04-27",
      });
    }
  }, [dbCustos]);

  useEffect(() => {
    if (dbCustosExtras && Array.isArray(dbCustosExtras)) {
      setCustosExtras(dbCustosExtras as CustoManual[]);
    }
  }, [dbCustosExtras]);

  const handleSave = async () => {
    await updateConfig.mutateAsync({ chave: "ai_settings", valor: aiConfig });
    await updateConfig.mutateAsync({ chave: "config_custos", valor: custos });
  };

  const handleAddExtra = async () => {
    if (!novoExtra.data || !novoExtra.descricao || !novoExtra.valor) return;
    const novo: CustoManual = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      data: novoExtra.data,
      descricao: novoExtra.descricao,
      valor: Number(novoExtra.valor),
    };
    const updated = [...custosExtras, novo].sort((a, b) => a.data.localeCompare(b.data));
    setCustosExtras(updated);
    setNovoExtra({ data: "", descricao: "", valor: "" });
    await updateConfig.mutateAsync({ chave: "custos_manuais", valor: updated });
  };

  const handleDeleteExtra = async (id: string) => {
    const updated = custosExtras.filter((c) => c.id !== id);
    setCustosExtras(updated);
    await updateConfig.mutateAsync({ chave: "custos_manuais", valor: updated });
  };

  if (loadingAi || loadingCustos || loadingExtras) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pb-10 space-y-6">
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Assistente IA</h1>
            <p className="text-sm text-muted-foreground font-medium">Configure a personalidade e base de conhecimento da IA</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateConfig.isPending}
          className="gap-2 h-10 px-6 font-bold"
        >
          {updateConfig.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Salvar configurações
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bot className="text-primary" size={20} />
            Personalidade da IA
          </h2>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground font-semibold">System prompt (Instruções de comportamento)</Label>
            <Textarea
              value={aiConfig.systemPrompt}
              onChange={(e) => setAiConfig({ ...aiConfig, systemPrompt: e.target.value })}
              placeholder="Ex: Você é um assistente amigável do campeonato Free Fire..."
              className="min-h-[120px] bg-white/[0.02]"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Coins className="text-primary" size={20} />
            Gestão Financeira e Custos
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-semibold">Taxa ADM por Sala (R$)</Label>
              <input
                type="number"
                value={custos.custoPorSala}
                onChange={(e) => setCustos({ ...custos, custoPorSala: Number(e.target.value) })}
                className={inputClass}
              />
              <p className="text-[10px] text-muted-foreground italic">Valor pago ao funcionário por cada sala realizada.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-semibold">Despesas Fixas Mensais (R$)</Label>
              <input
                type="number"
                value={custos.custosFixos}
                onChange={(e) => setCustos({ ...custos, custosFixos: Number(e.target.value) })}
                className={inputClass}
              />
              <p className="text-[10px] text-muted-foreground italic">Ex: WhatsApp, Anúncios Patrocinados, Servidores.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-semibold">Data de encerramento da ADM</Label>
              <input
                type="date"
                value={custos.dataFimAdm}
                onChange={(e) => setCustos({ ...custos, dataFimAdm: e.target.value })}
                className={inputClass}
              />
              <p className="text-[10px] text-muted-foreground italic">Salas após esta data não geram custo ADM.</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Coins className="text-orange-400" size={20} />
            Custos Extras / Avulsos
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Registre gastos pontuais que serão descontados do lucro no período correspondente.</p>

          <div className="grid gap-3 md:grid-cols-4 mb-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground font-semibold">Data</Label>
              <input
                type="date"
                value={novoExtra.data}
                onChange={(e) => setNovoExtra({ ...novoExtra, data: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs text-muted-foreground font-semibold">Descrição</Label>
              <input
                type="text"
                placeholder="Ex: Pagamento ADM, Internet..."
                value={novoExtra.descricao}
                onChange={(e) => setNovoExtra({ ...novoExtra, descricao: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground font-semibold">Valor (R$)</Label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={novoExtra.valor}
                onChange={(e) => setNovoExtra({ ...novoExtra, valor: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <Button
            onClick={handleAddExtra}
            disabled={updateConfig.isPending || !novoExtra.data || !novoExtra.descricao || !novoExtra.valor}
            variant="outline"
            className="gap-2 mb-5"
          >
            {updateConfig.isPending ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
            Adicionar custo
          </Button>

          {custosExtras.length === 0 ? (
            <p className="text-sm text-muted-foreground italic text-center py-4 border border-dashed border-border/40 rounded-lg">
              Nenhum custo extra registrado.
            </p>
          ) : (
            <div className="rounded-lg border border-border/40 overflow-hidden">
              {custosExtras.map((c, i) => (
                <div
                  key={c.id}
                  className={`flex items-center justify-between px-4 py-3 text-sm ${i !== 0 ? "border-t border-border/30" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground text-xs tabular-nums w-20">
                      {c.data.split("-").reverse().join("/")}
                    </span>
                    <span className="text-white font-medium">{c.descricao}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-orange-400 font-bold tabular-nums">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c.valor)}
                    </span>
                    <button
                      onClick={() => handleDeleteExtra(c.id)}
                      disabled={updateConfig.isPending}
                      className="text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-40"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminConfig;
