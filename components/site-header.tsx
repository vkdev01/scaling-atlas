"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Menu, Search } from "lucide-react";

import { CourseNav, type NavModuleData } from "@/components/course-nav";
import { SearchDialog, type SearchItem } from "@/components/search-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { SITE } from "@/lib/site";

export function SiteHeader({
  modules,
  items,
}: {
  modules: NavModuleData[];
  items: SearchItem[];
}) {
  const pathname = usePathname() ?? "/";
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const currentSlug = React.useMemo(() => {
    const match = pathname.match(/\/learn\/([^/]+)/);
    return match?.[1];
  }, [pathname]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "/" ) {
        const t = e.target as HTMLElement | null;
        const tag = t?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || t?.isContentEditable) return;
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center gap-2 px-3 sm:px-5">
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          aria-label="Open the course menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>

        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-signal text-[11px] font-bold text-white shadow-sm">
            SA
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[13.5px] font-semibold tracking-tight">
              {SITE.name}
            </span>
            <span className="mt-0.5 hidden text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:block">
              Interactive system design
            </span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="mr-1 hidden h-8 items-center gap-2 rounded-md border border-border/70 bg-card/60 px-2.5 text-[12px] text-muted-foreground transition hover:border-border hover:text-foreground sm:flex"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
            <kbd className="num ml-1 rounded border border-border/70 bg-muted px-1 py-0.5 text-[10px]">
              ⌘K
            </kbd>
          </button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="sm:hidden"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
          </Button>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon-sm"
            asChild
            aria-label="Source on GitHub"
          >
            <a href={SITE.repoUrl} target="_blank" rel="noreferrer">
              <Github className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="p-0">
          <SheetTitle className="sr-only">Course contents</SheetTitle>
          <SheetDescription className="sr-only">
            Choose a lesson from the course
          </SheetDescription>
          <CourseNav
            modules={modules}
            currentSlug={currentSlug}
            onNavigate={() => setMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <SearchDialog
        items={items}
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />
    </header>
  );
}
