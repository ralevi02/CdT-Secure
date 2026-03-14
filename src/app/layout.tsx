import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Shield } from "lucide-react";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CdT Secure – Sistema de Alarma IoT",
  description: "Panel de control para sistema de alarma residencial IoT",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geist.className} min-h-screen bg-background antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
                <Link href="/" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <Shield className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="font-semibold text-sm">CdT Secure</span>
                </Link>
                <nav className="flex items-center gap-1">
                  <Link
                    href="/"
                    className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/config"
                    className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    Config
                  </Link>
                  <ThemeToggle />
                </nav>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1">
              <div className="mx-auto max-w-2xl px-4 py-6">
                {children}
              </div>
            </main>

            {/* Footer */}
            <footer className="border-t py-4">
              <div className="mx-auto max-w-2xl px-4">
                <p className="text-center text-xs text-muted-foreground">
                  CdT Secure · Sistema IoT Serverless
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
