import { Coins, Flame, Trophy, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";
import ExpandableDescription from "@/components/ExpandableDescription";
import { useConfig } from "@/hooks/useAdmin";

const medalColor = (pos: number) => {
  if (pos === 1) return "text-[#FFD700]";
  if (pos === 2) return "text-[#C0C0C0]";
  if (pos === 3) return "text-[#CD7F32]";
  return "text-primary";
};

const Premiacoes = () => {
  const { data: dbPremios, isLoading } = useConfig("premios_padrao");

  const config = dbPremios as any;
  const valorInscricao: number = Number(config?.valorInscricao || 5);
  const valorPorKill: number = Number(config?.valorPorKill || 1);
  const vagas: number = Number(config?.vagas || 24);
  const premios: { posicao: number; valor: string }[] = config?.premios
    ? [...config.premios].sort((a: any, b: any) => a.posicao - b.posicao)
    : [
        { posicao: 1, valor: "20.00" },
        { posicao: 2, valor: "5.00" },
      ];

  const killExamples = [1, 5, 10].map((k) => ({
    label: `${k} kill${k > 1 ? "s" : ""}`,
    value: `R$ ${(k * valorPorKill).toFixed(2).replace(".", ",")}`,
  }));

  return (
    <>
      <SEO
        title="Premiação Campeonato Free Fire | Ganhe por Kill"
        description="Entenda como funciona a premiação do Campeonato Free Fire Diario Duo TRZ. Cada kill vale R$ 1,00 e o valor cresce conforme o desempenho."
        keywords="premiação free fire, ganhar por kill, campeonato free fire prêmio, diario duo trz premiação"
        canonicalPath="/premiacoes"
      />

      <div className="container py-10 sm:py-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <Coins size={18} />
            Sistema de premiação
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold text-white sm:text-5xl">
            <span className="text-primary">Premiação por kill</span> no Campeonato Free Fire Diario Duo TRZ
          </h1>
          <ExpandableDescription text="Veja primeiro a premiação por colocação e, em seguida, como funciona o valor adicional por kill dentro da partida." />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <>
            <section className="mt-10">
              <div className="flex items-center gap-3">
                <Trophy size={28} className="shrink-0 text-primary" />
                <h2 className="font-display text-xl font-semibold leading-tight text-white sm:text-2xl">
                  Premiação por colocação
                </h2>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {premios.map((item) => (
                  <div key={item.posicao} className="rounded-[1.7rem] border border-white/8 bg-card p-6">
                    <div className={`text-sm font-bold ${medalColor(item.posicao)}`}>
                      TOP {item.posicao}
                    </div>
                    <div className="mt-2 font-display text-4xl font-semibold text-primary">
                      R$ {Number(item.valor).toFixed(2).replace(".", ",")}
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/58">
                      {item.posicao === 1 && "Maior destaque da sala e prêmio principal."}
                      {item.posicao === 2 && "Boa colocação com recompensa adicional."}
                      {item.posicao === 3 && "Fecha o pódio com prêmio garantido."}
                      {item.posicao > 3 && `Prêmio para o ${item.posicao}º lugar.`}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[1.8rem] border border-white/8 bg-[hsl(240_14%_17%)] p-6 sm:p-8">
                <div className="text-sm text-white/45">Regra principal</div>
                <div className="mt-2 font-display text-5xl font-semibold text-primary">
                  R$ {valorPorKill.toFixed(2).replace(".", ",")}
                </div>
                <p className="mt-3 text-lg text-white">para cada kill feita pela dupla.</p>

                <div className="mt-8 space-y-3">
                  {killExamples.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-[1.25rem] border border-white/6 bg-white/[0.03] px-4 py-4"
                    >
                      <span className="text-white/72">{item.label}</span>
                      <span className="font-semibold text-primary">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-white/8 bg-card p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <Flame size={28} className="shrink-0 text-primary" />
                  <h2 className="font-display text-xl font-semibold leading-tight text-white sm:text-2xl">
                    Como funciona na prática
                  </h2>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-7 text-white/62">
                  <p>
                    Além da premiação por colocação, cada abate soma valor direto para a dupla. Isso
                    deixa a partida mais agressiva e recompensa quem busca confronto com eficiência.
                  </p>
                  <p>
                    Inscrição por dupla: <span className="text-primary font-semibold">R$ {valorInscricao.toFixed(2).replace(".", ",")}</span>.
                    Total de vagas: <span className="text-primary font-semibold">{vagas} duplas</span>.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-3">
                <Coins size={28} className="shrink-0 text-primary" />
                <h2 className="font-display text-xl font-semibold leading-tight text-white sm:text-2xl">
                  Resumo rápido
                </h2>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-3">
                {[
                  `Top 1${premios.length > 1 ? ` ao Top ${premios.length}` : ""} recebem prêmios por colocação.`,
                  `Cada kill adiciona R$ ${valorPorKill.toFixed(2).replace(".", ",")} ao desempenho da dupla.`,
                  "A premiação mistura resultado final e agressividade na partida.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.7rem] border border-white/8 bg-card p-6 text-sm leading-7 text-white/60"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
};

export default Premiacoes;
