"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Shield,
  LayoutDashboard,
  MapPin,
  Bell,
  Settings,
  Terminal,
  History,
  Phone,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
} from "lucide-react";

const MAIN_NAV = [
  { href: "/",              label: "Dashboard",      icon: LayoutDashboard },
  { href: "/zones",         label: "Zonas",          icon: MapPin },
  { href: "/notifications", label: "Notificaciones", icon: Bell },
  { href: "/llamadas",      label: "Llamadas",       icon: Phone },
  { href: "/activity",      label: "Actividad",      icon: History },
];

const SETTINGS_NAV = [
  { href: "/config", label: "Config",    icon: Settings },
  { href: "/dev",    label: "Developer", icon: Terminal },
];

function NavLink({
  href,
  label,
  icon: Icon,
  collapsed,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-xs transition-all duration-150",
        isActive
          ? [
              "bg-white/[0.05] dark:bg-white/[0.05]",
              "border border-white/[0.07] dark:border-white/[0.07]",
              "border-t-white/[0.1] dark:border-t-white/[0.1]",
              "text-foreground font-medium",
            ]
          : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04] dark:hover:bg-white/[0.04]",
        collapsed && "justify-center px-0"
      )}
    >
      <Icon className={cn("h-[15px] w-[15px] shrink-0", isActive ? "text-primary" : "text-current")} />
      {!collapsed && <span className="whitespace-nowrap">{label}</span>}
    </Link>
  );
}

/* ─── Desktop Sidebar ────────────────────────────────────── */
export function DesktopSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) setCollapsed(stored === "true");
  }, []);

  const toggle = () =>
    setCollapsed((prev) => {
      localStorage.setItem("sidebar-collapsed", String(!prev));
      return !prev;
    });

  return (
    <aside className={cn(
      "relative flex flex-col glass glass-shine rounded-[22px] transition-all duration-300 ease-in-out shrink-0 overflow-hidden",
      collapsed ? "w-16" : "w-[172px]"
    )}>

      {/* Logo */}
      <div className={cn(
        "flex h-14 items-center gap-2 px-3 overflow-hidden border-b border-white/[0.04]",
        collapsed && "justify-center px-0"
      )}>
        <div className={cn(
          "flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px]",
          "bg-emerald-500/15 border border-emerald-500/25 border-t-emerald-400/40",
          "relative overflow-hidden"
        )}>
          <div className="absolute inset-x-[15%] top-0 h-1/2 bg-[radial-gradient(ellipse_at_top,rgba(134,239,172,0.15),transparent_80%)]" />
          <Shield className="h-[13px] w-[13px] text-emerald-400 relative z-10" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm whitespace-nowrap text-foreground">
            CdT Secure
          </span>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-0.5 p-2 flex-1">
        {MAIN_NAV.map((item) => (
          <NavLink key={item.href} {...item} collapsed={collapsed} />
        ))}

        {/* Separator */}
        <div className="my-2 border-t border-white/[0.04]" />

        {/* Settings label */}
        {!collapsed && (
          <p className="px-2.5 pb-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Ajustes
          </p>
        )}
        {SETTINGS_NAV.map((item) => (
          <NavLink key={item.href} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Theme toggle */}
      <div className={cn(
        "flex items-center border-t border-white/[0.04] p-2",
        collapsed ? "justify-center" : "justify-between px-3"
      )}>
        {!collapsed && <span className="text-[11px] text-muted-foreground/60">Tema</span>}
        <ThemeToggle />
      </div>

      {/* Collapse button */}
      <button
        onClick={toggle}
        aria-label={collapsed ? "Expandir" : "Colapsar"}
        className={cn(
          "absolute -right-3 top-16 z-20",
          "flex h-5 w-5 items-center justify-center rounded-full",
          "bg-[var(--glass-bg)] border border-[var(--glass-border)]",
          "border-t-[var(--glass-border-top)]",
          "shadow-sm hover:bg-white/[0.08] transition-colors text-muted-foreground"
        )}
      >
        {collapsed
          ? <ChevronRight className="h-2.5 w-2.5" />
          : <ChevronLeft  className="h-2.5 w-2.5" />
        }
      </button>
    </aside>
  );
}

/* ─── Mobile Nav ─────────────────────────────────────────── */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      {/* Top bar */}
      <header className="flex h-14 items-center justify-between border-b border-white/[0.07] bg-[var(--glass-bg)] backdrop-blur-xl px-4 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-emerald-500/15 border border-emerald-500/25 relative overflow-hidden">
            <div className="absolute inset-x-[15%] top-0 h-1/2 bg-[radial-gradient(ellipse_at_top,rgba(134,239,172,0.15),transparent_80%)]" />
            <Shield className="h-4 w-4 text-emerald-400 relative z-10" />
          </div>
          <span className="font-semibold text-sm">CdT Secure</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] hover:bg-white/[0.05] transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-full w-72",
        "glass glass-shine",
        "transform transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-14 items-center justify-between border-b border-white/[0.05] px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-emerald-500/15 border border-emerald-500/25 relative overflow-hidden">
              <div className="absolute inset-x-[15%] top-0 h-1/2 bg-[radial-gradient(ellipse_at_top,rgba(134,239,172,0.15),transparent_80%)]" />
              <Shield className="h-4 w-4 text-emerald-400 relative z-10" />
            </div>
            <span className="font-semibold text-sm">CdT Secure</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-[9px] hover:bg-white/[0.05] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-3.5rem)] overflow-y-auto p-3">
          <nav className="flex flex-col gap-0.5 flex-1">
            {MAIN_NAV.map((item) => (
              <NavLink key={item.href} {...item} onClick={() => setOpen(false)} />
            ))}

            <div className="my-2 border-t border-white/[0.04]" />
            <p className="px-2.5 pb-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              Ajustes
            </p>

            {SETTINGS_NAV.map((item) => (
              <NavLink key={item.href} {...item} onClick={() => setOpen(false)} />
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
