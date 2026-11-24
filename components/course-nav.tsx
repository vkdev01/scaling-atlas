"use client";

import * as React from "react";
import Link from "next/link";
import { Check, ChevronDown, Clock } from "lucide-react";

import { NODE_ICONS } from "@/components/diagram";
import { useProgress } from "@/components/progress-provider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { IconKey } from "@/content/types";

export type NavLesson = {
  slug: string;
  title: string;
  minutes: number;
};

export type NavModuleData = {
  id: string;
  title: string;
  blurb: string;
  icon: IconKey;
  lessons: NavLesson[];
};

export function CourseNav({
  modules,
  currentSlug,
  onNavigate,
}: {
  modules: NavModuleData[];
  currentSlug?: string;
  onNavigate?: () => void;
}) {
  const { isComplete, hydrated, completedCount } = useProgress();

  const total = modules.reduce((n, m) => n + m.lessons.length, 0);
  const done = hydrated ? completedCount : 0;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const currentModule = modules.find((m) =>
    m.lessons.some((l) => l.slug === currentSlug)
  );

  const [open, setOpen] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const m of modules) {
      initial[m.id] = currentModule ? m.id === currentModule.id : m.id === modules[0]?.id;
    }
    return initial;
  });

  const toggle = (id: string) =>
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/60 px-4 py-4">
        <div className="flex items-baseline justify-between">
          <span className="eyebrow">Your progress</span>
          <span className="num text-xs text-muted-foreground">
            {done}/{total}
          </span>
        </div>
        <Progress value={pct} className="mt-2.5" />
        <p className="mt-2 text-[11.5px] text-muted-foreground">
          {pct === 100
            ? "Every lesson done. Go break something."
            : `${pct}% complete · saved in this browser`}
        </p>
      </div>

      <nav className="scroll-thin flex-1 overflow-y-auto px-2 py-3">
        {modules.map((mod) => {
          const Icon = NODE_ICONS[mod.icon] ?? NODE_ICONS.server;
          const isOpen = open[mod.id] ?? false;
          const modDone = hydrated
            ? mod.lessons.filter((l) => isComplete(l.slug)).length
            : 0;

          return (
            <div key={mod.id} className="mb-1">
              <button
                type="button"
                onClick={() => toggle(mod.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition hover:bg-muted/60"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-[13px] font-medium">
                  {mod.title}
                </span>
                <span className="num text-[10.5px] text-muted-foreground">
                  {modDone}/{mod.lessons.length}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              {isOpen ? (
                <ul className="mb-1 ml-[19px] border-l border-border/60 pl-2">
                  {mod.lessons.map((lesson) => {
                    const active = lesson.slug === currentSlug;
                    const complete = hydrated && isComplete(lesson.slug);
                    return (
                      <li key={lesson.slug}>
                        <Link
                          href={`/learn/${lesson.slug}/`}
                          onClick={onNavigate}
                          className={cn(
                            "group flex items-start gap-2 rounded-md px-2 py-1.5 text-[12.5px] leading-snug transition",
                            active
                              ? "bg-brand/10 text-foreground"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          )}
                        >
                          <span
                            className={cn(
                              "mt-[3px] flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border",
                              complete
                                ? "border-ok/60 bg-ok/15 text-ok"
                                : active
                                  ? "border-brand/60 bg-brand/15"
                                  : "border-border"
                            )}
                          >
                            {complete ? <Check className="h-2.5 w-2.5" /> : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block">{lesson.title}</span>
                            <span className="num mt-0.5 flex items-center gap-1 text-[10.5px] text-muted-foreground/80">
                              <Clock className="h-2.5 w-2.5" />
                              {lesson.minutes} min
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border/60 px-4 py-3">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Progress lives in this browser only. No account, no tracking.
        </p>
      </div>
    </div>
  );
}
