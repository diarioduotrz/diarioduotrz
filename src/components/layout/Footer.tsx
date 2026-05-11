import { Link } from "react-router-dom";
import { House, Instagram, Link as LinkIcon, Medal, Music4, ScrollText, Trophy } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { instagramUrl, linktreeUrl, tiktokUrl } from "@/data/championship";

const footerLinks = [
  { to: "/", label: "Home", icon: House },
  { to: "/premiacoes", label: "Premiações", icon: Medal },
  { to: "/regras", label: "Regras", icon: ScrollText },
  { to: "/ranking", label: "Ranking", icon: Trophy },
];

const Footer = () => (
  <footer className="border-t border-white/8 bg-[hsl(240_18%_12%)] py-14">
    <div className="container grid gap-10 md:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
      <div className="max-w-sm">
        <div className="flex items-center gap-3">
          <BrandMark />
          <div>
            <div className="font-display text-lg font-semibold text-white">DIARIO DUO TRZ</div>
            <div className="text-xs uppercase tracking-[0.24em] text-white/40">
              Duo diário no Bermuda
            </div>
          </div>
        </div>

        <p className="mt-5 text-sm leading-7 text-white/58">
          Campeonato Free Fire Duo com inscrição diária, ranking por data e premiação de R$0,50 por kill.
        </p>
      </div>

      <div>
        <h4 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-white">
          Páginas
        </h4>
        <div className="mt-4 flex flex-col gap-3">
          {footerLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="inline-flex items-center gap-2 text-sm text-white/62 transition-colors hover:text-primary"
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-white">
          Campeonato
        </h4>
        <div className="mt-4 space-y-3 text-sm text-white/62">
          <div>Modo Duo</div>
          <div>Mapa Bermuda</div>
          <div>Level mínimo 40</div>
          <div>R$0,50 por kill</div>
        </div>
      </div>

      <div>
        <h4 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-white">
          Contato
        </h4>
        <div className="mt-4 flex flex-col items-start gap-3 text-sm text-white/62">
          <a
            href={linktreeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-primary"
          >
            <LinkIcon size={18} />
            Grupo Diário Duo TRZ
          </a>
          <a
            href={tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-primary"
          >
            <Music4 size={18} />
            TikTok @diarioduotrz
          </a>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-primary"
          >
            <Instagram size={18} />
            Instagram @diarioduotrz
          </a>
        </div>
      </div>
    </div>

    <div className="container mt-10 border-t border-white/8 pt-6 text-sm text-white/35">
      © {new Date().getFullYear()} Diario Duo TRZ. Todos os direitos reservados.
    </div>
  </footer>
);

export default Footer;
