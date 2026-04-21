import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Bot,
  LayoutDashboard,
  Settings,
  LogOut,
  Users,
  Menu,
} from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/torneios", label: "Torneios", icon: Settings },
  { to: "/admin/grupos", label: "Grupos", icon: Users },
  { to: "/admin/upload", label: "Upload & Ranking", icon: BarChart3 },
  { to: "/admin/config", label: "Assistente IA", icon: Bot },
];

const SidebarContent = () => {
  const location = useLocation();
  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-border/50 px-4">
        <BrandMark className="h-10 w-10 rounded-xl" iconClassName="h-5 w-5" />
        <span className="text-lg font-bold tracking-tight text-primary">Admin TRZ</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {adminLinks.map((linkItem) => {
          const Icon = linkItem.icon;
          const active = location.pathname === linkItem.to;

          return (
            <Link
              key={linkItem.to}
              to={linkItem.to}
              className={`mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-sidebar-accent text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary"
              }`}
            >
              <Icon size={18} />
              {linkItem.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/50 p-3">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft size={16} />
          Voltar ao site
        </Link>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentLink = adminLinks.find(l => l.to === location.pathname);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar para telas grandes (Desktop) */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-border/50 lg:flex">
        <SidebarContent />
      </aside>

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-md lg:px-6">
          <div className="flex items-center gap-4">
            {/* Menu Mobile */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-primary">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-r-primary/20">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {currentLink?.label || "Painel Administrativo"}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 md:flex">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">Ambiente Seguro</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-red-400">
              <LogOut size={16} />
              <span className="hidden md:inline">Sair</span>
            </Button>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
