import { ShieldCheck, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import SEO from "@/components/SEO";
import ExpandableDescription from "@/components/ExpandableDescription";
import { useConfig } from "@/hooks/useAdmin";

const Regras = () => {
  const { data: dbRegras, isLoading, isError } = useConfig("regras_campeonato");

  const markdown: string = (dbRegras as any)?.markdown || "";

  return (
    <>
      <SEO
        title="Regras Campeonato Free Fire Duo | Como Funciona"
        description="Leia as regras do Campeonato Free Fire Duo Diario Duo TRZ: level mínimo 40, modo duo, mapa Bermuda, uma queda, reviver liberado e restrições de itens divulgadas pela organização."
        keywords="regras campeonato free fire, free fire duo regras, bermuda duo, diario duo trz regras"
        canonicalPath="/regras"
      />

      <div className="container py-10 sm:py-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <ShieldCheck size={16} />
            Regras do campeonato
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold text-white sm:text-5xl">
            <span className="text-primary">Como funciona</span> o Campeonato Free Fire Duo do Diário TRZ
          </h1>
          <ExpandableDescription text="O Diário Duo TRZ foi montado para duplas que querem um formato simples de entender e competitivo de jogar." />
        </div>

        <div className="mt-10">
          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          )}

          {isError && (
            <div className="rounded-[1.8rem] border border-red-500/20 bg-red-500/5 p-8 text-center text-red-400">
              Erro ao carregar as regras. Tente novamente em instantes.
            </div>
          )}

          {!isLoading && !isError && !markdown && (
            <div className="rounded-[1.8rem] border border-white/8 bg-card p-8 text-center text-white/40 italic">
              As regras ainda não foram configuradas. Acesse o painel admin para adicionar.
            </div>
          )}

          {!isLoading && !isError && markdown && (
            <div className="prose prose-invert prose-sm sm:prose-base max-w-none
              prose-headings:font-display prose-headings:text-white
              prose-h1:text-3xl prose-h1:font-semibold prose-h1:mt-8 prose-h1:mb-4
              prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-3
              prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2
              prose-p:text-white/65 prose-p:leading-8
              prose-li:text-white/65 prose-li:leading-7
              prose-strong:text-white prose-strong:font-semibold
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-hr:border-white/10
              [&>*:first-child]:mt-0">
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Regras;
