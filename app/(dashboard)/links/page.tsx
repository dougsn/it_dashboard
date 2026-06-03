"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Plus,
  Network,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Wifi,
  WifiOff,
  Activity,
} from "lucide-react";
import { Topbar } from "@/components/topbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

function CopyIconButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  function copy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      title={`Copiar URL ${label}`}
      className="inline-flex items-center gap-1 px-2 h-6 rounded border border-border text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      {copied ? (
        <Check className="h-3 w-3 text-success" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {label}
    </button>
  );
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: "default" | "success" | "destructive";
}

function FilterChip({ active, onClick, children, color = "default" }: FilterChipProps) {
  const activeClass =
    color === "success"
      ? "bg-success text-white border-success"
      : color === "destructive"
      ? "bg-destructive text-white border-destructive"
      : "bg-primary text-primary-foreground border-primary";

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 h-7 rounded-full text-xs font-medium border transition-all select-none whitespace-nowrap ${
        active
          ? activeClass
          : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export default function LinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ONLINE" | "OFFLINE">("ALL");
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

  useEffect(() => {
    fetchLinks();
    const interval = setInterval(fetchLinks, 30_000);
    return () => clearInterval(interval);
  }, [fetchLinks]);

  function openCreate() {
    setEditing(null);
    form.reset({ name: "", description: "" });
    setDialogOpen(true);
  }

  function openEdit(e: React.MouseEvent, link: LinkItem) {
    e.stopPropagation();
    setEditing(link);
    form.reset({ name: link.name, description: link.description ?? "" });
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      const url = editing ? `/api/links/${editing.id}` : "/api/links";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
      toast.success(editing ? "Link atualizado" : "Link criado");
      setDialogOpen(false);
      fetchLinks();
    } catch {
      toast.error("Erro ao salvar link");
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("Excluir este link?")) return;
    try {
      await fetch(`/api/links/${id}`, { method: "DELETE" });
      toast.success("Link excluído");
      fetchLinks();
    } catch {
      toast.error("Erro ao excluir");
    }
  }

  const filtered = links.filter((l) => {
    if (statusFilter === "ONLINE") return l.isOnline;
    if (statusFilter === "OFFLINE") return !l.isOnline;
    return true;
  });

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

      <div className="p-7 space-y-4">
        {/* Filter chips + summary */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={statusFilter === "ALL"}
              onClick={() => setStatusFilter("ALL")}
            >
              Todos ({links.length})
            </FilterChip>
            <FilterChip
              active={statusFilter === "ONLINE"}
              onClick={() => setStatusFilter("ONLINE")}
              color="success"
            >
              <Wifi className="h-3 w-3" />
              Online ({online})
            </FilterChip>
            <FilterChip
              active={statusFilter === "OFFLINE"}
              onClick={() => setStatusFilter("OFFLINE")}
              color="destructive"
            >
              <WifiOff className="h-3 w-3" />
              Offline ({links.length - online})
            </FilterChip>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            {links.length === 0 ? (
              <>
                <Network className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Nenhum link cadastrado.</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}>
                  Cadastrar primeiro link
                </Button>
              </>
            ) : (
              <p>Nenhum link encontrado para o filtro selecionado.</p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Link
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                  <th className="hidden sm:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Eventos
                  </th>
                  <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Último evento
                  </th>
                  <th className="hidden lg:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Webhooks
                  </th>
                  <th className="text-right px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((link) => (
                  <tr
                    key={link.id}
                    onClick={() => router.push(`/links/${link.id}`)}
                    className="hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    {/* Link */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-primary shrink-0">
                          <Activity className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate group-hover:text-primary transition-colors">
                            {link.name}
                          </p>
                          {link.description && (
                            <p className="text-[10px] text-muted-foreground truncate">
                              {link.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge isOnline={link.isOnline} />
                    </td>

                    {/* Eventos */}
                    <td className="hidden sm:table-cell px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-mono">
                        {link._count.events}
                        <span className="text-muted-foreground/50">ev.</span>
                      </span>
                    </td>

                    {/* Último evento */}
                    <td className="hidden md:table-cell px-4 py-3 text-xs text-muted-foreground font-mono">
                      {link.lastEventAt ? (
                        new Date(link.lastEventAt).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>

                    {/* Webhooks */}
                    <td
                      className="hidden lg:table-cell px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1">
                        <CopyIconButton
                          text={`${origin}/api/links/${link.id}/down`}
                          label="DOWN"
                        />
                        <CopyIconButton
                          text={`${origin}/api/links/${link.id}/up`}
                          label="UP"
                        />
                      </div>
                    </td>

                    {/* Ações */}
                    <td
                      className="px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-0.5">
                        <Link
                          href={`/links/${link.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={(e) => openEdit(e, link)}
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, link.id)}
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar link" : "Novo link de internet"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Link principal, Fibra VIVO..."
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                rows={2}
                placeholder="Provedor, contrato, observações..."
              />
            </div>
            <DialogFooter showCloseButton>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Salvando..."
                  : editing
                  ? "Salvar"
                  : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
