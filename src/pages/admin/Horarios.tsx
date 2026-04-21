import { Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminHorarios = () => (
  <div>
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        <Clock className="mr-2 inline-block text-primary" size={28} />
        Horários
      </h1>
      <Button className="gap-2"><Plus size={16} /> Novo Horário</Button>
    </div>
    <div className="rounded-xl border border-border/50 bg-card p-6">
      <p className="text-sm text-muted-foreground">Gerencie os horários dos campeonatos aqui. CRUD completo será conectado ao banco de dados.</p>
    </div>
  </div>
);

export default AdminHorarios;
