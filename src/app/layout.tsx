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
            <div className="absolute rounded-full" style={{ top: "5%", left: "25%", width: 500, height: 500, background: "radial-gradient(circle, rgba(100,160,255,0.04), transparent 50%)" }} />
            <div className="absolute rounded-full" style={{ bottom: 0, right: "10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(34,197,94,0.03), transparent 50%)" }} />
            <div className="absolute rounded-full" style={{ top: "60%", left: "15%", width: 250, height: 250, background: "radial-gradient(circle, rgba(180,130,255,0.025), transparent 50%)" }} />
          </div>

          {/* Background orbs (light) */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden dark:hidden">
            <div className="absolute rounded-full" style={{ top: "5%", left: "25%", width: 500, height: 500, background: "radial-gradient(circle, rgba(100,160,255,0.08), transparent 50%)" }} />
            <div className="absolute rounded-full" style={{ bottom: 0, right: "10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(34,197,94,0.06), transparent 50%)" }} />
            <div className="absolute rounded-full" style={{ top: "60%", left: "15%", width: 250, height: 250, background: "radial-gradient(circle, rgba(180,130,255,0.05), transparent 50%)" }} />
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
