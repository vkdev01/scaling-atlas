import type { Metadata } from "next";

import "./globals.css";
import { ProgressProvider } from "@/components/progress-provider";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { navModules, searchItems } from "@/lib/nav";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — interactive system design`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.author }],
  openGraph: {
    title: `${SITE.name} — interactive system design`,
    description: SITE.description,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-background">
        <ThemeProvider>
          <ProgressProvider>
            <SiteHeader modules={navModules} items={searchItems} />
            <div className="min-h-[calc(100dvh-3.5rem)]">{children}</div>
            <footer className="border-t border-border/60">
              <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-2 px-4 py-5 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p>
                  {SITE.name} — original course notes and diagrams, built with
                  Next.js and shadcn/ui.
                </p>
                <p className="num text-muted-foreground/70">
                  v{SITE.build} · {SITE.builtAt}
                </p>
              </div>
            </footer>
          </ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
