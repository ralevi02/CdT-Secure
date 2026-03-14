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
        "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
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
      "relative hidden md:flex flex-col border-r bg-card transition-all duration-300 ease-in-out shrink-0",
      collapsed ? "w-16" : "w-52"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex h-14 items-center border-b px-3 gap-2.5 overflow-hidden",
        collapsed && "justify-center px-0"
      )}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && <span className="font-semibold text-sm whitespace-nowrap">CdT Secure</span>}
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-1 p-2 flex-1">
        {MAIN_NAV.map((item) => (
          <NavLink key={item.href} {...item} collapsed={collapsed} />
        ))}

        {/* Separator */}
        <div className={cn("my-2 border-t", collapsed && "mx-1")} />

        {/* Settings nav */}
        {!collapsed && (
          <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Ajustes
          </p>
        )}
        {SETTINGS_NAV.map((item) => (
          <NavLink key={item.href} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Theme toggle */}
      <div className={cn(
        "flex items-center border-t p-2",
        collapsed ? "justify-center" : "justify-between px-3"
      )}>
        {!collapsed && <span className="text-xs text-muted-foreground">Tema</span>}
        <ThemeToggle />
      </div>

      {/* Collapse button */}
      <button
        onClick={toggle}
        aria-label={collapsed ? "Expandir" : "Colapsar"}
        className="absolute -right-3 top-16 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent transition-colors"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
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
      <header className="md:hidden flex h-14 items-center justify-between border-b bg-card px-4 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">CdT Secure</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button onClick={() => setOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent transition-colors" aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {open && <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      <div className={cn(
        "md:hidden fixed left-0 top-0 z-50 h-full w-72 bg-card border-r shadow-xl",
        "transform transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">CdT Secure</span>
          </div>
          <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-3.5rem)] overflow-y-auto p-3">
          <nav className="flex flex-col gap-1 flex-1">
            {MAIN_NAV.map((item) => (
              <NavLink key={item.href} {...item} onClick={() => setOpen(false)} />
            ))}

            <div className="my-2 border-t" />
            <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Ajustes</p>

            {SETTINGS_NAV.map((item) => (
              <NavLink key={item.href} {...item} onClick={() => setOpen(false)} />
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
