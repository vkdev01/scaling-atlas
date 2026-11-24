"use client";

import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";

import { NODE_ICONS } from "@/components/diagram";
import { useProgress } from "@/components/progress-provider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { NavModuleData } from "@/components/course-nav";

export function CourseOverview({ modules }: { modules: NavModuleData[] }) {
  const { isComplete, hydrated, completedCount } = useProgress();
  const total = modules.reduce((n, m) => n + m.lessons.length, 0);
  const pct = total ? Math.round(((hydrated ? completedCount : 0) / total) * 100) : 0;

  return (
    <section className="mx-auto w-full max-w-[1180px] px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">The course</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Six modules, {total} lessons. Each one is a worked example, not a
            glossary.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={pct} className="w-28" />
          <span className="num text-[11.5px] text-muted-foreground">
            {pct}% done
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((mod, i) => {
          const Icon = NODE_ICONS[mod.icon] ?? NODE_ICONS.server;
          const done = hydrated
            ? mod.lessons.filter((l) => isComplete(l.slug)).length
            : 0;

          return (
            <div
              key={mod.id}
              className="group flex flex-col rounded-lg border border-border/70 bg-card/60 p-4 transition hover:border-brand/30 hover:bg-card"
            >
              <div className="flex items-start gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="num text-[10.5px] text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="truncate text-[14px] font-semibold">
                      {mod.title}
                    </h3>
                  </div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
                    {mod.blurb}
                  </p>
                </div>
              </div>

              <ul className="mt-3.5 flex-1 space-y-0.5">
                {mod.lessons.map((lesson) => {
                  const complete = hydrated && isComplete(lesson.slug);
                  return (
                    <li key={lesson.slug}>
                      <Link
                        href={`/learn/${lesson.slug}/`}
                        className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-[12.5px] text-foreground/80 transition hover:bg-muted/60 hover:text-foreground"
                      >
                        <span
                          className={cn(
                            "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border",
                            complete
                              ? "border-ok/60 bg-ok/15 text-ok"
                              : "border-border"
                          )}
                        >
                          {complete ? <Check className="h-2.5 w-2.5" /> : null}
                        </span>
                        <span className="flex-1 truncate">{lesson.title}</span>
                        <span className="num text-[10.5px] text-muted-foreground/70">
                          {lesson.minutes}m
                        </span>
                        <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground/0 transition group-hover:text-muted-foreground" />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-3 flex items-center gap-2 border-t border-border/50 pt-2.5">
                <span className="num text-[10.5px] text-muted-foreground">
                  {done}/{mod.lessons.length}
                </span>
                <Progress
                  value={
                    mod.lessons.length
                      ? Math.round((done / mod.lessons.length) * 100)
                      : 0
                  }
                  className="h-1"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
