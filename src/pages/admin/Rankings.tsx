import { BarChart3 } from "lucide-react";

const AdminRankings = () => (
  <div>
    <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground">
      <BarChart3 className="mr-2 inline-block text-primary" size={28} />
      Rankings
    </h1>
    <div className="rounded-xl border border-border/50 bg-card p-6">
      <p className="text-sm text-muted-foreground">Visualize e gerencie os rankings gerados automaticamente a partir dos resultados.</p>
    </div>
  </div>
);

export default AdminRankings;
