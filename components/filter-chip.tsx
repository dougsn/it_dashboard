"use client";

export function FilterChip({ active, onClick, children, color = "default" }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: "default" | "success" | "destructive";
}) {
  const activeClass =
    color === "success"     ? "bg-success text-white border-success" :
    color === "destructive" ? "bg-destructive text-white border-destructive" :
                              "bg-primary text-primary-foreground border-primary";
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
