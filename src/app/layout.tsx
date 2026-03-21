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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>

          {/* ── Background orbs (dark mode only) ── */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden dark:block hidden">
            <div className="orb-blue"  style={{ top: "5%",  left: "28%" }} />
            <div className="orb-green" style={{ bottom: "0", right: "8%" }} />
            <div className="orb-purple" style={{ top: "62%", left: "14%" }} />
          </div>

          {/* ── App shell ─────────────────────────── */}
          <div className="flex h-screen overflow-hidden
            flex-col md:flex-row
            dark:gap-3 dark:p-3">

            <MobileNav />
            <DesktopSidebar />

            {/* Main content panel */}
            <main className="flex-1 overflow-y-auto h-full
              dark:glass-panel dark:rounded-[22px]
              md:rounded-none md:border-none">
              <div className="mx-auto max-w-2xl px-4 py-6">
                {children}
              </div>
            </main>

          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
