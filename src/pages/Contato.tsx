import { Instagram, MessageCircle } from "lucide-react";
import SEO from "@/components/SEO";
import ExpandableDescription from "@/components/ExpandableDescription";
import { instagramUrl, whatsappNumber } from "@/data/championship";

const Contato = () => (
  <>
    <SEO
      title="Contato Diário TRZ | Campeonato Free Fire"
      description="Entre em contato com o Diário Duo TRZ pelo WhatsApp e Instagram para inscrição, suporte e novidades do campeonato Free Fire."
      keywords="contato diario trz, whatsapp campeonato free fire, instagram free fire duo"
      canonicalPath="/contato"
    />

    <div className="container py-10 sm:py-14">
      <div className="max-w-3xl">
        <div className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
          Contato oficial
        </div>
        <h1 className="mt-5 font-display text-4xl font-semibold text-white sm:text-5xl">
          <span className="text-primary">Contato</span> Diário TRZ
        </h1>
        <ExpandableDescription text="Se você quer fazer sua inscrição, acompanhar as novidades do campeonato ou tirar alguma dúvida, use um dos canais oficiais abaixo." />
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[1.8rem] border border-white/8 bg-card p-6 transition-colors hover:border-primary/40"
        >
          <MessageCircle size={20} className="text-primary" />
          <h2 className="mt-5 font-display text-2xl font-semibold text-white">WhatsApp</h2>
          <p className="mt-3 text-sm leading-7 text-white/58">
            Canal principal para inscrição no campeonato, confirmação de horário e atendimento.
          </p>
        </a>

        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[1.8rem] border border-white/8 bg-card p-6 transition-colors hover:border-primary/40"
        >
          <Instagram size={20} className="text-primary" />
          <h2 className="mt-5 font-display text-2xl font-semibold text-white">Instagram</h2>
          <p className="mt-3 text-sm leading-7 text-white/58">
            Perfil para acompanhar avisos, publicações do campeonato e movimento da comunidade.
          </p>
        </a>
      </div>
    </div>
  </>
);

export default Contato;
