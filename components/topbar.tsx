"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { CountdownBadge } from "@/components/countdown-badge";

interface TopbarProps {
  title: string;
  badge?: React.ReactNode;
  subtitle?: string;
  icon?: React.ElementType;
  back?: string;
  backLabel?: string;
  live?: boolean;
  pollIntervalMs?: number;
  lastUpdated?: Date | null;
  children?: React.ReactNode;
  className?: string;
}

export function Topbar({
  title,
  badge,
  subtitle,
  icon: Icon,
  back,
  backLabel,
  live = false,
  pollIntervalMs,
  lastUpdated,
  children,
  className,
}: TopbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex items-center justify-between gap-4",
        "bg-background/80 backdrop-blur-sm border-b border-border",
        "px-7 h-[60px]",
        className
      )}
    >
      {/* Left: back + icon + title/subtitle */}
      <div className="flex items-center gap-2.5 min-w-0">
        {back && (
          <Link
            href={back}
            aria-label={backLabel ?? "Voltar"}
            className={cn(
              "flex items-center gap-1 rounded-lg border border-border hover:bg-muted transition-colors shrink-0 text-muted-foreground hover:text-foreground",
              backLabel ? "px-2 h-7 text-[11.5px] font-medium" : "justify-center w-7 h-7"
            )}
          >
            <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            {backLabel && <span>{backLabel}</span>}
          </Link>
        )}
        {Icon && (
          <div className="w-8 h-8 rounded-[8px] bg-accent flex items-center justify-center text-primary flex-shrink-0">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[15px] font-bold leading-tight truncate">{title}</h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-[11.5px] text-muted-foreground truncate leading-tight">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: live indicator + countdown + actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {live && (
          <div className="hidden sm:flex items-center gap-1.5 text-[11.5px] text-success font-semibold select-none">
            <span className="relative h-1.5 w-1.5 rounded-full bg-success animate-ping-dot flex-shrink-0" />
            Ao vivo
          </div>
        )}
        {pollIntervalMs != null && (
          <CountdownBadge intervalMs={pollIntervalMs} lastUpdated={lastUpdated ?? null} />
        )}
        {children && (
          <div className="flex items-center gap-2">{children}</div>
        )}
      </div>
    </header>
  );
}
