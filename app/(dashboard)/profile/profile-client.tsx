"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  UserCircle2, ShieldCheck, ShieldOff, KeyRound, Eye, Wrench,
  QrCode, Copy, CheckCircle, AlertTriangle, Loader2, X,
} from "lucide-react";
import { toast } from "sonner";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface UserData {
  id: string;
  username: string;
  role: "ADMIN" | "OPERADOR" | "VIEWER";
  totpEnabled: boolean;
  createdAt: Date;
}

const ROLE_LABEL = { ADMIN: "Administrador", OPERADOR: "Operador", VIEWER: "Viewer" };
const ROLE_ICON = { ADMIN: ShieldCheck, OPERADOR: Wrench, VIEWER: Eye };
const ROLE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  ADMIN: "default", OPERADOR: "secondary", VIEWER: "outline",
};

type Step = "idle" | "setup-loading" | "setup" | "setup-verifying" | "disable" | "disable-verifying";

interface SetupData {
  secret: string;
  qrDataUrl: string;
  uri: string;
}

export default function ProfileClient({ user }: { user: UserData }) {
  const router = useRouter();
  const [totpEnabled, setTotpEnabled] = useState(user.totpEnabled);
  const [step, setStep] = useState<Step>("idle");
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);

  const RoleIcon = ROLE_ICON[user.role];

  // ── Enable flow ─────────────────────────────────────────────────────────────

  async function startSetup() {
    setStep("setup-loading");
    setToken("");
    try {
      const res = await fetch(`/api/users/${user.id}/totp`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSetupData(data);
      setStep("setup");
    } catch {
      toast.error("Erro ao gerar QR code. Tente novamente.");
      setStep("idle");
    }
  }

  async function confirmEnable(e: React.FormEvent) {
    e.preventDefault();
    if (!setupData) return;
    setStep("setup-verifying");
    try {
      const res = await fetch(`/api/users/${user.id}/totp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.replace(/\s/g, ""), secret: setupData.secret }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Token inválido. Verifique seu app autenticador.");
        setStep("setup");
        return;
      }
      setTotpEnabled(true);
      setStep("idle");
      setSetupData(null);
      setToken("");
      toast.success("Autenticação em dois fatores ativada com sucesso!");
      router.refresh();
    } catch {
      toast.error("Erro ao verificar token. Tente novamente.");
      setStep("setup");
    }
  }

  // ── Disable flow ────────────────────────────────────────────────────────────

  async function confirmDisable(e: React.FormEvent) {
    e.preventDefault();
    setStep("disable-verifying");
    try {
      const res = await fetch(`/api/users/${user.id}/totp`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.replace(/\s/g, "") }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Token inválido. Verifique seu app autenticador.");
        setStep("disable");
        return;
      }
      setTotpEnabled(false);
      setStep("idle");
      setToken("");
      toast.success("Autenticação em dois fatores desativada.");
      router.refresh();
    } catch {
      toast.error("Erro ao desativar 2FA. Tente novamente.");
      setStep("disable");
    }
  }

  function cancelFlow() {
    setStep("idle");
    setSetupData(null);
    setToken("");
  }

  async function copySecret() {
    if (!setupData) return;
    await navigator.clipboard.writeText(setupData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isLoading = step === "setup-loading" || step === "setup-verifying" || step === "disable-verifying";

  return (
    <>
      <Topbar
        title="Minha conta"
        subtitle="Informações do perfil e configurações de segurança"
        icon={UserCircle2}
      />

      <div className="p-7 max-w-2xl mx-auto space-y-6">

        {/* ── User info ────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
              Informações do perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2.5 border-b border-border/60">
              <span className="text-sm text-muted-foreground">Nome de usuário</span>
              <span className="font-mono font-semibold text-sm">{user.username}</span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-border/60">
              <span className="text-sm text-muted-foreground">Função</span>
              <Badge variant={ROLE_VARIANT[user.role]} className="gap-1.5">
                <RoleIcon className="h-3 w-3" aria-hidden="true" />
                {ROLE_LABEL[user.role]}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-muted-foreground">Conta criada em</span>
              <span className="text-sm font-semibold">
                {fmtDate(user.createdAt.toString(), { day: "2-digit", month: "2-digit", year: "numeric" })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── 2FA card ─────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" aria-hidden="true" />
              Autenticação em dois fatores (2FA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Status banner */}
            <div className={cn(
              "flex items-center gap-3 rounded-xl p-4 border",
              totpEnabled
                ? "bg-success/5 border-success/20"
                : "bg-muted/40 border-border/60"
            )}>
              {totpEnabled
                ? <CheckCircle className="h-5 w-5 text-success shrink-0" aria-hidden="true" />
                : <ShieldOff className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
              }
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold", totpEnabled ? "text-success" : "text-foreground")}>
                  {totpEnabled ? "2FA ativado" : "2FA desativado"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {totpEnabled
                    ? "Sua conta está protegida com um segundo fator de autenticação."
                    : "Ative o 2FA para proteger sua conta com um app autenticador (Google Authenticator, Authy, etc.)."}
                </p>
              </div>
              {step === "idle" && (
                totpEnabled ? (
                  <Button
                    size="sm" variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive shrink-0"
                    onClick={() => { setStep("disable"); setToken(""); }}
                  >
                    <ShieldOff className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                    Desativar
                  </Button>
                ) : (
                  <Button size="sm" onClick={startSetup} disabled={isLoading} className="shrink-0">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                    Ativar 2FA
                  </Button>
                )
              )}
            </div>

            {/* ── Setup flow ─────────────────────────────────────── */}
            {(step === "setup" || step === "setup-verifying") && setupData && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm">Configure seu app autenticador</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Escaneie o QR code abaixo com Google Authenticator, Authy ou qualquer app TOTP.
                    </p>
                  </div>
                  <button
                    onClick={cancelFlow}
                    aria-label="Cancelar configuração"
                    className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                {/* QR code */}
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="p-3 bg-white rounded-xl border border-border shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={setupData.qrDataUrl} alt="QR code para configurar o autenticador" width={160} height={160} />
                    </div>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <QrCode className="h-3 w-3" aria-hidden="true" />
                      Escaneie com o app
                    </span>
                  </div>

                  <div className="flex-1 space-y-3 min-w-0">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                        Ou insira a chave manualmente
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 font-mono text-[13px] bg-muted px-3 py-2 rounded-lg border border-border text-accent-foreground truncate">
                          {setupData.secret}
                        </code>
                        <button
                          onClick={copySecret}
                          aria-label="Copiar chave secreta"
                          className="p-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
                        >
                          {copied
                            ? <CheckCircle className="h-4 w-4 text-success" aria-hidden="true" />
                            : <Copy className="h-4 w-4" aria-hidden="true" />
                          }
                        </button>
                      </div>
                    </div>

                    <div className="rounded-lg bg-warning/5 border border-warning/20 p-3 text-xs text-muted-foreground">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning inline mr-1.5" aria-hidden="true" />
                      Guarde esta chave em local seguro. Você precisará dela para recuperar o acesso caso perca o app.
                    </div>
                  </div>
                </div>

                {/* Verification */}
                <form onSubmit={confirmEnable} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="totp-enable-token">
                      Digite o código gerado pelo app para confirmar
                    </Label>
                    <Input
                      id="totp-enable-token"
                      value={token}
                      onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000 000"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      className="font-mono text-lg tracking-[.3em] text-center w-40"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={token.length !== 6 || step === "setup-verifying"}
                    >
                      {step === "setup-verifying"
                        ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" />Verificando...</>
                        : <><ShieldCheck className="h-4 w-4 mr-1.5" aria-hidden="true" />Confirmar e ativar</>
                      }
                    </Button>
                    <Button type="button" variant="outline" onClick={cancelFlow} disabled={step === "setup-verifying"}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Disable flow ───────────────────────────────────── */}
            {(step === "disable" || step === "disable-verifying") && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm text-foreground">Desativar autenticação em dois fatores</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Confirme com o código do seu app autenticador para desativar o 2FA.
                    </p>
                  </div>
                  <button
                    onClick={cancelFlow}
                    aria-label="Cancelar"
                    className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <form onSubmit={confirmDisable} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="totp-disable-token">Código do autenticador</Label>
                    <Input
                      id="totp-disable-token"
                      value={token}
                      onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000 000"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      className="font-mono text-lg tracking-[.3em] text-center w-40"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={token.length !== 6 || step === "disable-verifying"}
                    >
                      {step === "disable-verifying"
                        ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" />Desativando...</>
                        : <><ShieldOff className="h-4 w-4 mr-1.5" aria-hidden="true" />Desativar 2FA</>
                      }
                    </Button>
                    <Button type="button" variant="outline" onClick={cancelFlow} disabled={step === "disable-verifying"}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Info footer */}
            {step === "idle" && (
              <p className="text-xs text-muted-foreground">
                Apps compatíveis: Google Authenticator, Authy, Microsoft Authenticator, 1Password e qualquer app TOTP (RFC 6238).
              </p>
            )}
          </CardContent>
        </Card>

      </div>
    </>
  );
}
