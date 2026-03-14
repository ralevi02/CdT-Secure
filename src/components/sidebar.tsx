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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/",              label: "Dashboard",      icon: LayoutDashboard },
  { href: "/zones",         label: "Zonas",          icon: MapPin },
  { href: "/notifications", label: "Notificaciones", icon: Bell },
  { href: "/config",        label: "Config",         icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Persist collapsed state
  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) setCollapsed(stored === "true");
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      localStorage.setItem("sidebar-collapsed", String(!prev));
      return !prev;
    });
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-card transition-all duration-300 ease-in-out shrink-0",
        collapsed ? "w-16" : "w-52"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-14 items-center border-b px-3 gap-2.5 overflow-hidden",
        collapsed && "justify-center px-0"
      )}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm whitespace-nowrap">
            CdT Secure
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-2 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground",
                collapsed && "justify-center px-0"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: theme toggle */}
      <div className={cn(
        "flex items-center border-t p-2",
        collapsed ? "justify-center" : "justify-between px-3"
      )}>
        {!collapsed && (
          <span className="text-xs text-muted-foreground">Tema</span>
        )}
        <ThemeToggle />
      </div>

      {/* Collapse toggle button */}
      <button
        onClick={toggle}
        aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        className="absolute -right-3 top-16 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  );
}
