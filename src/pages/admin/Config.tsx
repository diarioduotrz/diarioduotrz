import { Bot, Save, BookOpen, Loader2, Coins } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useConfig, useUpdateConfig } from "@/hooks/useAdmin";

const AdminConfig = () => {
  const { data: dbAiSettings, isLoading: loadingAi } = useConfig("ai_settings");
  const { data: dbCustos, isLoading: loadingCustos } = useConfig("config_custos");
  const updateConfig = useUpdateConfig();

  const [aiConfig, setAiConfig] = useState({
    systemPrompt: "",
    knowledgeBase: "",
  });

  const [custos, setCustos] = useState({
    custoPorSala: 15,
    custosFixos: 0,
  });

  useEffect(() => {
    if (dbAiSettings) {
      setAiConfig(dbAiSettings as { systemPrompt: string; knowledgeBase: string });
    }
  }, [dbAiSettings]);

  useEffect(() => {
    if (dbCustos) {
      setCustos(dbCustos as { custoPorSala: number; custosFixos: number });
    }
  }, [dbCustos]);

  const handleSave = async () => {
    await updateConfig.mutateAsync({ chave: "ai_settings", valor: aiConfig });
    await updateConfig.mutateAsync({ chave: "config_custos", valor: custos });
  };

  if (loadingAi || loadingCustos) {
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-semibold">Taxa ADM por Sala (R$)</Label>
              <input
                type="number"
                value={custos.custoPorSala}
                onChange={(e) => setCustos({ ...custos, custoPorSala: Number(e.target.value) })}
                className="flex h-10 w-full rounded-md border border-input bg-white/[0.02] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-[10px] text-muted-foreground italic">Valor pago ao funcionário por cada sala realizada.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-semibold">Despesas Fixas Mensais (R$)</Label>
              <input
                type="number"
                value={custos.custosFixos}
                onChange={(e) => setCustos({ ...custos, custosFixos: Number(e.target.value) })}
                className="flex h-10 w-full rounded-md border border-input bg-white/[0.02] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-[10px] text-muted-foreground italic">Ex: WhatsApp, Anúncios Patrocinados, Servidores.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfig;
