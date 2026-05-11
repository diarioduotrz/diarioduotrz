import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock3,
  Loader2,
  Medal,
  ShieldCheck,
  Ticket,
  Trophy,
} from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import SEO from "@/components/SEO";
import { useTorneios } from "@/hooks/useRanking";
import { useConfig } from "@/hooks/useAdmin";
import { linktreeUrl } from "@/data/championship";
import { format, isSameDay, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const championshipHighlights = [
  {
    icon: Trophy,
    title: "TOP 1",
    description: "Premiação de R$ 20,00",
  },
  {
    icon: Medal,
    title: "TOP 2",
    description: "Premiação de R$ 5,00",
  },
  {
    icon: ShieldCheck,
    title: "TOP 3",
    description: "VNP (Vaga Grátis)",
  },
];

const Home = () => {
  const { data: torneios } = useTorneios();
  const recentTorneios = torneios?.slice(0, 5) || [];
  const { data: dbHorarios, isLoading: horariosLoading } = useConfig("horarios_disponiveis");
  const horarios: string[] = Array.isArray(dbHorarios) ? (dbHorarios as string[]).sort() : [];
  
  const [topPlayers, setTopPlayers] = useState<{name: string, kills: number}[]>([]);
  const [topPlayersDate, setTopPlayersDate] = useState<string>("");
  const [loadingTop, setLoadingTop] = useState(false);

  useEffect(() => {
    const fetchTopPlayers = async () => {
      if (!torneios) return;
      setLoadingTop(true);
      
      const today = new Date();
      let activeTournaments = torneios.filter(t => isSameDay(parseISO(t.data_torneio), today));
      
      // Se não houver hoje, pega os do dia mais recente que possui torneios
      if (activeTournaments.length === 0 && torneios.length > 0) {
        const latestDate = parseISO(torneios[0].data_torneio);
        activeTournaments = torneios.filter(t => isSameDay(parseISO(t.data_torneio), latestDate));
      }
      
      if (activeTournaments.length === 0) {
        setLoadingTop(false);
        return;
      }

      setTopPlayersDate(format(parseISO(activeTournaments[0].data_torneio), "dd/MM/yyyy"));
      const tournamentIds = activeTournaments.map(t => t.id);
      const { data: results, error } = await supabase
        .from("resultados")
        .select("jogadores, kills")
        .in("torneio_id", tournamentIds);

      if (error || !results) {
        setLoadingTop(false);
        return;
      }

      const playerKills: Record<string, number> = {};
      results.forEach(res => {
        if (!res.jogadores || res.jogadores.length === 0) return;
        const temIndividual = res.jogadores.some((j: string) => j.includes("|"));
        res.jogadores.forEach((entry: string) => {
          const idx = entry.lastIndexOf("|");
          if (idx !== -1) {
            // Kills individuais encodados: "Nome|kills"
            const nome = entry.substring(0, idx);
            const kills = Number(entry.substring(idx + 1));
            playerKills[nome] = (playerKills[nome] || 0) + kills;
          } else if (!temIndividual) {
            // Dados antigos: divide o total igualmente entre os jogadores
            const share = Math.round((res.kills || 0) / res.jogadores.length);
            playerKills[entry] = (playerKills[entry] || 0) + share;
          }
        });
      });

      const sorted = Object.entries(playerKills)
        .map(([name, kills]) => ({ name, kills }))
        .sort((a, b) => b.kills - a.kills)
        .slice(0, 3);

      setTopPlayers(sorted);
      setLoadingTop(false);
    };

    fetchTopPlayers();
  }, [torneios]);

  return (
    <>
      <SEO
        title="Campeonato Free Fire Duo Diário | DIARIO DUO TRZ"
        description="Participe do Campeonato Free Fire Duo Diário do DIARIO DUO TRZ. Veja horários, regras, premiação por kill e garanta sua inscrição no Linktree oficial."
        keywords="campeonato free fire, free fire duo, diario duo trz, campeonato diário, inscrição free fire, premiação por kill"
        canonicalPath="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SportsEvent",
          "name": "Campeonato Free Fire Duo Diário TRZ",
          "description": "Campeonato diário de Free Fire no modo Duo com R$1,00 por kill e premiação por colocação.",
          "url": "https://diarioduo-trz.com",
          "organizer": {
            "@type": "Organization",
            "name": "DIARIO DUO TRZ",
            "url": "https://diarioduo-trz.com"
          },
          "sport": "Free Fire",
          "location": {
            "@type": "VirtualLocation",
            "url": "https://diarioduo-trz.com"
          }
        }}
      />

      <div className="pb-16 sm:pb-20">
        <section className="relative overflow-hidden border-b border-white/8">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/banner.jpg')" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,16,24,0.96)_0%,rgba(16,16,24,0.88)_32%,rgba(16,16,24,0.58)_58%,rgba(16,16,24,0.42)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,16,24,0.22)_0%,rgba(16,16,24,0.64)_100%)]" />

          <div className="container relative flex min-h-[calc(100svh-5rem)] items-center py-10 sm:py-12 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-14">
            <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
              <div className="inline-flex rounded-full border border-primary/30 bg-primary/12 px-4 py-2 text-sm font-semibold text-primary">
                Campeonato Diário Duo TRZ
              </div>

              <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                Campeonato Free Fire Duo. <span className="text-primary">R$1,00 POR KILL.</span>
              </h1>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <a
                  href={linktreeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <WhatsAppIcon size={18} />
                  Participar
                </a>

                <Link
                  to="/horarios"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/8"
                >
                  <Clock3 size={18} />
                  Ver horários
                </Link>

                <Link
                  to="/premiacoes"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/8"
                >
                  <Trophy size={18} />
                  Premiações
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex lg:items-center lg:justify-end">
              <div className="w-full max-w-xl rounded-[1.8rem] border border-white/10 bg-[rgba(20,20,30,0.72)] p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/45">Destaque do campeonato</div>
                    <div className="mt-2 font-display text-4xl font-semibold text-primary">R$ 5,00</div>
                  </div>
                  <div className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                    Inscrição
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {championshipHighlights.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center gap-3 rounded-[1.25rem] border border-white/8 bg-white/[0.04] p-4"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <item.icon size={24} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-base font-semibold leading-tight text-white">
                          {item.title}
                        </div>
                        <div className="text-sm text-white/58">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mt-14 lg:hidden sm:mt-20">
          <div className="mx-auto w-full max-w-xl rounded-[1.8rem] border border-white/10 bg-[rgba(20,20,30,0.72)] p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-white/45">Destaque do campeonato</div>
                <div className="mt-2 font-display text-4xl font-semibold text-primary">R$ 5,00</div>
              </div>
              <div className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                Inscrição
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {championshipHighlights.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-3 rounded-[1.25rem] border border-white/8 bg-white/[0.04] p-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <item.icon size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-semibold leading-tight text-white">{item.title}</div>
                    <div className="text-sm text-white/58">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {topPlayers.length > 0 && (
          <section className="container mt-14 sm:mt-20">
            <div className="rounded-[1.9rem] border border-white/8 bg-card p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex gap-4">
                  <Trophy size={28} className="mt-1 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-white/45">Destaques recentes</div>
                    <h2 className="mt-2 font-display text-[1.75rem] font-semibold leading-tight text-white sm:text-3xl">
                      TOP 3 Melhores Jogadores
                    </h2>
                  </div>
                </div>
                <div className="rounded-full border border-white/8 bg-white/5 px-4 py-2 text-sm font-semibold text-white/50">
                  Data: <span className="text-white">{topPlayersDate}</span>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {topPlayers.map((player, index) => (
                  <div 
                    key={player.name}
                    className="group relative flex items-center gap-4 overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5 transition-colors hover:border-primary/40"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]">
                      <Trophy size={80} />
                    </div>
                    
                    <div className={`shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl border-2 font-display text-2xl font-black shadow-lg ${
                      index === 0 ? "border-[#FFD700]/30 bg-[#FFD700]/10 text-[#FFD700]" : 
                      index === 1 ? "border-[#C0C0C0]/30 bg-[#C0C0C0]/10 text-[#C0C0C0]" : 
                      "border-[#CD7F32]/30 bg-[#CD7F32]/10 text-[#CD7F32]"
                    }`}>
                      {index + 1}º
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-lg font-bold text-white mb-0.5">{player.name}</div>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                        <Medal size={14} className="opacity-70" />
                        {player.kills} Abates
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="container mt-14 sm:mt-20">
          <div className="rounded-[1.9rem] border border-white/8 bg-card p-6 sm:p-8">
            <div className="flex gap-4">
              <Clock3 size={28} className="mt-1 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <div className="text-sm text-white/45">Próximas salas</div>
                <h2 className="mt-2 font-display text-[1.75rem] font-semibold leading-tight text-white sm:text-3xl">
                  Horários disponíveis
                </h2>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {horariosLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-primary" size={28} />
                </div>
              ) : horarios.length === 0 ? (
                <div className="py-8 text-center text-white/40 italic">
                  Nenhum horário configurado no momento.
                </div>
              ) : (
                horarios.map((time) => (
                  <div
                    key={time}
                    className="flex items-center justify-between rounded-[1.4rem] border border-white/6 bg-white/[0.03] px-4 py-4"
                  >
                    <div className="font-display text-2xl font-semibold text-white">{time}</div>
                    <div className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                      Disponível
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="container mt-14 sm:mt-20">
          <div className="flex gap-4">
            <ShieldCheck size={28} className="mt-1 shrink-0 text-primary" />
            <div>
              <div className="text-sm text-white/45">Informações principais</div>
              <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Resumo rápido das regras
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              "Level mínimo 40 para participar do campeonato.",
              "Modo Duo com mapa Bermuda e apenas uma queda por partida.",
              "Reviver liberado, mantendo a dinâmica oficial informada pela organização.",
              "Todas as regras completas ficam detalhadas na página de regras.",
            ].map((text) => (
              <div
                key={text}
                className="rounded-[1.75rem] border border-white/8 bg-card p-6 text-sm leading-7 text-white/62"
              >
                {text}
              </div>
            ))}
          </div>
        </section>

        <section className="container mt-14 sm:mt-20">
          <div className="rounded-[1.9rem] border border-white/8 bg-card p-6 sm:p-8">
            <div className="flex gap-4">
              <Trophy size={28} className="mt-1 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <div className="text-sm text-white/45">Ranking por data</div>
                <h2 className="mt-2 font-display text-[1.75rem] font-semibold leading-tight text-white sm:text-3xl">
                  Últimos campeonatos
                </h2>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {recentTorneios.map((t) => {
                const dateKey = format(new Date(t.data_torneio), "yyyy-MM-dd");
                const displayDate = format(new Date(t.data_torneio), "dd/MM/yyyy");
                
                return (
                  <Link
                    key={t.id}
                    to={`/ranking/${dateKey}`}
                    className="flex items-center justify-between rounded-[1.3rem] border border-white/6 bg-white/[0.03] px-4 py-4 text-white/68 transition-colors hover:border-primary/40 hover:text-white"
                  >
                    <span>{displayDate} - {t.nome}</span>
                    <ArrowRight size={16} className="text-primary" />
                  </Link>
                );
              })}
              
              {recentTorneios.length === 0 && (
                <div className="py-8 text-center text-white/40 italic">
                  Carregando campeonatos recentes...
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
