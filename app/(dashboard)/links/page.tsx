"use client";

import { useEffect, useState, useCallback } from "react";
import { usePolling } from "@/hooks/use-polling";
import { LinkDetailDrawer } from "@/components/link-detail-drawer";
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
  MapPin,
  Router,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowDown,
  ArrowUp,
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
import { formatBps } from "@/lib/format";
import { BandwidthCell } from "@/components/bandwidth-cell";
import { FilterChip } from "@/components/filter-chip";
import { SkeletonList } from "@/components/skeleton-list";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface LinkItem {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  isOnline: boolean;
  lastEventAt: string | null;
  createdAt: string;
  downloadBps: number | null;
  uploadBps: number | null;
  contractedDownloadBps: number | null;
  contractedUploadBps: number | null;
  mikrotikDeviceId: string | null;
  mikrotikInterface: string | null;
  webhookToken: string;
  _count: { events: number };
}

interface MikrotikDevice {
  id: string;
  name: string;
  ip: string;
}

const formSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(100),
  description: z.string().max(500).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  mikrotikDeviceId: z.string().optional().nullable(),
  mikrotikInterface: z.string().max(50).optional().nullable(),
  contractedDownloadMbps: z.number().positive("Deve ser maior que 0").optional().nullable(),
  contractedUploadMbps: z.number().positive("Deve ser maior que 0").optional().nullable(),
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


export default function LinksPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [mikrotiks, setMikrotiks] = useState<MikrotikDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ONLINE" | "OFFLINE">("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LinkItem | null>(null);
  const [origin, setOrigin] = useState("");
  const [drawerLinkId, setDrawerLinkId] = useState<string | null>(null);

  type TrafficTest =
    | { state: "idle" }
    | { state: "testing" }
    | { state: "ok"; downloadBps: number; uploadBps: number }
    | { state: "error"; message: string };

  const [trafficTest, setTrafficTest] = useState<TrafficTest>({ state: "idle" });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", location: "", mikrotikDeviceId: "", mikrotikInterface: "", contractedDownloadMbps: null, contractedUploadMbps: null },
  });

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const fetchLinks = useCallback(async () => {
    const res = await fetch("/api/links");
    if (res.ok) setLinks(await res.json());
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  usePolling(fetchLinks, 30_000);

  useEffect(() => {
    fetch("/api/devices?type=MIKROTIK")
      .then((r) => r.json())
      .then(setMikrotiks)
      .catch(() => {});
  }, []);

  function openCreate() {
    setEditing(null);
    setTrafficTest({ state: "idle" });
    form.reset({ name: "", description: "", location: "", mikrotikDeviceId: "", mikrotikInterface: "", contractedDownloadMbps: null, contractedUploadMbps: null });
    setDialogOpen(true);
  }

  function openEdit(e: React.MouseEvent, link: LinkItem) {
    e.stopPropagation();
    setEditing(link);
    setTrafficTest({ state: "idle" });
    form.reset({
      name: link.name,
      description: link.description ?? "",
      location: link.location ?? "",
      mikrotikDeviceId: link.mikrotikDeviceId ?? "",
      mikrotikInterface: link.mikrotikInterface ?? "",
      contractedDownloadMbps: link.contractedDownloadBps != null ? link.contractedDownloadBps / 1_000_000 : null,
      contractedUploadMbps: link.contractedUploadBps != null ? link.contractedUploadBps / 1_000_000 : null,
    });
    setDialogOpen(true);
  }

  async function testTraffic(deviceId?: string, iface?: string): Promise<TrafficTest> {
    const mikrotikDeviceId = deviceId ?? form.getValues("mikrotikDeviceId");
    const mikrotikInterface = iface ?? form.getValues("mikrotikInterface");
    if (!mikrotikDeviceId || !mikrotikInterface) {
      const result: TrafficTest = { state: "error", message: "Selecione o Mikrotik e informe a interface antes de testar." };
      setTrafficTest(result);
      return result;
    }
    setTrafficTest({ state: "testing" });
    try {
      const res = await fetch("/api/links/test-traffic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mikrotikDeviceId, mikrotikInterface }),
      });
      const data = await res.json();
      const result: TrafficTest = res.ok
        ? { state: "ok", downloadBps: data.downloadBps, uploadBps: data.uploadBps }
        : { state: "error", message: data.error ?? "Erro desconhecido" };
      setTrafficTest(result);
      return result;
    } catch {
      const result: TrafficTest = { state: "error", message: "Erro de rede ao testar conexão" };
      setTrafficTest(result);
      return result;
    }
  }

  async function onSubmit(values: FormValues) {
    // If RouterOS config is set, require a passing test before saving
    if (values.mikrotikDeviceId && values.mikrotikInterface) {
      const current = trafficTest;
      if (current.state !== "ok") {
        const result = await testTraffic(values.mikrotikDeviceId, values.mikrotikInterface);
        if (result.state !== "ok") return; // block save; error already shown in form
      }
    }

    try {
      const url = editing ? `/api/links/${editing.id}` : "/api/links";
      const method = editing ? "PUT" : "POST";
      const { contractedDownloadMbps, contractedUploadMbps, ...rest } = values;
      const toValidBps = (v: number | null | undefined) =>
        v != null && !isNaN(v) && v > 0 ? Math.round(v * 1_000_000) : null;
      const payload = {
        ...rest,
        contractedDownloadBps: toValidBps(contractedDownloadMbps),
        contractedUploadBps: toValidBps(contractedUploadMbps),
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success(editing ? "Link atualizado" : "Link criado");
      setDialogOpen(false);
      fetchLinks();
    } catch {
      toast.error("Erro ao salvar link");
    }
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setConfirmDeleteId(id);
  }

  async function confirmDelete() {
    if (!confirmDeleteId) return;
    try {
      const res = await fetch(`/api/links/${confirmDeleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Link excluído");
      await fetchLinks();
    } catch {
      toast.error("Erro ao excluir");
    } finally {
      setConfirmDeleteId(null);
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
        pollIntervalMs={30_000}
        lastUpdated={lastUpdated}
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
          <SkeletonList count={3} />
        ) : filtered.length === 0 ? (
          links.length === 0 ? (
            <EmptyState
              icon={Network}
              title="Nenhum link cadastrado."
              action={<Button variant="outline" onClick={openCreate}>Cadastrar primeiro link</Button>}
            />
          ) : (
            <EmptyState title="Nenhum link encontrado para o filtro selecionado." />
          )
        ) : (
          <div className="rounded-xl border bg-card overflow-x-auto">
            <table className="w-full text-sm" aria-label="Lista de links de internet">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Link
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                  <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Local
                  </th>
                  <th className="hidden sm:table-cell text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    ↓ Download
                  </th>
                  <th className="hidden sm:table-cell text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    ↑ Upload
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
                    onClick={() => setDrawerLinkId(link.id)}
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

                    {/* Local */}
                    <td className="hidden md:table-cell px-4 py-3 text-xs text-muted-foreground">
                      {link.location ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />{link.location}
                        </span>
                      ) : <span className="opacity-40">—</span>}
                    </td>

                    {/* Download */}
                    <td className="hidden sm:table-cell px-4 py-3 text-right">
                      <BandwidthCell current={link.downloadBps} contracted={link.contractedDownloadBps} color="success" />
                    </td>

                    {/* Upload */}
                    <td className="hidden sm:table-cell px-4 py-3 text-right">
                      <BandwidthCell current={link.uploadBps} contracted={link.contractedUploadBps} color="primary" />
                    </td>

                    {/* Webhooks */}
                    <td
                      className="hidden lg:table-cell px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1">
                        <CopyIconButton
                          text={`${origin}/api/links/${link.id}/down?token=${link.webhookToken}`}
                          label="DOWN"
                        />
                        <CopyIconButton
                          text={`${origin}/api/links/${link.id}/up?token=${link.webhookToken}`}
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
                          aria-label="Ver detalhes do link"
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={(e) => openEdit(e, link)}
                          aria-label="Editar link"
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, link.id)}
                          aria-label="Excluir link"
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar link" : "Novo link de internet"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" {...form.register("name")} placeholder="Link principal, Fibra VIVO..." />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">
                  <MapPin className="inline h-3 w-3 mr-1 opacity-60" />Local (opcional)
                </Label>
                <Input id="location" {...form.register("location")} placeholder="Itaguaí, Recreio..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input id="description" {...form.register("description")} placeholder="Provedor, contrato..." />
              </div>
            </div>

            {/* Banda contratada */}
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-3">
              <p className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />Banda contratada (opcional)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="contractedDownloadMbps">
                    <ArrowDown className="inline h-3 w-3 mr-0.5 text-success" />Download (Mbps)
                  </Label>
                  <Input
                    id="contractedDownloadMbps"
                    type="number"
                    step="any"
                    placeholder="ex: 100"
                    {...form.register("contractedDownloadMbps", { valueAsNumber: true })}
                  />
                  {form.formState.errors.contractedDownloadMbps && (
                    <p className="text-xs text-destructive">{form.formState.errors.contractedDownloadMbps.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contractedUploadMbps">
                    <ArrowUp className="inline h-3 w-3 mr-0.5 text-primary" />Upload (Mbps)
                  </Label>
                  <Input
                    id="contractedUploadMbps"
                    type="number"
                    step="any"
                    placeholder="ex: 50"
                    {...form.register("contractedUploadMbps", { valueAsNumber: true })}
                  />
                  {form.formState.errors.contractedUploadMbps && (
                    <p className="text-xs text-destructive">{form.formState.errors.contractedUploadMbps.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* RouterOS traffic monitoring */}
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-3">
              <p className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                <Router className="h-3.5 w-3.5" />Monitoramento de tráfego (RouterOS)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="mikrotikDeviceId">Mikrotik</Label>
                  <select
                    id="mikrotikDeviceId"
                    {...form.register("mikrotikDeviceId")}
                    onChange={(e) => { form.setValue("mikrotikDeviceId", e.target.value); setTrafficTest({ state: "idle" }); }}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Não configurado</option>
                    {mikrotiks.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.ip})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mikrotikInterface">Interface</Label>
                  <div className="flex gap-2">
                    <Input
                      id="mikrotikInterface"
                      {...form.register("mikrotikInterface")}
                      onChange={(e) => { form.setValue("mikrotikInterface", e.target.value); setTrafficTest({ state: "idle" }); }}
                      placeholder="ether1, sfp1..."
                      className={trafficTest.state === "error" ? "border-destructive focus-visible:ring-destructive" : trafficTest.state === "ok" ? "border-success focus-visible:ring-success" : ""}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 px-3"
                      disabled={trafficTest.state === "testing"}
                      onClick={() => testTraffic()}
                    >
                      {trafficTest.state === "testing" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Testar"
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Test feedback */}
              {trafficTest.state === "ok" && (
                <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-3 py-2.5">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-success">Conexão OK — interface respondendo</p>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      ↓ {formatBps(trafficTest.downloadBps)} · ↑ {formatBps(trafficTest.uploadBps)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-success font-semibold flex items-center gap-1">
                      <ArrowDown className="h-3 w-3" />{formatBps(trafficTest.downloadBps)}
                    </span>
                    <span className="text-[11px] text-primary font-semibold flex items-center gap-1">
                      <ArrowUp className="h-3 w-3" />{formatBps(trafficTest.uploadBps)}
                    </span>
                  </div>
                </div>
              )}
              {trafficTest.state === "error" && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5">
                  <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive leading-relaxed">{trafficTest.message}</p>
                </div>
              )}
              {trafficTest.state === "idle" && (
                <p className="text-[11px] text-muted-foreground">
                  Configure o Mikrotik e a interface, depois clique em <strong>Testar</strong> para validar antes de salvar.
                </p>
              )}
              {trafficTest.state === "testing" && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />Conectando ao RouterOS…
                </p>
              )}
            </div>

            <DialogFooter showCloseButton>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || trafficTest.state === "testing"}
              >
                {form.formState.isSubmitting || trafficTest.state === "testing" ? (
                  <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />{trafficTest.state === "testing" ? "Validando…" : "Salvando…"}</>
                ) : editing ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <LinkDetailDrawer linkId={drawerLinkId} onClose={() => setDrawerLinkId(null)} />
      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir este link?"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={confirmDelete}
      />
    </>
  );
}
