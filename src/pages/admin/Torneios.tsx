import { Clock, Trophy, Shield, Plus, Save, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useConfig, useUpdateConfig } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";

const Torneios = () => {
  const { toast } = useToast();
  const updateConfig = useUpdateConfig();

  // Horários
  const { data: dbHorarios } = useConfig("horarios_disponiveis");
  const [horarios, setHorarios] = useState<string[]>([]);
  const [novoHorario, setNovoHorario] = useState("");

  // Premiações
  const { data: dbPremios } = useConfig("premios_padrao");
  const [premiosConfig, setPremiosConfig] = useState({
    valorInscricao: "5.00",
    vagas: "24",
    valorPorKill: "1.00",
    premios: [
      { posicao: 1, valor: "20.00" },
      { posicao: 2, valor: "5.00" },
    ]
  });

  // Regras
  const { data: dbRegras } = useConfig("regras_campeonato");
  const [regras, setRegras] = useState("");

  useEffect(() => {
    if (dbHorarios) setHorarios(dbHorarios as string[]);
  }, [dbHorarios]);

  useEffect(() => {
    if (dbPremios) {
      const config = dbPremios as any;
      // Garante que os prêmios estejam ordenados por posição
      const premiosOrdenados = [...(config.premios || [])].sort(
        (a: any, b: any) => Number(a.posicao) - Number(b.posicao)
      );
      setPremiosConfig({ ...config, premios: premiosOrdenados });
    }
  }, [dbPremios]);

  useEffect(() => {
    if (dbRegras) setRegras((dbRegras as any).markdown || "");
  }, [dbRegras]);

  // Handlers Horários
  const handleAddHorario = async () => {
    if (!novoHorario) return;
    const novosHorarios = [...horarios, novoHorario].sort();
    const anteriores = horarios;
    setHorarios(novosHorarios);
    setNovoHorario("");
    try {
      await updateConfig.mutateAsync({ chave: "horarios_disponiveis", valor: novosHorarios });
    } catch {
      setHorarios(anteriores);
      setNovoHorario(novoHorario);
    }
  };

  const handleRemoverHorario = async (h: string) => {
    const novosHorarios = horarios.filter(x => x !== h);
    const anteriores = horarios;
    setHorarios(novosHorarios);
    try {
      await updateConfig.mutateAsync({ chave: "horarios_disponiveis", valor: novosHorarios });
    } catch {
      setHorarios(anteriores);
    }
  };

  // Handlers Premiações
  const handleSavePremios = async () => {
    await updateConfig.mutateAsync({ chave: "premios_padrao", valor: premiosConfig }).catch(() => {});
  };

  const addPremioPosicao = () => {
    const nextPos = premiosConfig.premios.length + 1;
    setPremiosConfig({
      ...premiosConfig,
      premios: [...premiosConfig.premios, { posicao: nextPos, valor: "0.00" }]
    });
  };

  const removePremioPosicao = (index: number) => {
    const newList = premiosConfig.premios
      .filter((_, i) => i !== index)
      .map((p, i) => ({ ...p, posicao: i + 1 }));
    setPremiosConfig({ ...premiosConfig, premios: newList });
  };

  // Handlers Regras
  const handleSaveRegras = async () => {
    await updateConfig.mutateAsync({ chave: "regras_campeonato", valor: { markdown: regras } }).catch(() => {});
  };

  // Não bloqueia a tela inteira — cada seção mostra seu próprio loading

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Trophy size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Torneios</h1>
            <p className="text-sm text-muted-foreground font-medium">Gerencie horários, premiações e regras dos torneios</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="horarios" className="w-full">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="horarios" className="gap-2"><Clock size={16} /> Horários</TabsTrigger>
          <TabsTrigger value="premiacoes" className="gap-2"><Trophy size={16} /> Premiações</TabsTrigger>
          <TabsTrigger value="regras" className="gap-2"><Shield size={16} /> Regras</TabsTrigger>
        </TabsList>

        <TabsContent value="horarios" className="space-y-6 pt-6">
          <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-white flex items-center justify-between">
              Grade de Horários
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {horarios.map((h) => (
                <div key={h} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-muted-foreground" />
                    <span className="font-bold text-lg">{h}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoverHorario(h)} className="text-muted-foreground hover:text-red-500">
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3 items-center p-4 border border-border/50 rounded-lg bg-white/[0.01]">
              <Input 
                type="time" 
                value={novoHorario} 
                onChange={e => setNovoHorario(e.target.value)} 
                className="w-auto border-border/50" 
              />
              <Button onClick={handleAddHorario} className="gap-2" disabled={!novoHorario || updateConfig.isPending}>
                <Plus size={16} /> Adicionar Horário
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="premiacoes" className="space-y-6 pt-6">
          <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
            <h3 className="mb-6 text-sm font-bold text-primary tracking-widest flex items-center justify-between">
              Configurações Padrão
              <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-1 rounded font-normal">Valores Base</span>
            </h3>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-8 pb-8 border-b border-border/50">
              <div>
                <Label className="text-xs text-muted-foreground">Inscrição (R$)</Label>
                <Input type="number" step="0.01" value={premiosConfig.valorInscricao} onChange={e => setPremiosConfig({...premiosConfig, valorInscricao: e.target.value})} className="mt-1 h-11 bg-white/[0.02]" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Vagas</Label>
                <Input type="number" value={premiosConfig.vagas} onChange={e => setPremiosConfig({...premiosConfig, vagas: e.target.value})} className="mt-1 h-11 bg-white/[0.02]" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Valor por Kill (R$)</Label>
                <Input type="number" step="0.01" value={premiosConfig.valorPorKill} onChange={e => setPremiosConfig({...premiosConfig, valorPorKill: e.target.value})} className="mt-1 h-11 bg-primary/10 border-primary/20 text-primary font-bold" />
              </div>
            </div>

            <h4 className="mb-4 text-xs font-bold text-yellow-500 tracking-widest uppercase">Prêmios por Colocação</h4>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-6">
              {premiosConfig.premios.map((p, idx) => (
                <div key={idx} className="flex flex-col gap-2 p-4 rounded-lg border border-border/50 bg-white/[0.02] relative group">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-bold text-white flex items-center gap-2">
                      <MedalIcon pos={p.posicao} /> Top {p.posicao}
                    </Label>
                    {idx > 0 && (
                      <button onClick={() => removePremioPosicao(idx)} className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">R$</span>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={p.valor} 
                      onChange={(e) => {
                        const newList = [...premiosConfig.premios];
                        newList[idx].valor = e.target.value;
                        setPremiosConfig({...premiosConfig, premios: newList});
                      }} 
                      className="pl-9 h-11 bg-black/20" 
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full border-dashed h-12 gap-2 text-primary hover:bg-primary/5" onClick={addPremioPosicao}>
              <Plus size={18} /> Adicionar Top {premiosConfig.premios.length + 1}
            </Button>

            <div className="mt-8 flex justify-end pt-4 border-t border-border/50">
              <Button onClick={handleSavePremios} disabled={updateConfig.isPending} className="gap-2 h-11 px-8 font-bold">
                {updateConfig.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Salvar Premiações
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="regras" className="space-y-6 pt-6">
          <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-white flex items-center justify-between">
              Editor de Regras (Markdown)
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Use a sintaxe Markdown para formatar o texto. Exemplo: <code># Título</code>, <code>**Negrito**</code>, <code>- Lista</code>.</p>
            <Textarea
              value={regras}
              onChange={e => setRegras(e.target.value)}
              className="min-h-[400px] bg-white/[0.02] font-mono text-sm"
              placeholder="# Regras do Campeonato..."
            />
            <div className="mt-4 flex justify-end">
               <Button onClick={handleSaveRegras} disabled={updateConfig.isPending} className="gap-2 h-11 px-8 font-bold">
                {updateConfig.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Salvar Regras
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const MedalIcon = ({ pos }: { pos: number }) => {
  if (pos === 1) return <Trophy size={16} className="text-yellow-500" />;
  if (pos === 2) return <Trophy size={16} className="text-gray-400" />;
  if (pos === 3) return <Trophy size={16} className="text-amber-600" />;
  return <Trophy size={16} className="text-muted-foreground" />;
}

export default Torneios;
