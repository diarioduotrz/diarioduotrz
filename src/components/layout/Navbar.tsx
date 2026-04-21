import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CircleDollarSign, DoorClosed, ExternalLink, Menu, NotepadText, Trophy, Users, X } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { linktreeUrl } from "@/data/championship";

const navLinks = [
  { to: "/", label: "Home", icon: DoorClosed },
  { to: "/premiacoes", label: "Premiacoes", icon: CircleDollarSign },
  { to: "/grupos", label: "Grupos Diário Duo FF", icon: Users },
  { to: "/regras", label: "Regras", icon: NotepadText },
  { to: "/ranking", label: "Ranking", icon: Trophy },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/8 bg-[rgba(26,26,38,0.96)]">
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <BrandMark />
          <div>
            <div className="font-display text-lg font-semibold text-white">DIARIO DUO TRZ</div>
            <div className="text-xs uppercase tracking-[0.24em] text-white/40">
              Campeonato Free Fire
            </div>
          </div>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <nav className="flex items-center gap-2">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  location.pathname === item.to
                    ? "bg-primary text-primary-foreground"
                    : "text-white/68 hover:bg-white/6 hover:text-white"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </nav>

          <a
            href={linktreeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Participar
            <WhatsAppIcon size={16} />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-2xl border border-white/8 bg-white/5 p-3 text-white md:hidden"
          aria-label="Abrir menu"
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/8 bg-[rgba(26,26,38,0.98)] px-4 pb-4 pt-3 md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${
                  location.pathname === item.to
                    ? "bg-primary text-primary-foreground"
                    : "text-white/68 hover:bg-white/6 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
            <a
              href={linktreeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-3 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              Participar
              <WhatsAppIcon size={18} />
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
