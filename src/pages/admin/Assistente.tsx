import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const AdminAssistente = () => (
  <div>
    <div className="flex flex-col gap-4 border-b border-border/50 pb-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Bot size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Assistente ia</h1>
          <p className="text-sm text-muted-foreground font-medium">Configure a personalidade e o conhecimento da ia</p>
        </div>
      </div>
      <Button className="h-10 px-4 font-bold">Salvar configurações</Button>
    </div>

    <div className="space-y-6">
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <h2 className="mb-3 text-xl font-bold tracking-tight text-foreground">System prompt</h2>
        <Textarea
          placeholder="Digite o prompt do sistema para o assistente IA..."
          className="min-h-[150px]"
          defaultValue="Você é o assistente virtual do Diário Duo TRZ, uma plataforma de campeonatos de Free Fire. Responda de forma curta, direta e amigável."
        />
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-6">
        <h2 className="mb-3 text-xl font-bold tracking-tight text-foreground">Base de conhecimento</h2>
        <Textarea
          placeholder="Adicione informações que o assistente deve saber..."
          className="min-h-[150px]"
          defaultValue="O campeonato é no modo Duo. Inscrição custa R$ 5 por dupla via PIX. Premiação: 1º R$50, 2º R$30, 3º R$15."
        />
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-6">
        <h2 className="mb-3 font-bebas text-xl tracking-wider text-foreground">FAQ</h2>
        <p className="text-sm text-muted-foreground">Cadastro de perguntas frequentes será conectado ao banco de dados.</p>
      </div>
    </div>
  </div>
);

export default AdminAssistente;
