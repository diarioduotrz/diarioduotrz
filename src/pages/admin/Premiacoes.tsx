import { Trophy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminPremiacoes = () => (
  <div>
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        <Trophy className="mr-2 inline-block text-primary" size={28} />
        Premiações
      </h1>
      <Button className="gap-2"><Plus size={16} /> Nova Premiação</Button>
    </div>
    <div className="rounded-xl border border-border/50 bg-card p-6">
      <p className="text-sm text-muted-foreground">Configure os prêmios por colocação e por kills. Será conectado ao banco de dados.</p>
    </div>
  </div>
);

export default AdminPremiacoes;
