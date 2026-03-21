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
        "relative flex items-center gap-[10px] rounded-[10px] px-[10px] py-[8px] text-xs transition-all overflow-hidden",
        collapsed && "justify-center px-2",
        isActive
          ? "font-medium text-foreground bg-primary/10"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-[15px] w-[15px] shrink-0" />
      {!collapsed && <span className="whitespace-nowrap relative z-10">{label}</span>}
    </Link>
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
    <aside
      data-glass="panel"
      className={cn(
        "relative hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
        "bg-card border-r",
        collapsed ? "w-16" : "w-52"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-14 items-center gap-2 overflow-hidden px-[10px]",
        "border-b border-border/50",
        collapsed && "justify-center px-0"
      )}>
        <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] relative overflow-hidden
          bg-emerald-50 dark:bg-emerald-500/[0.15]
          border border-emerald-200 dark:border-emerald-500/[0.25]">
          <div className="absolute top-0 left-[15%] w-[70%] h-[50%] bg-[radial-gradient(ellipse_at_top,rgba(134,239,172,0.15),transparent_80%)]" />
          <Shield className="relative z-10 h-[13px] w-[13px] text-emerald-600 dark:text-emerald-400" />
        </div>
        {!collapsed && <span className="font-semibold text-sm">CdT Secure</span>}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-[2px] p-[10px] flex-1">
        {MAIN_NAV.map((item) => <NavLink key={item.href} {...item} collapsed={collapsed} />)}
        <div className={cn("my-3 border-t border-border/50", collapsed && "mx-1")} />
        {SETTINGS_NAV.map((item) => <NavLink key={item.href} {...item} collapsed={collapsed} />)}
      </nav>

      {/* Theme */}
      <div className={cn(
        "flex items-center border-t border-border/50 p-2",
        collapsed ? "justify-center" : "justify-between px-[10px]"
      )}>
        {!collapsed && <span className="text-xs text-muted-foreground">Tema</span>}
        <ThemeToggle />
      </div>

      {/* Collapse */}
      <button
        onClick={toggle}
        aria-label={collapsed ? "Expandir" : "Colapsar"}
        className="absolute -right-3 top-16 z-10 flex h-6 w-6 items-center justify-center rounded-full
          border bg-background shadow-sm hover:bg-accent transition-colors"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <header className="md:hidden flex h-14 items-center justify-between px-4 sticky top-0 z-40
        border-b bg-card dark:bg-[rgba(2,2,4,0.85)] dark:backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[9px]
            bg-emerald-50 dark:bg-emerald-500/[0.15] border border-emerald-200 dark:border-emerald-500/[0.25] relative overflow-hidden">
            <div className="absolute top-0 left-[15%] w-[70%] h-[50%] bg-[radial-gradient(ellipse_at_top,rgba(134,239,172,0.15),transparent)]" />
            <Shield className="relative z-10 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="font-semibold text-sm">CdT Secure</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button onClick={() => setOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-md
            hover:bg-accent transition-colors" aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {open && <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      <div className={cn(
        "md:hidden fixed left-0 top-0 z-50 h-full w-72 shadow-xl bg-card border-r",
        "transform transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[9px]
              bg-emerald-50 dark:bg-emerald-500/[0.15] border border-emerald-200 dark:border-emerald-500/[0.25] relative overflow-hidden">
              <div className="absolute top-0 left-[15%] w-[70%] h-[50%] bg-[radial-gradient(ellipse_at_top,rgba(134,239,172,0.15),transparent)]" />
              <Shield className="relative z-10 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="font-semibold text-sm">CdT Secure</span>
          </div>
          <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent">
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
