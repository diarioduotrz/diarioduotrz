import { useState, useMemo } from "react";
import { Upload, Loader2, Check, Trash2, Plus, Save, RotateCcw, ChevronRight, Eye, ChevronDown, Medal, Gamepad2, Target } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { extrairDadosDaPartida, type ExtractedResult } from "@/services/ai-service";
import { calcularPremioEquipe } from "@/utils/calculadora";
import { supabase } from "@/integrations/supabase/client";
import { useTorneios, useResultados } from "@/hooks/useRanking";
import { useQueryClient } from "@tanstack/react-query";
import { useConfig } from "@/hooks/useAdmin";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

type Step = "upload" | "review" | "saved";

const MODOS = ["DUO", "SOLO", "SQUAD"];

const AdminUploadCentral = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upload");
  const { data: torneios, refetch: refetchTorneios } = useTorneios();

  // Estado do fluxo de upload
  const [step, setStep] = useState<Step>("upload");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedResult[]>([]);
  const [nomeTorneio, setNomeTorneio] = useState("Competição Rápida");
  const [modo, setModo] = useState("DUO");

  // Configs do banco
  const { data: dbGeminiKey } = useConfig("gemini_api_key");
  const { data: dbPremios } = useConfig("premios_padrao");

  const regrasCalculo = dbPremios
    ? {
        valorEntrada: Number((dbPremios as any).valorInscricao || 5),
        vagas: Number((dbPremios as any).vagas || 24),
        valorPorKill: Number((dbPremios as any).valorPorKill || 1),
        premiosPosicao: ((dbPremios as any).premios || []).reduce(
          (acc: any, p: any) => ({ ...acc, [p.posicao]: Number(p.valor) }),
          {}
        ),
      }
    : null;

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!dbGeminiKey) {
      toast({ title: "Chave Gemini não configurada!", description: "Configure em /admin/config antes de continuar.", variant: "destructive" });
      return;
    }
    if (!dbPremios) {
      toast({ title: "Premiações não configuradas!", description: "Configure em /admin/torneios antes de continuar.", variant: "destructive" });
      return;
    }

    const fileList = Array.from(files);
    // Reset input para permitir re-upload dos mesmos arquivos
    event.target.value = "";

    setIsAnalyzing(true);
    setStep("upload");

    try {
      let allData: ExtractedResult[] = [];
      let lastBase64 = "";

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setAnalyzeProgress(`Analisando imagem ${i + 1} de ${fileList.length}...`);
        const base64 = await toBase64(file);
        if (i === 0) lastBase64 = base64;

        const data = await extrairDadosDaPartida(base64, String(dbGeminiKey), file.type);
        if (data && data.length > 0) allData = allData.concat(data);
      }

      if (allData.length === 0) throw new Error("Nenhum dado extraído. Tente com imagens mais nítidas.");

      setPreviewUrl(lastBase64);
      setExtractedData(allData);
      setStep("review");
    } catch (error: any) {
      toast({ title: "Erro na extração", description: error.message, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
      setAnalyzeProgress("");
    }
  };

  const handleSave = async () => {
    if (!regrasCalculo) return;
    setIsSaving(true);

    try {
      const { data: torneio, error: tError } = await supabase
        .from("torneios")
        .insert({
          nome: nomeTorneio,
          data_torneio: new Date().toISOString(),
          modo,
          configuracao_json: {
            entryFee: regrasCalculo.valorEntrada,
            slotsSold: extractedData.length,
            valorPorKill: regrasCalculo.valorPorKill,
            premiosPosicao: regrasCalculo.premiosPosicao,
          },
        })
        .select()
        .single();

      if (tError) throw tError;

      const formattedResults = extractedData.map((r) => {
        const premios = calcularPremioEquipe(r.abates, r.posicao, regrasCalculo);
        return {
          torneio_id: torneio.id,
          identificador_equipe: r.jogadores.join(" + "),
          jogadores: r.jogadores,
          kills: r.abates,
          posicao: r.posicao,
          premio_kill: premios.porKill,
          premio_posicao: premios.porPosicao,
          premio_total: premios.total,
        };
      });

      const { error: rError } = await supabase.from("resultados").insert(formattedResults);
      if (rError) throw rError;

      toast({ title: "Torneio salvo!", description: `${extractedData.length} equipes registradas com sucesso.` });
      setStep("saved");
      refetchTorneios();
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setExtractedData([]);
    setPreviewUrl(null);
    setNomeTorneio("Competição Rápida");
    setModo("DUO");
  };

  // Edição inline da tabela de resultados extraídos
  const updateRow = (index: number, field: keyof ExtractedResult, value: string | number) => {
    const updated = [...extractedData];
    if (field === "jogadores") {
      // Converte string "Jogador1 + Jogador2" de volta para array
      updated[index] = { ...updated[index], jogadores: String(value).split("+").map(s => s.trim()).filter(Boolean) };
    } else {
      updated[index] = { ...updated[index], [field]: Number(value) };
    }
    setExtractedData(updated);
  };

  const removeRow = (index: number) => {
    setExtractedData(extractedData.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setExtractedData([
      ...extractedData,
      { posicao: extractedData.length + 1, jogadores: [""], abates: 0 },
    ]);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col gap-4 border-b border-border/50 pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Upload size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Upload & Ranking</h1>
              <p className="text-sm text-muted-foreground font-medium">Processamento de prints e visualização de rankings</p>
            </div>
          </div>

          <TabsList className="bg-muted/50 p-1 w-full md:w-auto">
            <TabsTrigger value="upload" className="gap-2">Upload IA</TabsTrigger>
            <TabsTrigger value="ranking" className="gap-2">Rankings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="upload" className="space-y-6 pt-6">
          {/* Breadcrumb de etapas */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className={step === "upload" ? "text-primary font-bold" : "text-white/40"}>1. Upload</span>
            <ChevronRight size={14} />
            <span className={step === "review" ? "text-primary font-bold" : "text-white/40"}>2. Revisar</span>
            <ChevronRight size={14} />
            <span className={step === "saved" ? "text-green-400 font-bold" : "text-white/40"}>3. Salvo</span>
          </div>

          {/* ETAPA 1: Upload */}
          {step === "upload" && (
            <div className="rounded-xl border-2 border-dashed border-border/50 bg-card p-10 md:p-16 text-center transition-all hover:border-primary/50 group relative">
              <input
                type="file"
                multiple
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                accept="image/*"
                disabled={isAnalyzing}
              />
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-white/5 text-muted-foreground group-hover:text-primary transition-colors">
                  {isAnalyzing ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    {isAnalyzing ? analyzeProgress || "Analisando..." : "Arraste os prints aqui"}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium mt-1">
                    {isAnalyzing ? "A IA está extraindo os dados das imagens." : "Suporta múltiplos arquivos — PNG, JPG e WEBP."}
                  </p>
                </div>
              </div>
              {!isAnalyzing && (
                <div className="mt-8 flex justify-center">
                  <Button className="bg-[#FFB800] hover:bg-[#E6A600] text-black font-bold h-12 px-10 gap-2 rounded-lg shadow-lg">
                    <Upload size={18} /> Selecionar imagens
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ETAPA 2: Revisar */}
          {step === "review" && (
            <div className="space-y-6">
              {/* Preview + configurações do torneio */}
              <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
                {previewUrl && (
                  <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
                    <p className="text-xs text-muted-foreground px-4 py-2 border-b border-border/50">Preview da imagem</p>
                    <img src={previewUrl} alt="Print enviado" className="w-full object-contain max-h-64" />
                  </div>
                )}
                <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
                  <h3 className="font-bold text-white">Dados do Torneio</h3>
                  <div>
                    <Label className="text-xs text-muted-foreground">Nome do Torneio</Label>
                    <Input
                      value={nomeTorneio}
                      onChange={(e) => setNomeTorneio(e.target.value)}
                      className="mt-1 bg-white/[0.02]"
                      placeholder="Ex: Competição Rápida"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Modo</Label>
                    <div className="flex gap-2 mt-1">
                      {MODOS.map((m) => (
                        <button
                          key={m}
                          onClick={() => setModo(m)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
                            modo === m
                              ? "bg-primary/20 border-primary text-primary"
                              : "border-border/50 text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  {regrasCalculo && (
                    <div className="text-xs text-muted-foreground pt-2 border-t border-border/50 space-y-1">
                      <p>Inscrição: <span className="text-white font-bold">R$ {regrasCalculo.valorEntrada.toFixed(2)}</span></p>
                      <p>Equipes extraídas: <span className="text-white font-bold">{extractedData.length}</span></p>
                      <p>Arrecadação estimada: <span className="text-primary font-bold">R$ {(regrasCalculo.valorEntrada * extractedData.length).toFixed(2)}</span></p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabela editável */}
              <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                  <h3 className="font-bold text-white">Resultados Extraídos pela IA</h3>
                  <span className="text-xs text-muted-foreground">Edite antes de salvar se houver erros</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/[0.02] text-left text-muted-foreground text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 w-16">Pos</th>
                        <th className="px-4 py-3">Jogadores (use + para separar dupla)</th>
                        <th className="px-4 py-3 w-24">Kills</th>
                        {regrasCalculo && <th className="px-4 py-3 w-28 text-right">Prêmio</th>}
                        <th className="px-4 py-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {extractedData.map((row, index) => {
                        const premio = regrasCalculo
                          ? calcularPremioEquipe(row.abates, row.posicao, regrasCalculo)
                          : null;
                        return (
                          <tr key={index} className="hover:bg-white/[0.01]">
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                value={row.posicao}
                                onChange={(e) => updateRow(index, "posicao", e.target.value)}
                                className="h-8 w-14 bg-transparent border-border/30 text-center"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                value={row.jogadores.join(" + ")}
                                onChange={(e) => updateRow(index, "jogadores", e.target.value)}
                                placeholder="Jogador1 + Jogador2"
                                className="h-8 bg-transparent border-border/30"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                value={row.abates}
                                onChange={(e) => updateRow(index, "abates", e.target.value)}
                                className="h-8 w-20 bg-transparent border-border/30 text-center"
                              />
                            </td>
                            {regrasCalculo && (
                              <td className="px-4 py-2 text-right font-semibold text-primary">
                                R$ {premio?.total.toFixed(2).replace(".", ",")}
                              </td>
                            )}
                            <td className="px-4 py-2">
                              <button
                                onClick={() => removeRow(index)}
                                className="text-muted-foreground hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 border-t border-border/50">
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={addRow}>
                    <Plus size={14} /> Adicionar linha
                  </Button>
                </div>
              </div>

              {/* Ações */}
              <div className="flex justify-between">
                <Button variant="outline" className="gap-2" onClick={handleReset}>
                  <RotateCcw size={16} /> Novo upload
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || extractedData.length === 0 || !nomeTorneio}
                  className="gap-2 bg-[#FFB800] hover:bg-[#E6A600] text-black font-bold px-8"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Salvar no banco de dados
                </Button>
              </div>
            </div>
          )}

          {/* ETAPA 3: Salvo */}
          {step === "saved" && (
            <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="text-green-400" size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Torneio salvo com sucesso!</h3>
                <p className="text-muted-foreground mt-1">{extractedData.length} equipes registradas no ranking.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  <Upload size={16} /> Novo upload
                </Button>
                <Button
                  onClick={() => setActiveTab("ranking")}
                  className="gap-2"
                >
                  Ver Rankings
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ranking" className="space-y-4 pt-6">
          <RankingTab torneios={torneios ?? []} onRefetch={refetchTorneios} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ─── Ranking Tab ─────────────────────────────────────────────────────────────

type Torneio = { id: string; nome: string; data_torneio: string; modo: string | null; configuracao_json: any };

const getPosColor = (pos: number) => {
  if (pos === 1) return "text-[#FFD700]";
  if (pos === 2) return "text-[#C0C0C0]";
  if (pos === 3) return "text-[#CD7F32]";
  return "text-white/70";
};

function TorneioModal({ torneio, onClose }: { torneio: Torneio; onClose: () => void }) {
  const { data: resultados, isLoading } = useResultados(torneio.id);

  const totalPremios = resultados?.reduce((s, r) => s + Number(r.premio_total || 0), 0) ?? 0;
  const totalKills = resultados?.reduce((s, r) => s + Number(r.kills || 0), 0) ?? 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-background border-border/50 p-0">
        {/* Header */}
        <div className="bg-card border-b border-border/50 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  {torneio.modo}
                </span>
              </div>
              <DialogTitle className="text-white text-xl font-bold">{torneio.nome}</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm mt-1">
                {format(parseISO(torneio.data_torneio), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </DialogDescription>
            </div>
          </div>

          {/* Totais resumo */}
          {!isLoading && resultados && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: "Equipes", value: resultados.length },
                { label: "Total Kills", value: totalKills },
                { label: "Prêmios Pagos", value: `R$ ${totalPremios.toFixed(2).replace(".", ",")}` },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-white/[0.04] border border-white/8 px-4 py-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
                  <div className="font-bold text-white">{s.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resultados */}
        <div className="px-6 py-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary" size={28} />
            </div>
          ) : (
            <div className="space-y-2">
              {resultados?.map((r) => {
                const pos = r.posicao ?? 0;
                const nome = r.jogadores && r.jogadores.length > 0
                  ? r.jogadores.join(" + ")
                  : r.identificador_equipe;
                const isPodium = pos <= 3;
                return (
                  <div
                    key={r.id}
                    className={`flex items-center gap-4 rounded-xl px-4 py-3 border ${
                      pos === 1 ? "border-[#FFD700]/20 bg-[#FFD700]/5" :
                      pos === 2 ? "border-[#C0C0C0]/20 bg-[#C0C0C0]/5" :
                      pos === 3 ? "border-[#CD7F32]/20 bg-[#CD7F32]/5" :
                      "border-white/6 bg-white/[0.02]"
                    }`}
                  >
                    {/* Posição */}
                    <div className={`w-10 text-center font-black text-lg shrink-0 ${getPosColor(pos)}`}>
                      {isPodium ? <Medal size={20} className="mx-auto" /> : `${pos}º`}
                    </div>

                    {/* Nome */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">{nome}</div>
                      {isPodium && (
                        <div className={`text-xs font-semibold ${getPosColor(pos)}`}>
                          {pos === 1 ? "🥇 Campeão" : pos === 2 ? "🥈 Vice" : "🥉 3º lugar"}
                        </div>
                      )}
                    </div>

                    {/* Kills */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Target size={13} className="text-red-400" />
                      <span className="text-white/80 font-semibold text-sm">{r.kills}</span>
                    </div>

                    {/* Prêmio */}
                    <div className="shrink-0 text-right">
                      <span className="inline-flex items-center rounded-lg bg-primary/10 border border-primary/20 px-3 py-1 text-sm font-bold text-primary">
                        R$ {Number(r.premio_total).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmDeleteModal({ nome, onConfirm, onCancel, isDeleting }: {
  nome: string; onConfirm: () => void; onCancel: () => void; isDeleting: boolean;
}) {
  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-sm bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-white">Excluir partida?</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            Isso removerá <span className="text-white font-semibold">"{nome}"</span> e todos os
            resultados associados. Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>Cancelar</Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RankingTab({ torneios, onRefetch }: { torneios: Torneio[]; onRefetch: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTorneio, setSelectedTorneio] = useState<Torneio | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Torneio | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // Agrupa torneios por mês
  const grouped = useMemo(() => {
    const groups: Record<string, Torneio[]> = {};
    torneios.forEach((t) => {
      const key = format(parseISO(t.data_torneio), "MMMM yyyy", { locale: ptBR });
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return groups;
  }, [torneios]);

  const months = Object.keys(grouped);

  // Inicializa com o mês mais recente aberto
  const [expandedMonths, setExpandedMonths] = useState<string[]>(() =>
    months.length > 0 ? [months[0]] : []
  );

  const toggleMonth = (m: string) =>
    setExpandedMonths((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      // Deleta resultados e verifica se houve permissão
      const { error: errResultados } = await supabase
        .from("resultados")
        .delete()
        .eq("torneio_id", deleteTarget.id);
      if (errResultados) throw new Error(`Erro ao excluir resultados: ${errResultados.message}`);

      // Deleta torneio e usa .select() para confirmar que a linha foi removida
      const { data: deletedTorneio, error: errTorneio } = await supabase
        .from("torneios")
        .delete()
        .eq("id", deleteTarget.id)
        .select("id");
      if (errTorneio) throw new Error(`Erro ao excluir torneio: ${errTorneio.message}`);
      if (!deletedTorneio || deletedTorneio.length === 0) {
        throw new Error("Sem permissão para excluir. Habilite DELETE nas políticas RLS da tabela 'torneios' no painel do Supabase.");
      }

      toast({ title: "Partida excluída com sucesso." });
      queryClient.invalidateQueries({ queryKey: ["torneios"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      onRefetch();
    } catch (e: any) {
      toast({ title: "Erro ao excluir", description: e.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (torneios.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-16 text-center text-muted-foreground italic">
        Nenhuma partida registrada.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {months.map((month) => {
          const items = grouped[month];
          const isOpen = expandedMonths.includes(month);
          return (
            <div key={month} className="rounded-xl border border-border/50 bg-card overflow-hidden">
              {/* Cabeçalho do mês */}
              <button
                onClick={() => toggleMonth(month)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Gamepad2 size={16} className="text-primary" />
                  <span className="font-bold text-white capitalize">{month}</span>
                  <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
                    {items.length} {items.length === 1 ? "partida" : "partidas"}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Lista de torneios do mês */}
              {isOpen && (
                <div className="border-t border-border/50 divide-y divide-white/5">
                  {items.map((t) => (
                    <div key={t.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.01]">
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="text-muted-foreground text-xs shrink-0">
                          {format(parseISO(t.data_torneio), "dd/MM HH:mm")}
                        </span>
                        <span className="font-semibold text-white truncate">{t.nome}</span>
                        <span className="hidden sm:inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary shrink-0">
                          {t.modo}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-primary font-semibold h-8"
                          onClick={() => setSelectedTorneio(t)}
                        >
                          <Eye size={14} /> Ver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8"
                          onClick={() => setDeleteTarget(t)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedTorneio && (
        <TorneioModal torneio={selectedTorneio} onClose={() => setSelectedTorneio(null)} />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          nome={deleteTarget.nome}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}

export default AdminUploadCentral;
