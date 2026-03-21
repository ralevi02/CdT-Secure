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
          {/* Background orbs (dark) */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden hidden dark:block">
            <div className="absolute rounded-full" style={{ top: "-5%", left: "15%", width: 700, height: 700, background: "radial-gradient(circle, rgba(56,130,255,0.10), transparent 55%)" }} />
            <div className="absolute rounded-full" style={{ bottom: "-10%", right: "5%", width: 600, height: 600, background: "radial-gradient(circle, rgba(34,197,94,0.08), transparent 55%)" }} />
            <div className="absolute rounded-full" style={{ top: "45%", left: "5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(168,85,247,0.07), transparent 55%)" }} />
            <div className="absolute rounded-full" style={{ top: "20%", right: "15%", width: 400, height: 400, background: "radial-gradient(circle, rgba(236,72,153,0.05), transparent 55%)" }} />
            <div className="absolute rounded-full" style={{ bottom: "20%", left: "40%", width: 350, height: 350, background: "radial-gradient(circle, rgba(14,165,233,0.06), transparent 55%)" }} />
          </div>

          {/* Background orbs (light) */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden dark:hidden">
            <div className="absolute rounded-full" style={{ top: "-5%", left: "15%", width: 700, height: 700, background: "radial-gradient(circle, rgba(56,130,255,0.15), transparent 55%)" }} />
            <div className="absolute rounded-full" style={{ bottom: "-10%", right: "5%", width: 600, height: 600, background: "radial-gradient(circle, rgba(34,197,94,0.12), transparent 55%)" }} />
            <div className="absolute rounded-full" style={{ top: "45%", left: "5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(168,85,247,0.10), transparent 55%)" }} />
            <div className="absolute rounded-full" style={{ top: "20%", right: "15%", width: 400, height: 400, background: "radial-gradient(circle, rgba(236,72,153,0.08), transparent 55%)" }} />
            <div className="absolute rounded-full" style={{ bottom: "20%", left: "40%", width: 350, height: 350, background: "radial-gradient(circle, rgba(14,165,233,0.10), transparent 55%)" }} />
          </div>

          <div className="flex h-screen overflow-hidden flex-col md:flex-row gap-3 p-3">
            <MobileNav />
            <DesktopSidebar />
            <main data-glass="panel" className="flex-1 overflow-y-auto h-full relative">
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
