import { Link, useParams } from "react-router-dom";
import { 
  ArrowRight, 
  CalendarDays, 
  Trophy, 
  Loader2, 
  Search, 
  ChevronDown, 
  ChevronRight,
  Swords,
  DollarSign,
  Medal
} from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import SEO from "@/components/SEO";
import ExpandableDescription from "@/components/ExpandableDescription";
import { useTorneios, useResultados } from "@/hooks/useRanking";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// Decodifica "Nome|kills" → { nome, kills } ou { nome, kills: null } para nomes sem kills
const parseJogador = (s: string): { nome: string; kills: number | null } => {
  const idx = s.lastIndexOf("|");
  if (idx === -1) return { nome: s, kills: null };
  return { nome: s.substring(0, idx), kills: Number(s.substring(idx + 1)) };
};

const titleForDate = (date?: string) =>
  date
    ? `Ranking Campeonato Free Fire Duo | Classificação ${date}`
    : "Ranking Campeonato Free Fire Duo | Classificação";

const descriptionForDate = (date?: string) =>
  date
    ? `Confira o ranking do Campeonato Free Fire Duo Diário Duo TRZ na data ${date}, com kills, colocação e valor ganho por jogador.`
    : "Confira o ranking do Campeonato Free Fire Duo Diário Duo TRZ com classificação, kills, colocação e valor ganho por data.";

const Ranking = () => {
  const { data: dateParam, torneioId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { data: torneios, isLoading: loadingTorneios } = useTorneios();

  // Encontrar o torneio ativo (por id, por data, ou o mais recente)
  const activeTorneio = useMemo(() => {
    if (!torneios) return null;
    if (torneioId) {
      return torneios.find(t => t.id === torneioId);
    }
    if (dateParam) {
      return torneios.find(t => format(parseISO(t.data_torneio), "yyyy-MM-dd") === dateParam);
    }
    return torneios[0];
  }, [torneios, dateParam, torneioId]);

  const { data: resultados, isLoading: loadingResultados } = useResultados(activeTorneio?.id);

  // Efeito para scroll automático ao trocar de torneio/data
  useEffect(() => {
    if (resultsRef.current && (dateParam || activeTorneio)) {
      const yOffset = -100; // Offset para não colar no topo
      const element = resultsRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [dateParam, activeTorneio?.id]);

  // Detecta quais datas têm mais de um torneio (colisão de data)
  const datasComColisao = useMemo(() => {
    if (!torneios) return new Set<string>();
    const count: Record<string, number> = {};
    torneios.forEach(t => {
      const d = format(parseISO(t.data_torneio), "yyyy-MM-dd");
      count[d] = (count[d] || 0) + 1;
    });
    return new Set(Object.entries(count).filter(([, v]) => v > 1).map(([k]) => k));
  }, [torneios]);

  // Agrupar torneios por mês/ano e aplicar busca
  const groupedTorneios = useMemo(() => {
    if (!torneios) return {};

    const filtered = torneios.filter(t => {
      const dateStr = format(parseISO(t.data_torneio), "dd/MM/yyyy HH:mm");
      return (
        dateStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.nome && t.nome.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });

    const groups: Record<string, typeof torneios> = {};
    filtered.forEach(t => {
      const monthKey = format(parseISO(t.data_torneio), "MMMM yyyy", { locale: ptBR });
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(t);
    });

    return groups;
  }, [torneios, searchTerm]);

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => 
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const activeDateFormatted = activeTorneio 
    ? format(parseISO(activeTorneio.data_torneio), "dd/MM/yyyy") 
    : "...";

  const getPosColor = (pos: number) => {
    if (pos === 1) return "text-[#FFD700]"; // Gold
    if (pos === 2) return "text-[#C0C0C0]"; // Silver
    if (pos === 3) return "text-[#CD7F32]"; // Bronze
    return "text-white/80";
  };

  const getPosBadge = (pos: number) => {
    if (pos === 1) return "bg-[#FFD700]/10 border-[#FFD700]/30 text-[#FFD700]";
    if (pos === 2) return "bg-[#C0C0C0]/10 border-[#C0C0C0]/30 text-[#C0C0C0]";
    if (pos === 3) return "bg-[#CD7F32]/10 border-[#CD7F32]/30 text-[#CD7F32]";
    return "bg-white/5 border-white/10 text-white/60";
  };

  return (
    <>
      <SEO
        title={titleForDate(dateParam)}
        description={descriptionForDate(dateParam)}
        keywords="ranking free fire, classificação campeonato free fire, ranking duo, diario duo trz ranking"
        canonicalPath={dateParam ? `/ranking/${dateParam}` : "/ranking"}
      />

      <div className="container py-10 sm:py-14">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Trophy size={16} />
              Ranking do campeonato
            </div>
            <h1 className="mt-5 font-display text-4xl font-semibold text-white sm:text-5xl">
              <span className="text-primary">Ranking</span> Geral
            </h1>
            <ExpandableDescription text="Veja a classificação oficial sincronizada em tempo real com o banco de dados. Os dados abaixo refletem os resultados extraídos das partidas oficiais." />
          </div>

          <div className="rounded-[1.5rem] border border-white/8 bg-card px-5 py-4 text-sm text-white/62">
            Data selecionada: <span className="font-semibold text-white">{activeDateFormatted}</span>
          </div>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-[350px_1fr]">
          {/* Sidebar de Filtros */}
          <div className="rounded-[1.8rem] border border-white/8 bg-card p-6 h-fit lg:sticky lg:top-24">
            <div className="flex items-center gap-3">
              <CalendarDays size={18} className="text-primary" />
              <h2 className="font-display text-2xl font-semibold text-white">Filtrar por data</h2>
            </div>

            <div className="mt-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type="text"
                placeholder="Buscar data (ex: 13/04)"
                className="w-full rounded-xl border border-white/8 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="mt-6 space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              <Link
                to="/ranking"
                className={`flex items-center justify-between rounded-[1rem] border px-4 py-3 text-sm transition-colors ${
                  !dateParam
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-white/6 bg-white/[0.03] text-white/68 hover:border-primary/40 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${!dateParam ? 'bg-primary' : 'bg-white/20'}`} />
                  <span>Último torneio</span>
                </div>
                <ArrowRight size={14} />
              </Link>

              {loadingTorneios ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              ) : (
                Object.entries(groupedTorneios).map(([month, items]) => {
                  const isExpanded = expandedMonths.includes(month) || searchTerm.length > 0;
                  return (
                    <div key={month} className="space-y-1">
                      <button
                        onClick={() => toggleMonth(month)}
                        className="flex w-full items-center justify-between px-2 py-2 text-xs font-bold uppercase tracking-wider text-white/40 hover:text-white/60"
                      >
                        {month}
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                      
                      {isExpanded && items.map((t) => {
                        const dateKey = format(parseISO(t.data_torneio), "yyyy-MM-dd");
                        const displayDate = format(parseISO(t.data_torneio), "dd/MM/yyyy HH:mm");
                        const selected = activeTorneio?.id === t.id;
                        const linkTo = datasComColisao.has(dateKey)
                          ? `/ranking/id/${t.id}`
                          : `/ranking/${dateKey}`;

                        return (
                          <Link
                            key={t.id}
                            to={linkTo}
                            className={`flex items-center justify-between rounded-[0.8rem] border px-4 py-2.5 text-sm transition-colors ${
                              selected
                                ? "border-primary/40 bg-primary/10 text-primary"
                                : "border-white/6 bg-white/[0.02] text-white/68 hover:border-primary/40 hover:text-white"
                            }`}
                          >
                            <span className="truncate">{displayDate}</span>
                            <ArrowRight size={12} className="shrink-0 opacity-40" />
                          </Link>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Resultados do Ranking */}
          <div className="min-h-[400px]" ref={resultsRef}>
            {loadingResultados ? (
              <div className="flex flex-col items-center justify-center h-[400px] gap-3 rounded-[1.8rem] border border-white/8 bg-card">
                <Loader2 className="animate-spin text-primary" size={32} />
                <p className="text-white/60">Carregando classificação...</p>
              </div>
            ) : (
              <>
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-hidden rounded-[1.8rem] border border-white/8 bg-card">
                  <table className="w-full text-sm">
                    <thead className="bg-white/[0.03] text-left text-white/55">
                      <tr>
                        <th className="px-6 py-4 font-medium text-center">Colocação</th>
                        <th className="px-6 py-4 font-medium">Equipe / Jogadores</th>
                        <th className="px-6 py-4 font-medium text-center">Abates (Kills)</th>
                        <th className="px-6 py-4 font-medium text-right">Valor ganho</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultados && resultados.length > 0 ? (
                        resultados.map((row) => (
                          <tr
                            key={row.id}
                            className="border-t border-white/6 text-white/72 hover:bg-white/[0.01] transition-colors"
                          >
                            <td className={`px-6 py-5 text-center font-display font-bold ${getPosColor(row.posicao)}`}>
                              <div className="flex items-center justify-center gap-2">
                                {row.posicao <= 3 && <Medal size={16} />}
                                {row.posicao}º lugar
                              </div>
                            </td>
                            <td className="px-6 py-5 font-medium text-white">
                              {row.jogadores && row.jogadores.length > 0
                                ? row.jogadores.map(j => parseJogador(j).nome).join(" & ")
                                : row.identificador_equipe}
                            </td>
                            <td className="px-6 py-5 text-center">
                              <div className="font-bold text-white/90">{row.kills} kills</div>
                              {row.jogadores?.some(j => j.includes("|")) && (
                                <div className="text-[11px] text-white/40 mt-0.5 space-x-1">
                                  {row.jogadores.map((j, i) => {
                                    const p = parseJogador(j);
                                    return (
                                      <span key={i}>
                                        {i > 0 && <span className="text-white/20">·</span>}{" "}
                                        {p.nome}: {p.kills}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-5 text-right font-semibold text-primary">
                              <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 border border-primary/20">
                                R$ {Number(row.premio_total).toFixed(2).replace(".", ",")}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-5 py-20 text-center text-white/40 italic">
                            Nenhum resultado disponível para esta data.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Cards */}
                <div className="md:hidden space-y-4">
                  {resultados && resultados.length > 0 ? (
                    resultados.map((row) => (
                      <div 
                        key={row.id}
                        className="rounded-[1.5rem] border border-white/8 bg-card p-5 space-y-4 overflow-hidden relative"
                      >
                        {/* Background position indicator for mobile cards */}
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                          <Trophy size={100} />
                        </div>

                        <div className="flex items-center gap-4">
                          <div className={`shrink-0 rounded-2xl border px-4 py-2 font-display font-black text-xl shadow-lg ${getPosBadge(row.posicao)}`}>
                            {row.posicao}º
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs text-white/40 uppercase tracking-wider mb-0.5">Equipe / Jogadores</div>
                            <div className="text-lg font-bold text-white leading-tight">
                              {row.jogadores && row.jogadores.length > 0
                                ? row.jogadores.map(j => parseJogador(j).nome).join(" & ")
                                : row.identificador_equipe}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="rounded-2xl bg-white/[0.03] border border-white/6 p-3">
                            <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                              <Swords size={12} />
                              Abates
                            </div>
                            <div className="text-xl font-bold text-white">
                              {row.kills} <span className="text-xs text-white/40 font-normal ml-1">kills</span>
                            </div>
                            {row.jogadores?.some(j => j.includes("|")) && (
                              <div className="text-[10px] text-white/40 mt-1 space-y-0.5">
                                {row.jogadores.map((j, i) => {
                                  const p = parseJogador(j);
                                  return <div key={i}>{p.nome}: {p.kills}</div>;
                                })}
                              </div>
                            )}
                          </div>
                          
                          <div className="rounded-2xl bg-primary/10 border border-primary/20 p-3">
                            <div className="flex items-center gap-2 text-primary/60 text-xs mb-1">
                              <DollarSign size={12} />
                              Premiação
                            </div>
                            <div className="text-xl font-bold text-primary">
                              <span className="text-xs mr-0.5">R$</span> {Number(row.premio_total).toFixed(2).replace(".", ",")}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.8rem] border border-white/8 bg-card p-20 text-center text-white/40 italic">
                      Nenhum resultado disponível para esta data.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Ranking;
