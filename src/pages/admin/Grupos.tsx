import { Users, Plus, Save, Trash2, Loader2, MessageCircle, Send, Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useGrupos, useUpsertGrupo, useDeleteGrupo } from "@/hooks/useAdmin";

const AdminGrupos = () => {
  const { data: grupos, isLoading } = useGrupos();
  const upsertGrupo = useUpsertGrupo();
  const deleteGrupo = useDeleteGrupo();

  const [editando, setEditando] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({ nome: "", link: "", tipo: "whatsapp", ativo: true, imagem_url: "" });

  const handleSave = async () => {
    if (!formData.nome || !formData.link) return;
    await upsertGrupo.mutateAsync(formData);
    setEditando(null);
    setFormData({ nome: "", link: "", tipo: "whatsapp", ativo: true, imagem_url: "" });
  };

  const iniciarEdicao = (grupo: any) => {
    setEditando(grupo.id);
    setFormData({ ...grupo });
  };

  const handleToggleAtivo = async (grupo: any, ativo: boolean) => {
    await upsertGrupo.mutateAsync({ ...grupo, ativo });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Grupos</h1>
            <p className="text-sm text-muted-foreground font-medium">Gerencie links e acessos aos grupos oficiais</p>
          </div>
        </div>
        <Button 
          onClick={() => {
            setEditando("novo");
            setFormData({ nome: "", link: "", tipo: "whatsapp", ativo: true, imagem_url: "" });
          }} 
          className="gap-2 h-10 px-4"
        >
          <Plus size={16} /> Novo grupo
        </Button>
      </div>

      {editando && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">
            {editando === "novo" ? "Cadastrar Novo Grupo" : "Editar Grupo"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
            <div className="space-y-2">
              <Label>Nome do Grupo</Label>
              <Input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="bg-white/[0.02]" />
            </div>
            <div className="space-y-2">
              <Label>Link do Convite</Label>
              <Input value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="bg-white/[0.02]" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>URL da Imagem</Label>
              <Input value={formData.imagem_url || ""} onChange={e => setFormData({...formData, imagem_url: e.target.value})} className="bg-white/[0.02]" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Plataforma</Label>
              <select
                value={formData.tipo}
                onChange={e => setFormData({...formData, tipo: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-white/[0.02] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="whatsapp" className="bg-black text-white">WhatsApp</option>
                <option value="telegram" className="bg-black text-white">Telegram</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex items-center gap-2 h-10">
              <Switch checked={formData.ativo} onCheckedChange={(v) => setFormData({...formData, ativo: v})} />
              <Label>Grupo Ativo</Label>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={upsertGrupo.isPending} className="gap-2">
              {upsertGrupo.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
              Salvar Grupo
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-3 flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : grupos?.length === 0 ? (
          <div className="col-span-3 rounded-xl border border-border/50 bg-card p-10 text-center text-muted-foreground italic font-medium">
            Nenhum grupo cadastrado.
          </div>
        ) : (
          grupos?.map((grupo) => (
            <div key={grupo.id} className="rounded-xl border border-border/50 bg-card p-5 group flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-white/8 overflow-hidden p-1.5">
                    <img src={grupo.imagem_url || "/logo.png"} alt={grupo.nome} className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{grupo.nome}</h3>
                    <p className="text-xs text-muted-foreground uppercase">{grupo.tipo}</p>
                  </div>
                </div>
                <Switch 
                  checked={grupo.ativo || false} 
                  onCheckedChange={(v) => handleToggleAtivo(grupo, v)} 
                  disabled={upsertGrupo.isPending}
                />
              </div>
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                <div className="text-xs text-muted-foreground truncate mr-4 max-w-[200px]">
                  {grupo.link}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => iniciarEdicao(grupo)} className="h-8 w-8 hover:text-white">
                    <Pencil size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteGrupo.mutate(grupo.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminGrupos;
