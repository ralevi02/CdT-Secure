"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Shield, LayoutDashboard, MapPin, Bell, Settings, Terminal, History, Phone,
  ChevronLeft, ChevronRight, X, Menu,
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

function NavLink({ href, label, icon: Icon, collapsed, onClick }: {
  href: string; label: string; icon: React.ElementType; collapsed?: boolean; onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      onClick={onClick}
      {...(isActive ? { "data-glass": "nav" } : {})}
      className={cn(
        "relative flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-sm transition-all overflow-hidden",
        collapsed && "justify-center px-0 py-2",
        isActive
          ? "font-medium text-foreground bg-primary/10"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className={cn("shrink-0", collapsed ? "h-[18px] w-[18px]" : "h-4 w-4")} />
      {!collapsed && <span className="whitespace-nowrap relative z-10">{label}</span>}
    </Link>
  );
}

function GlassLogo() {
  return (
    <div className={cn("flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[8px] relative overflow-hidden", "bg-emerald-50 dark:bg-emerald-500/[0.15] border border-emerald-200 dark:border-emerald-500/[0.25]")}>
      <div className="absolute top-0 left-[15%] w-[70%] h-[50%] bg-[radial-gradient(ellipse_at_top,rgba(134,239,172,0.15),transparent_80%)]" />
      <Shield className="relative z-10 h-3 w-3 text-emerald-600 dark:text-emerald-400" />
    </div>
  );
}

export function DesktopSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) setCollapsed(stored === "true");
  }, []);

  const toggle = () =>
    setCollapsed((prev) => { localStorage.setItem("sidebar-collapsed", String(!prev)); return !prev; });

  return (
    <div className={cn("relative hidden md:flex shrink-0 transition-all duration-300 ease-in-out", collapsed ? "w-[52px]" : "w-52")}>
      <aside
        data-glass="panel"
        className="flex flex-col w-full h-full bg-card border-r overflow-hidden"
      >
        <div className={cn("flex h-12 items-center gap-2 overflow-hidden px-2.5 border-b border-border/50", collapsed && "justify-center px-0")}>
          <GlassLogo />
          {!collapsed && <span className="font-semibold text-sm">CdT Secure</span>}
        </div>

        <nav className="flex flex-col gap-[3px] p-2 flex-1">
          {MAIN_NAV.map((item) => <NavLink key={item.href} {...item} collapsed={collapsed} />)}
          <div className={cn("my-2 border-t border-border/50", collapsed && "mx-1")} />
          {SETTINGS_NAV.map((item) => <NavLink key={item.href} {...item} collapsed={collapsed} />)}
        </nav>

        <div className={cn("flex items-center border-t border-border/50 p-2", collapsed ? "justify-center" : "justify-between px-2.5")}>
          {!collapsed && <span className="text-xs text-muted-foreground">Tema</span>}
          <ThemeToggle />
        </div>
      </aside>

      {/* Collapse button — outside aside so overflow:hidden doesn't clip it */}
      <button
        onClick={toggle}
        aria-label={collapsed ? "Expandir" : "Colapsar"}
        data-glass="btn"
        className="absolute -right-3 top-14 z-20 flex h-6 w-6 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 overflow-hidden"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </div>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <header data-glass="panel-nav" className="md:hidden fixed top-3 left-3 right-3 flex h-14 items-center justify-between px-4 z-40">
        <Link href="/" className="flex items-center gap-2">
          <GlassLogo />
          <span className="font-semibold text-sm">CdT Secure</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button onClick={() => setOpen(true)} data-glass="btn" className="flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95 relative overflow-hidden" aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {open && <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      <div
        data-glass="panel"
        className={cn(
          "md:hidden fixed left-0 top-0 z-50 h-full w-72 shadow-xl",
          "transform transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border/50 px-4">
          <div className="flex items-center gap-2">
            <GlassLogo />
            <span className="font-semibold text-sm">CdT Secure</span>
          </div>
          <button onClick={() => setOpen(false)} data-glass="btn" className="flex h-8 w-8 items-center justify-center rounded-xl transition-all active:scale-95 relative overflow-hidden">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col h-[calc(100%-3.5rem)] overflow-y-auto p-3">
          <nav className="flex flex-col gap-[2px] flex-1">
            {MAIN_NAV.map((item) => <NavLink key={item.href} {...item} onClick={() => setOpen(false)} />)}
            <div className="my-3 border-t border-border/50" />
            <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Ajustes</p>
            {SETTINGS_NAV.map((item) => <NavLink key={item.href} {...item} onClick={() => setOpen(false)} />)}
          </nav>
        </div>
      </div>
    </>
  );
}
