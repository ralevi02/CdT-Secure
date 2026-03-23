"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard, MapPin, Bell, Settings, Terminal, History, Phone,
  X, Menu,
} from "lucide-react";
import { CdtLogo } from "@/components/cdt-logo";

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
        "relative flex items-center rounded-[10px] py-2 text-sm overflow-hidden",
        "transition-all duration-300 ease-in-out",
        collapsed ? "justify-center px-2" : "gap-2.5 px-2.5",
        isActive
          ? "font-medium text-foreground bg-primary/10"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span
        className="whitespace-nowrap relative z-10 overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxWidth: collapsed ? 0 : 140, opacity: collapsed ? 0 : 1 }}
      >{label}</span>
    </Link>
  );
}

function GlassLogo() {
  return <CdtLogo className="h-7 w-7 shrink-0" />;
}

export function DesktopSidebar() {
  const [hovered, setHovered] = useState(false);
  const collapsed = !hovered;

  return (
    <div
      className="relative hidden md:flex shrink-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <aside
        data-glass="panel"
        className="flex flex-col h-full bg-card border-r"
      >
        <div className={cn(
          "flex h-12 items-center border-b border-border/50 overflow-hidden transition-all duration-300 ease-in-out",
          collapsed ? "justify-center px-2" : "gap-2 px-2.5"
        )}>
          <GlassLogo />
          <span
            className="font-semibold text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out"
            style={{ maxWidth: collapsed ? 0 : 120, opacity: collapsed ? 0 : 1 }}
          >CdT Secure</span>
        </div>

        <nav className="flex flex-col gap-[3px] p-2 flex-1">
          {MAIN_NAV.map((item) => <NavLink key={item.href} {...item} collapsed={collapsed} />)}
          <div className="my-2 border-t border-border/50" />
          {SETTINGS_NAV.map((item) => <NavLink key={item.href} {...item} collapsed={collapsed} />)}
        </nav>

        <div className={cn(
          "flex items-center border-t border-border/50 py-2 overflow-hidden transition-all duration-300 ease-in-out",
          collapsed ? "justify-center px-2" : "justify-between px-2.5"
        )}>
          <span
            className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out"
            style={{ maxWidth: collapsed ? 0 : 40, opacity: collapsed ? 0 : 1 }}
          >Tema</span>
          <ThemeToggle />
        </div>
      </aside>
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
