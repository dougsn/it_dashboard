"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Network, Pencil, Trash2, ExternalLink, Copy, Check } from "lucide-react";
import { Topbar } from "@/components/topbar";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/status-badge";

interface LinkItem {
  id: string;
  name: string;
  description: string | null;
  isOnline: boolean;
  lastEventAt: string | null;
  createdAt: string;
  _count: { events: number };
}

const formSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(100),
  description: z.string().max(500).optional().nullable(),
});
type FormValues = z.infer<typeof formSchema>;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <Button variant="ghost" size="icon" onClick={copy} className="h-6 w-6 shrink-0">
      {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

export default function LinksPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LinkItem | null>(null);
  const [origin, setOrigin] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const fetchLinks = useCallback(async () => {
    const res = await fetch("/api/links");
    if (res.ok) setLinks(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  function openCreate() {
    setEditing(null);
    form.reset({ name: "", description: "" });
    setDialogOpen(true);
  }

  function openEdit(link: LinkItem) {
    setEditing(link);
    form.reset({ name: link.name, description: link.description ?? "" });
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      const url = editing ? `/api/links/${editing.id}` : "/api/links";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      if (!res.ok) throw new Error();
      toast.success(editing ? "Link atualizado" : "Link criado");
      setDialogOpen(false);
      fetchLinks();
    } catch {
      toast.error("Erro ao salvar link");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este link?")) return;
    try {
      await fetch(`/api/links/${id}`, { method: "DELETE" });
      toast.success("Link excluído");
      fetchLinks();
    } catch {
      toast.error("Erro ao excluir");
    }
  }

  const online = links.filter((l) => l.isOnline).length;

  return (
    <>
      <Topbar
        title="Links de Internet"
        icon={Network}
        subtitle="Monitoramento via webhooks do Mikrotik"
        live={!loading}
      >
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Novo Link
        </Button>
      </Topbar>

    <div className="p-7 space-y-6">
      {/* Stats */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-success/10 border border-success/20">
          <Network className="h-4 w-4 text-success" />
          <span className="text-sm font-medium text-success">{online} online</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive/10 border border-destructive/20">
          <Network className="h-4 w-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">{links.length - online} offline</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Network className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Nenhum link cadastrado.</p>
          <Button variant="outline" className="mt-4" onClick={openCreate}>
            Cadastrar primeiro link
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <Card key={link.id} className={`border-l-4 ${link.isOnline ? "border-l-success" : "border-l-destructive"}`}>
              <CardContent className="py-4 px-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/links/${link.id}`} className="font-semibold hover:underline">
                        {link.name}
                      </Link>
                      <StatusBadge isOnline={link.isOnline} />
                      <Badge variant="secondary" className="text-xs">
                        {link._count.events} eventos
                      </Badge>
                    </div>

                    {link.description && (
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    )}

                    <div className="flex items-center gap-1 mt-2">
                      <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded truncate max-w-xs">
                        {origin}/api/links/{link.id}/down
                      </code>
                      <CopyButton text={`${origin}/api/links/${link.id}/down`} />
                      <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded truncate max-w-xs ml-1">
                        /up
                      </code>
                      <CopyButton text={`${origin}/api/links/${link.id}/up`} />
                    </div>

                    {link.lastEventAt && (
                      <p className="text-xs text-muted-foreground">
                        Último evento: {new Date(link.lastEventAt).toLocaleString("pt-BR")}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Link href={`/links/${link.id}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(link)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(link.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar link" : "Novo link de internet"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...form.register("name")} placeholder="Link principal, Fibra VIVO..." />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea id="description" {...form.register("description")} rows={2} placeholder="Provedor, contrato, observações..." />
            </div>
            <DialogFooter showCloseButton>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : editing ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
