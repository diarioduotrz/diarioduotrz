import { Clock3, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";
import ExpandableDescription from "@/components/ExpandableDescription";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { whatsappNumber } from "@/data/championship";
import { useConfig } from "@/hooks/useAdmin";

const Horarios = () => {
  const { data: dbHorarios, isLoading } = useConfig("horarios_disponiveis");

  const horarios: string[] = Array.isArray(dbHorarios) ? (dbHorarios as string[]).sort() : [];

  return (
    <>
      <SEO
        title="Horários Campeonato Free Fire | Inscreva-se"
        description="Veja os horários disponíveis do Campeonato Free Fire Diário Duo TRZ e inscreva-se pelo WhatsApp em sua sala preferida."
        keywords="horários free fire, inscreva-se campeonato free fire, horário duo free fire, diario duo trz horários"
        canonicalPath="/horarios"
      />

      <div className="container py-10 sm:py-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <Clock3 size={16} />
            Horários do campeonato
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold text-white sm:text-5xl">
            <span className="text-primary">Horários</span> do Campeonato Free Fire Diário Duo TRZ
          </h1>
          <ExpandableDescription text="Escolha um horário disponível e fale diretamente no WhatsApp para garantir sua vaga na próxima sala do dia." />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : horarios.length === 0 ? (
          <div className="mt-10 rounded-[1.8rem] border border-white/8 bg-card p-12 text-center text-white/40 italic">
            Nenhum horário configurado no momento. Consulte o WhatsApp para disponibilidade.
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {horarios.map((time) => (
              <div key={time} className="rounded-[1.8rem] border border-white/8 bg-card p-6">
                <div className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Disponível
                </div>
                <div className="mt-4 font-display text-4xl font-semibold text-white">{time}</div>
                <p className="mt-3 text-sm text-white/52">
                  Fale no WhatsApp para garantir sua vaga
                </p>
                <a
                  href="https://linktr.ee/trz.diario"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <WhatsAppIcon size={18} className="mr-2" />
                  Inscrever via WhatsApp
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Horarios;
