"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, ShieldAlert, AlertTriangle, Info, AlertCircle, CheckCircle2, Clock, Pencil, Trash2, RotateCcw, StickyNote } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";

type NoteSeverity = "INFO" | "WARNING" | "HIGH" | "CRITICAL";
type NoteCategory = "SECURITY" | "OPERATIONAL" | "GENERAL";
type NoteStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

interface Note {
  id: string;
  title: string;
  content: string;
  severity: NoteSeverity;
  category: NoteCategory;
  status: NoteStatus;
  deviceId: string | null;
  device: { id: string; name: string; ip: string } | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

const noteFormSchema = z.object({
  title: z.string().min(1, "Título obrigatório").max(200),
  content: z.string().min(1, "Conteúdo obrigatório"),
  severity: z.enum(["INFO", "WARNING", "HIGH", "CRITICAL"]),
  category: z.enum(["SECURITY", "OPERATIONAL", "GENERAL"]),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]),
  deviceId: z.string().optional().nullable(),
});

type NoteFormValues = z.infer<typeof noteFormSchema>;

const SEVERITY_CONFIG: Record<NoteSeverity, { label: string; icon: React.ElementType; color: string; border: string }> = {
  CRITICAL: { label: "Crítico", icon: ShieldAlert, color: "bg-destructive/10 text-destructive",         border: "border-l-destructive" },
  HIGH:     { label: "Alto",    icon: AlertCircle,  color: "bg-warning/10 text-warning",                border: "border-l-warning" },
  WARNING:  { label: "Médio",   icon: AlertTriangle, color: "bg-muted text-muted-foreground",           border: "border-l-warning/50" },
  INFO:     { label: "Info",    icon: Info,          color: "bg-muted text-muted-foreground",           border: "border-l-border" },
};

const CATEGORY_LABELS: Record<NoteCategory, string> = {
  SECURITY: "Segurança",
  OPERATIONAL: "Operacional",
  GENERAL: "Geral",
};

const STATUS_CONFIG: Record<NoteStatus, { label: string; icon: React.ElementType; variant: string }> = {
  OPEN:        { label: "Aberto",      icon: AlertCircle,   variant: "destructive" },
  IN_PROGRESS: { label: "Em andamento", icon: Clock,         variant: "secondary" },
  RESOLVED:    { label: "Resolvido",   icon: CheckCircle2,  variant: "outline" },
};

const SEVERITY_ORDER: NoteSeverity[] = ["CRITICAL", "HIGH", "WARNING", "INFO"];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<NoteSeverity | "ALL">("ALL");
  const [filterCategory, setFilterCategory] = useState<NoteCategory | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<NoteStatus | "OPEN_ONLY" | "ALL">("OPEN_ONLY");

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: "",
      content: "",
      severity: "INFO",
      category: "GENERAL",
      status: "OPEN",
      deviceId: null,
    },
  });

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/notes");
      if (!res.ok) throw new Error("Failed to fetch");
      setNotes(await res.json());
    } catch {
      toast.error("Erro ao carregar notas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  function openCreate() {
    setEditing(null);
    form.reset({ title: "", content: "", severity: "INFO", category: "GENERAL", status: "OPEN", deviceId: null });
    setDialogOpen(true);
  }

  function openEdit(note: Note) {
    setEditing(note);
    form.reset({
      title: note.title,
      content: note.content,
      severity: note.severity,
      category: note.category,
      status: note.status,
      deviceId: note.deviceId,
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: NoteFormValues) {
    try {
      const url = editing ? `/api/notes/${editing.id}` : "/api/notes";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      if (!res.ok) throw new Error();
      toast.success(editing ? "Nota atualizada" : "Nota criada");
      setDialogOpen(false);
      fetchNotes();
    } catch {
      toast.error("Erro ao salvar nota");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta nota?")) return;
    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
      toast.success("Nota excluída");
      fetchNotes();
    } catch {
      toast.error("Erro ao excluir");
    }
  }

  async function handleResolve(note: Note) {
    const newStatus: NoteStatus = note.status === "RESOLVED" ? "OPEN" : "RESOLVED";
    try {
      await fetch(`/api/notes/${note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(newStatus === "RESOLVED" ? "Marcado como resolvido" : "Reaberto");
      fetchNotes();
    } catch {
      toast.error("Erro ao atualizar status");
    }
  }

  const filtered = notes.filter((n) => {
    if (filterSeverity !== "ALL" && n.severity !== filterSeverity) return false;
    if (filterCategory !== "ALL" && n.category !== filterCategory) return false;
    if (filterStatus === "OPEN_ONLY" && n.status === "RESOLVED") return false;
    if (filterStatus !== "ALL" && filterStatus !== "OPEN_ONLY" && n.status !== (filterStatus as NoteStatus)) return false;
    return true;
  });

  const stats = {
    total: notes.length,
    open: notes.filter((n) => n.status !== "RESOLVED").length,
    security: notes.filter((n) => n.category === "SECURITY" && n.status !== "RESOLVED").length,
    resolved: notes.filter((n) => n.status === "RESOLVED").length,
  };

  const grouped = SEVERITY_ORDER.reduce<Record<NoteSeverity, Note[]>>((acc, sev) => {
    acc[sev] = filtered.filter((n) => n.severity === sev);
    return acc;
  }, { CRITICAL: [], HIGH: [], WARNING: [], INFO: [] });

  return (
    <>
      <Topbar
        title="Notas & Segurança"
        icon={StickyNote}
        subtitle="Registre problemas de segurança e acompanhe as mitigações"
      >
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Nova Nota
        </Button>
      </Topbar>

    <div className="p-7 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Pendentes", value: stats.open, color: "text-warning" },
          { label: "Segurança Aberta", value: stats.security, color: "text-destructive" },
          { label: "Resolvidos", value: stats.resolved, color: "text-success" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted-foreground">Filtrar:</span>

        {(["ALL", "CRITICAL", "HIGH", "WARNING", "INFO"] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filterSeverity === s ? "default" : "outline"}
            onClick={() => setFilterSeverity(s)}
          >
            {s === "ALL" ? "Todos" : SEVERITY_CONFIG[s as NoteSeverity].label}
          </Button>
        ))}

        <div className="w-px h-5 bg-border mx-1" />

        {(["ALL", "SECURITY", "OPERATIONAL", "GENERAL"] as const).map((c) => (
          <Button
            key={c}
            size="sm"
            variant={filterCategory === c ? "default" : "outline"}
            onClick={() => setFilterCategory(c as NoteCategory | "ALL")}
          >
            {c === "ALL" ? "Todas categorias" : CATEGORY_LABELS[c as NoteCategory]}
          </Button>
        ))}

        <div className="w-px h-5 bg-border mx-1" />

        {([
          ["OPEN_ONLY", "Não resolvidas"],
          ["ALL", "Todas"],
          ["RESOLVED", "Resolvidas"],
        ] as const).map(([val, lbl]) => (
          <Button
            key={val}
            size="sm"
            variant={filterStatus === val ? "default" : "outline"}
            onClick={() => setFilterStatus(val)}
          >
            {lbl}
          </Button>
        ))}
      </div>

      {/* Notes grouped by severity */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ShieldAlert className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Nenhuma nota encontrada</p>
        </div>
      ) : (
        <div className="space-y-6">
          {SEVERITY_ORDER.map((sev) => {
            const group = grouped[sev];
            if (group.length === 0) return null;
            const cfg = SEVERITY_CONFIG[sev];
            const Icon = cfg.icon;
            return (
              <div key={sev}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4" />
                  <h2 className="font-semibold text-sm">{cfg.label}</h2>
                  <Badge variant="secondary" className="text-xs">{group.length}</Badge>
                </div>
                <div className="space-y-3">
                  {group.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={() => openEdit(note)}
                      onDelete={() => handleDelete(note.id)}
                      onResolve={() => handleResolve(note)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar nota" : "Nova nota"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Título</Label>
              <Input id="title" {...form.register("title")} placeholder="Descreva o problema resumidamente" />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content">Descrição</Label>
              <Textarea id="content" {...form.register("content")} rows={4} placeholder="Explique o problema, impacto e contexto..." />
              {form.formState.errors.content && (
                <p className="text-xs text-destructive">{form.formState.errors.content.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="severity">Severidade</Label>
                <select
                  id="severity"
                  {...form.register("severity")}
                  className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <option value="INFO">Info</option>
                  <option value="WARNING">Médio</option>
                  <option value="HIGH">Alto</option>
                  <option value="CRITICAL">Crítico</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  {...form.register("category")}
                  className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <option value="SECURITY">Segurança</option>
                  <option value="OPERATIONAL">Operacional</option>
                  <option value="GENERAL">Geral</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  {...form.register("status")}
                  className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <option value="OPEN">Aberto</option>
                  <option value="IN_PROGRESS">Em andamento</option>
                  <option value="RESOLVED">Resolvido</option>
                </select>
              </div>
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

function NoteCard({
  note,
  onEdit,
  onDelete,
  onResolve,
}: {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onResolve: () => void;
}) {
  const sevCfg = SEVERITY_CONFIG[note.severity];
  const statusCfg = STATUS_CONFIG[note.status];
  const StatusIcon = statusCfg.icon;
  const isResolved = note.status === "RESOLVED";

  return (
    <Card className={`border-l-4 ${sevCfg.border} ${isResolved ? "opacity-60" : ""}`}>
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className={`font-medium text-sm ${isResolved ? "line-through text-muted-foreground" : ""}`}>
              {note.title}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${sevCfg.color}`}>
                {SEVERITY_CONFIG[note.severity].label}
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {CATEGORY_LABELS[note.category]}
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                <StatusIcon className="h-3 w-3" />
                {statusCfg.label}
              </span>
              {note.device && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {note.device.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon-sm" onClick={onEdit} title="Editar">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onResolve}
              title={isResolved ? "Reabrir" : "Marcar como resolvido"}
            >
              {isResolved ? <RotateCcw className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onDelete} title="Excluir" className="text-destructive hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3 px-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
        <p className="text-xs text-muted-foreground mt-2">
          {new Date(note.createdAt).toLocaleDateString("pt-BR", {
            day: "2-digit", month: "2-digit", year: "numeric",
          })}
          {note.resolvedAt && (
            <span className="ml-2 text-success">
              · Resolvido em {new Date(note.resolvedAt).toLocaleDateString("pt-BR")}
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
