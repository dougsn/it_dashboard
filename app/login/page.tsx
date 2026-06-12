"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Wifi, Server, AlertTriangle, Shield } from "lucide-react";

function LighthouseIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="2" x2="12" y2="3.5" />
      <line x1="8.5" y1="3" x2="9.8" y2="4.8" />
      <line x1="15.5" y1="3" x2="14.2" y2="4.8" />
      <circle cx="12" cy="7.5" r="2" />
      <path d="M9.5 9.5h5" />
      <path d="M9.5 9.5L8 21h8l-1.5-11.5" />
      <line x1="6.5" y1="21" x2="17.5" y2="21" />
      <path d="M11 21v-2.5A1 1 0 0 1 13 18.5V21" />
    </svg>
  );
}

const features = [
  {
    icon: Server,
    label: "Dispositivos em tempo real",
    desc: "Mikrotik, câmeras, DVRs, switches e roteadores",
  },
  {
    icon: Wifi,
    label: "Links de internet",
    desc: "Utilização de banda, latência e histórico de uptime",
  },
  {
    icon: AlertTriangle,
    label: "Incidentes automáticos",
    desc: "Detecção, timeline e histórico de eventos",
  },
  {
    icon: Shield,
    label: "Auditoria e segurança",
    desc: "Logs de alterações, notas e relatórios",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Usuário ou senha inválidos");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — branding ── */}
      <div
        className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0c0d15 0%, #13152a 60%, #0c0d15 100%)" }}
      >
        {/* Glow accents */}
        <div
          className="absolute -top-20 right-0 w-130 h-130 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(109,92,246,.18) 0%, transparent 65%)" }}
        />
        <div
          className="absolute bottom-0 -left-20 w-90 h-90 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(91,72,232,.12) 0%, transparent 65%)" }}
        />

        {/* Top logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="flex items-center justify-center w-11 h-11 rounded-[14px] text-white shrink-0"
            style={{
              background: "linear-gradient(145deg, #6d5cf6 0%, #5b48e8 100%)",
              boxShadow: "0 8px 24px rgba(109,92,246,.45), inset 0 1px 0 rgba(255,255,255,.2)",
            }}
          >
            <LighthouseIcon size={22} />
          </div>
          <div>
            <div className="text-white font-extrabold text-[17px] tracking-tight leading-none">
              WatchIT Tower
            </div>
            <div className="text-white/40 text-xs font-semibold mt-0.5">Monitoramento de TI</div>
          </div>
        </div>

        {/* Hero area */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
          <div className="mb-10 relative w-fit">
            <div
              className="absolute inset-0 rounded-full blur-3xl scale-150 opacity-25 pointer-events-none"
              style={{ background: "radial-gradient(circle, #6d5cf6, transparent)" }}
            />
            <LighthouseIcon size={96} className="relative text-white/75 drop-shadow-2xl" />
          </div>

          <h1 className="text-white text-[2rem] font-extrabold tracking-tight leading-[1.2] mb-4">
            Visibilidade total<br />da sua infraestrutura
          </h1>
          <p className="text-white/45 text-[15px] leading-relaxed mb-10 max-w-85">
            Monitore dispositivos, links de internet e incidentes em tempo real — tudo centralizado em um só painel.
          </p>

          <div className="space-y-4 max-w-85">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3.5">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
                  style={{ background: "rgba(109,92,246,.2)", border: "1px solid rgba(109,92,246,.25)" }}
                >
                  <Icon className="h-4 w-4" style={{ color: "#a597fa" }} />
                </div>
                <div>
                  <div className="text-white/85 text-[13.5px] font-semibold leading-tight">{label}</div>
                  <div className="text-white/35 text-xs leading-snug mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-white/20 text-[11px] font-semibold tracking-wide uppercase">
          Uso exclusivo interno
        </div>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="flex-1 flex items-center justify-center bg-background px-8 py-12">
        <div className="w-full max-w-90">

          {/* Mobile-only logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-[12px] text-white shrink-0"
              style={{
                background: "linear-gradient(145deg, #6d5cf6 0%, #5b48e8 100%)",
                boxShadow: "0 4px 12px rgba(109,92,246,.35)",
              }}
            >
              <LighthouseIcon size={20} />
            </div>
            <div>
              <div className="font-extrabold text-[15px] tracking-tight leading-none">WatchIT Tower</div>
              <div className="text-[11px] text-muted-foreground font-semibold mt-0.5">Monitoramento de TI</div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-[1.6rem] font-extrabold tracking-tight leading-tight">
              Bem-vindo de volta
            </h2>
            <p className="text-muted-foreground text-sm mt-1.5">
              Credenciais fornecidas pelo administrador
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold">
                Usuário
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Seu nome de usuário"
                required
                autoFocus
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-11"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive font-semibold">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 font-bold text-[15px] mt-1 border-0"
              disabled={loading}
              style={
                loading
                  ? undefined
                  : {
                      background: "linear-gradient(145deg, #6d5cf6 0%, #5b48e8 100%)",
                      boxShadow: "0 4px 14px rgba(109,92,246,.35)",
                    }
              }
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-10 text-center text-[11px] text-muted-foreground/40 font-semibold tracking-wide uppercase">
            WatchIT Tower · Acesso restrito
          </p>
        </div>
      </div>
    </div>
  );
}
