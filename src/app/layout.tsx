import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { DesktopSidebar, MobileNav } from "@/components/sidebar";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CdT Secure – Sistema de Alarma IoT",
  description: "Panel de control para sistema de alarma residencial IoT",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geist.className} min-h-screen bg-background antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* ── Background orbs (dark mode only) ─────────── */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
            <div className="orb-animate absolute top-[5%] left-[20%] w-[520px] h-[520px] rounded-full dark:opacity-100 opacity-0"
              style={{ background: "radial-gradient(circle, rgba(100,160,255,0.05), transparent 55%)" }} />
            <div className="orb-animate-slow absolute bottom-[5%] right-[10%] w-[420px] h-[420px] rounded-full dark:opacity-100 opacity-0"
              style={{ background: "radial-gradient(circle, rgba(34,197,94,0.04), transparent 55%)" }} />
            <div className="orb-animate absolute top-[55%] left-[10%] w-[280px] h-[280px] rounded-full dark:opacity-100 opacity-0"
              style={{ background: "radial-gradient(circle, rgba(180,130,255,0.03), transparent 55%)" }} />
            {/* Light mode orbs */}
            <div className="absolute top-[10%] right-[15%] w-[400px] h-[400px] rounded-full dark:opacity-0 opacity-100"
              style={{ background: "radial-gradient(circle, rgba(22,163,74,0.06), transparent 55%)" }} />
            <div className="absolute bottom-[20%] left-[5%] w-[350px] h-[350px] rounded-full dark:opacity-0 opacity-100"
              style={{ background: "radial-gradient(circle, rgba(59,130,246,0.05), transparent 55%)" }} />
          </div>

          {/* ── Mobile layout: stacked ──────────────────── */}
          <div className="flex h-screen flex-col md:hidden overflow-hidden">
            <MobileNav />
            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-2xl px-4 py-6">
                {children}
              </div>
            </main>
          </div>

          {/* ── Desktop layout: floating panels ────────── */}
          <div className="hidden md:flex h-screen gap-3 p-3 overflow-hidden">
            <DesktopSidebar />
            {/* Main content glass panel */}
            <div className="glass glass-shine rounded-[22px] flex-1 overflow-hidden flex flex-col">
              <div className="overflow-y-auto flex-1">
                <div className="mx-auto max-w-2xl px-6 py-6">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
