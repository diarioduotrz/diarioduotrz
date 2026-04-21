import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import PublicLayout from "./components/layout/PublicLayout";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/admin/Login";

import Index from "./pages/Index";
import PublicPremiacoes from "./pages/Premiacoes";
import Regras from "./pages/Regras";
import Ranking from "./pages/Ranking";
import Horarios from "./pages/Horarios";
import PublicGrupos from "./pages/Grupos";
import Contato from "./pages/Contato";
import NotFound from "./pages/NotFound";

import Dashboard from "./pages/admin/Dashboard";
import Torneios from "./pages/admin/Torneios";
import Grupos from "./pages/admin/Grupos";
import Resultados from "./pages/admin/Resultados";
import Assistente from "./pages/admin/Assistente";
import AdminConfig from "./pages/admin/Config";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/premiacoes" element={<PublicPremiacoes />} />
            <Route path="/regras" element={<Regras />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/ranking/:data" element={<Ranking />} />
            <Route path="/ranking/id/:torneioId" element={<Ranking />} />
            <Route path="/horarios" element={<Horarios />} />
            <Route path="/grupos" element={<PublicGrupos />} />
            <Route path="/contato" element={<Contato />} />
          </Route>

          <Route path="*" element={<NotFound />} />
          
          {/* Admin */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="torneios" element={<Torneios />} />
              <Route path="grupos" element={<Grupos />} />
              <Route path="upload" element={<Resultados />} />
              <Route path="assistente" element={<Assistente />} />
              <Route path="config" element={<AdminConfig />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
