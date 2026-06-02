"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Server, Network, StickyNote, LogOut } from "lucide-react";

interface SidebarCounts {
  devicesTotal: number;
  devicesOffline: number;
  linksOnline: number;
  linksTotal: number;
}

function BrandMark() {
  return (
    <div
      className="flex items-center justify-center w-[34px] h-[34px] rounded-[10px] flex-shrink-0 text-white"
      style={{
        background: "linear-gradient(145deg, #6d5cf6 0%, #5b48e8 100%)",
        boxShadow: "0 4px 12px rgba(109,92,246,.35), inset 0 1px 0 rgba(255,255,255,.25)",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20h4V12H2zM9 20h4V6H9zM16 20h4V2h-4z" />
        <circle cx="20" cy="2" r="2" fill="currentColor" stroke="none" />
      </svg>
    </div>
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
    <div className="px-2.5 pt-4 pb-1.5 text-[10.5px] font-bold uppercase tracking-[.09em] text-muted-foreground/60 select-none">
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
          active ? "text-primary" : "text-muted-foreground"
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
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
      style={{ background: "linear-gradient(145deg, #2a2c38, #15161e)" }}
    >
      {initials}
    </div>
  );
}

export function Sidebar({ userName = "Usuário" }: { userName?: string }) {
  const pathname = usePathname();
  const [counts, setCounts] = useState<SidebarCounts>({
    devicesTotal: 0,
    devicesOffline: 0,
    linksOnline: 0,
    linksTotal: 0,
  });

  useEffect(() => {
    async function loadCounts() {
      const [devRes, linkRes] = await Promise.all([
        fetch("/api/devices"),
        fetch("/api/links"),
      ]);
      if (devRes.ok) {
        const devices = await devRes.json();
        setCounts((prev) => ({
          ...prev,
          devicesTotal: devices.length,
          devicesOffline: devices.filter((d: { currentStatus?: { isOnline: boolean } }) => !d.currentStatus?.isOnline).length,
        }));
      }
      if (linkRes.ok) {
        const links = await linkRes.json();
        setCounts((prev) => ({
          ...prev,
          linksOnline: links.filter((l: { isOnline: boolean }) => l.isOnline).length,
          linksTotal: links.length,
        }));
      }
    }

    loadCounts();
    const interval = setInterval(loadCounts, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-60 flex-shrink-0 bg-card border-r border-border flex flex-col" style={{ padding: "18px 14px 14px" }}>
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-2 pb-5">
        <BrandMark />
        <div>
          <div className="font-extrabold text-[15px] tracking-tight leading-none">NetWatch</div>
          <div className="text-[11px] text-muted-foreground font-semibold mt-0.5">Monitoramento</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
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

        <NavSectionLabel>Sistema</NavSectionLabel>

        <NavItem
          href="/notes"
          label="Notas & Segurança"
          icon={StickyNote}
          active={pathname.startsWith("/notes")}
        />
      </nav>

      {/* User footer */}
      <div className="pt-3 border-t border-border/60">
        <div className="flex items-center gap-2.5 p-2 rounded-[10px] transition-colors hover:bg-muted group">
          <UserAvatar name={userName} />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold leading-tight truncate">{userName}</div>
            <div className="text-[11px] text-muted-foreground font-semibold">Administrador</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
