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
        "relative flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-sm transition-all duration-150",
        collapsed && "justify-center px-0",
        isActive
          ? "glass-nav-active dark:text-foreground text-foreground font-medium bg-primary/10 dark:bg-transparent"
          : "text-muted-foreground hover:text-foreground dark:hover:bg-white/[0.04] hover:bg-black/5 rounded-[10px]"
      )}
    >
      <Icon className={cn(
        "h-4 w-4 shrink-0 transition-colors",
        isActive ? "dark:text-[#E2E8F0] text-primary" : "dark:text-[#64748B]"
      )} />
      {!collapsed && (
        <span className={cn(
          "whitespace-nowrap text-xs",
          isActive ? "dark:text-[#E2E8F0]" : "dark:text-[#64748B]"
        )}>
          {label}
        </span>
      )}
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
      "relative hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out",
      /* Light mode: classic bordered sidebar */
      "bg-card border-r",
      /* Dark mode: floating glass panel */
      "dark:glass-panel dark:border-0 dark:rounded-[22px] dark:bg-transparent",
      collapsed ? "w-16 dark:w-[58px]" : "w-52 dark:w-[172px]"
    )}>

      {/* Logo */}
      <div className={cn(
        "flex h-14 items-center gap-2.5 overflow-hidden px-3",
        "border-b dark:border-white/[0.04]",
        collapsed && "justify-center px-0"
      )}>
        {/* Glass icon */}
        <div className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] transition-all",
          "bg-primary/15 dark:border dark:border-emerald-500/25 dark:border-t-emerald-400/40",
          "relative overflow-hidden"
        )}>
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-300/10 to-transparent" />
          <Shield className="relative z-10 h-4 w-4 text-primary" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm whitespace-nowrap dark:text-[#E2E8F0]">
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
        <div className={cn(
          "my-2 border-t dark:border-white/[0.04]",
          collapsed && "mx-1"
        )} />

        {/* Settings label */}
        {!collapsed && (
          <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest dark:text-[#334155] text-muted-foreground/60">
            Ajustes
          </p>
        )}
        {SETTINGS_NAV.map((item) => (
          <NavLink key={item.href} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Theme toggle */}
      <div className={cn(
        "flex items-center border-t dark:border-white/[0.04] p-2",
        collapsed ? "justify-center" : "justify-between px-3"
      )}>
        {!collapsed && (
          <span className="text-xs dark:text-[#334155] text-muted-foreground">Tema</span>
        )}
        <ThemeToggle />
      </div>

      {/* Collapse button */}
      <button
        onClick={toggle}
        aria-label={collapsed ? "Expandir" : "Colapsar"}
        className={cn(
          "absolute -right-3 top-16 z-10 flex h-6 w-6 items-center justify-center rounded-full",
          "border bg-background shadow-sm hover:bg-accent transition-colors",
          "dark:bg-[#020204] dark:border-white/[0.08] dark:hover:bg-white/[0.06]"
        )}
      >
        {collapsed
          ? <ChevronRight className="h-3 w-3 dark:text-[#64748B]" />
          : <ChevronLeft  className="h-3 w-3 dark:text-[#64748B]" />
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
      <header className={cn(
        "md:hidden flex h-14 items-center justify-between px-4 sticky top-0 z-40",
        "border-b bg-card",
        "dark:bg-[rgba(2,2,4,0.85)] dark:backdrop-blur-xl dark:border-white/[0.06]"
      )}>
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-primary/15 dark:border dark:border-emerald-500/25 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-300/10 to-transparent" />
            <Shield className="relative z-10 h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-sm dark:text-[#E2E8F0]">CdT Secure</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent dark:hover:bg-white/[0.05] transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5 dark:text-[#94A3B8]" />
          </button>
        </div>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 dark:bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={cn(
        "md:hidden fixed left-0 top-0 z-50 h-full w-72 shadow-xl",
        "bg-card border-r",
        "dark:bg-[#020204] dark:border-white/[0.07]",
        "transform transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Drawer header */}
        <div className="flex h-14 items-center justify-between border-b dark:border-white/[0.06] px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-primary/15 dark:border dark:border-emerald-500/25 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-300/10 to-transparent" />
              <Shield className="relative z-10 h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-sm dark:text-[#E2E8F0]">CdT Secure</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent dark:hover:bg-white/[0.05] transition-colors"
          >
            <X className="h-4 w-4 dark:text-[#94A3B8]" />
          </button>
        </div>

        {/* Drawer nav */}
        <div className="flex flex-col h-[calc(100%-3.5rem)] overflow-y-auto p-3">
          <nav className="flex flex-col gap-0.5 flex-1">
            {MAIN_NAV.map((item) => (
              <NavLink key={item.href} {...item} onClick={() => setOpen(false)} />
            ))}

            <div className="my-2 border-t dark:border-white/[0.04]" />
            <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest dark:text-[#334155] text-muted-foreground/60">
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
