"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Server, Network, LogOut, AlertCircle, FileText, RadioTower, Wifi, Router, Users, Settings, ClipboardList, History, ShieldCheck, BookOpen, Code2, FlaskConical } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface SidebarCounts {
  devicesTotal: number;
  devicesOffline: number;
  linksOnline: number;
  linksTotal: number;
}

function BrandMark() {
  return (
    <div
      className="flex items-center justify-center w-[34px] h-[34px] rounded-[10px] shrink-0 text-white"
      style={{
        background: "linear-gradient(145deg, #6d5cf6 0%, #5b48e8 100%)",
        boxShadow: "0 4px 12px rgba(109,92,246,.35), inset 0 1px 0 rgba(255,255,255,.25)",
      }}
    >
      <LighthouseIcon size={18} />
    </div>
  );
}

function LighthouseIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Light rays */}
      <line x1="12" y1="2" x2="12" y2="3.5" />
      <line x1="8.5" y1="3" x2="9.8" y2="4.8" />
      <line x1="15.5" y1="3" x2="14.2" y2="4.8" />
      {/* Lantern globe */}
      <circle cx="12" cy="7.5" r="2" />
      {/* Lantern platform */}
      <path d="M9.5 9.5h5" />
      {/* Tower body (trapezoid) */}
      <path d="M9.5 9.5L8 21h8l-1.5-11.5" />
      {/* Base */}
      <line x1="6.5" y1="21" x2="17.5" y2="21" />
      {/* Arched door */}
      <path d="M11 21v-2.5A1 1 0 0 1 13 18.5V21" />
    </svg>
  );
}

function NavBadge({ count, alert }: { count: string | number; alert?: boolean }) {
  return (
    <span
      className={cn(
        "ml-auto text-[11px] font-bold rounded-full px-2 py-px min-w-[20px] text-center",
        alert
          ? "bg-destructive/10 text-destructive"
          : "bg-muted text-muted-foreground"
      )}
    >
      {count}
    </span>
  );
}

function NavSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2.5 pt-4 pb-1.5 text-[10.5px] font-bold uppercase tracking-[.09em] text-muted-foreground select-none">
      {children}
    </div>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  badge,
  alertBadge,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  badge?: string | number;
  alertBadge?: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-2.5 py-[9px] rounded-[10px] text-[13.5px] font-semibold transition-colors duration-150",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center transition-colors duration-150",
          active ? "text-accent-foreground" : "text-muted-foreground"
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      {label}
      {alertBadge != null && alertBadge > 0 && (
        <NavBadge count={alertBadge} alert />
      )}
      {badge != null && !(alertBadge != null && alertBadge > 0) && (
        <NavBadge count={badge} />
      )}
    </Link>
  );
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0"
      style={{ background: "linear-gradient(145deg, #2a2c38, #15161e)" }}
    >
      {initials}
    </div>
  );
}

export function Sidebar({
  userName = "Usuário",
  userRole = "VIEWER",
  initialCounts,
}: {
  userName?: string;
  userRole?: string;
  initialCounts?: SidebarCounts;
}) {
  const pathname = usePathname();
  const [counts, setCounts] = useState<SidebarCounts>(
    initialCounts ?? { devicesTotal: 0, devicesOffline: 0, linksOnline: 0, linksTotal: 0 }
  );
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/version")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.build) setVersion(`v${d.version} · build ${d.build}`); })
      .catch(() => {});
  }, []);

  return (
    <aside aria-label="Menu lateral" className="w-60 shrink-0 bg-card border-r border-border flex flex-col pt-4.5 px-3.5 pb-3.5">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-2 pb-5">
        <BrandMark />
        <div>
          <div className="font-extrabold text-[15px] tracking-tight leading-none">WatchIT Tower</div>
          <div className="text-[11px] text-muted-foreground font-semibold mt-0.5">Monitoramento</div>
        </div>
      </div>

      {/* Nav */}
      <nav aria-label="Menu principal" className="flex flex-col gap-0.5 flex-1">
        <NavSectionLabel>Monitoramento</NavSectionLabel>

        <NavItem
          href="/"
          label="Visão geral"
          icon={LayoutDashboard}
          active={pathname === "/"}
        />

        <NavItem
          href="/devices"
          label="Dispositivos"
          icon={Server}
          active={pathname.startsWith("/devices")}
          badge={counts.devicesTotal > 0 ? counts.devicesTotal : undefined}
          alertBadge={counts.devicesOffline}
        />

        <NavItem
          href="/links"
          label="Links de Internet"
          icon={Network}
          active={pathname.startsWith("/links")}
          badge={
            counts.linksTotal > 0
              ? `${counts.linksOnline}/${counts.linksTotal}`
              : undefined
          }
        />

        <NavItem
          href="/incidents"
          label="Incidentes"
          icon={AlertCircle}
          active={pathname.startsWith("/incidents")}
          alertBadge={counts.devicesOffline}
        />

        <NavSectionLabel>Painéis</NavSectionLabel>

        <NavItem
          href="/mikrotik"
          label="Mikrotik"
          icon={Router}
          active={pathname.startsWith("/mikrotik")}
        />

        <NavItem
          href="/omada"
          label="Omada"
          icon={RadioTower}
          active={pathname.startsWith("/omada")}
        />

        <NavItem
          href="/unifi"
          label="UniFi"
          icon={Wifi}
          active={pathname.startsWith("/unifi")}
        />

        <NavSectionLabel>Sistema</NavSectionLabel>

        <NavItem
          href="/reports"
          label="Relatórios"
          icon={FileText}
          active={pathname.startsWith("/reports")}
        />

        <NavItem
          href="/security"
          label="Segurança"
          icon={ShieldCheck}
          active={pathname.startsWith("/security")}
        />

        <NavItem
          href="/changelog"
          label="Changelog"
          icon={History}
          active={pathname.startsWith("/changelog")}
        />

        <NavItem
          href="/manual"
          label="Manual"
          icon={BookOpen}
          active={pathname.startsWith("/manual")}
        />

        {userRole === "ADMIN" && (
          <>
            <NavSectionLabel>Administração</NavSectionLabel>
            <NavItem
              href="/users"
              label="Usuários"
              icon={Users}
              active={pathname.startsWith("/users")}
            />
            <NavItem
              href="/system"
              label="Sistema"
              icon={Settings}
              active={pathname.startsWith("/system")}
            />
            <NavItem
              href="/audit"
              label="Logs de Alterações"
              icon={ClipboardList}
              active={pathname.startsWith("/audit")}
            />
            <NavItem
              href="/dev-manual"
              label="Manual Dev"
              icon={Code2}
              active={pathname.startsWith("/dev-manual")}
            />
            <NavItem
              href="/test-manual"
              label="Manual Testes"
              icon={FlaskConical}
              active={pathname.startsWith("/test-manual")}
            />
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="pt-3 border-t border-border/60">
        <div className="flex items-center gap-2.5 p-2 rounded-[10px] transition-colors hover:bg-muted group">
          <Link href="/profile" className="flex items-center gap-2.5 flex-1 min-w-0" aria-label="Minha conta">
            <UserAvatar name={userName} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold leading-tight truncate">{userName}</div>
              <div className="text-[11px] text-muted-foreground font-semibold">
                {userRole === "ADMIN" ? "Administrador" : userRole === "OPERADOR" ? "Operador" : "Viewer"}
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ThemeToggle />
            <button
              onClick={async () => {
                // SEC-021: blacklist the JWT before signing out
                await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
                await signOut({ callbackUrl: "/login" });
              }}
              className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      {version && (
        <div className="pt-2 text-center text-[9.5px] text-muted-foreground font-mono tracking-wide select-none">
          {version}
        </div>
      )}
    </aside>
  );
}
