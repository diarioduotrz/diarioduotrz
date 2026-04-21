import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminRegras = () => (
  <div>
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        <Shield className="mr-2 inline-block text-primary" size={28} />
        Regras
      </h1>
      <Button>Salvar Alterações</Button>
    </div>
    <div className="rounded-xl border border-border/50 bg-card p-6">
      <p className="text-sm text-muted-foreground">Editor de regras do campeonato. Será conectado ao banco de dados.</p>
    </div>
  </div>
);

export default AdminRegras;
