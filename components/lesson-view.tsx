"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Clock,
  Lightbulb,
  Pause,
  Play,
} from "lucide-react";

import { Diagram } from "@/components/diagram";
import { useProgress } from "@/components/progress-provider";
import { Rich } from "@/components/rich-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Lesson, Metric } from "@/content/types";

type Neighbour = { slug: string; title: string } | null;

function metricTone(tone: Metric["tone"]) {
  switch (tone) {
    case "ok":
      return "text-ok";
    case "warn":
      return "text-warn";
    case "bad":
      return "text-bad";
    case "muted":
      return "text-foreground/80";
    default:
      return "text-foreground";
  }
}

export function LessonView({
  lesson,
  moduleTitle,
  prev,
  next,
}: {
  lesson: Lesson;
  moduleTitle: string;
  prev: Neighbour;
  next: Neighbour;
}) {
  const { hydrated, getStep, setStep, markComplete, isComplete } = useProgress();
  const [index, setIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);

  // restore position from the URL (?step=N) or from local progress
  React.useEffect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams(window.location.search);
    const fromQuery = Number(params.get("step"));
    const stored = getStep(lesson.slug);
    const candidate =
      Number.isFinite(fromQuery) &&
      fromQuery >= 1 &&
      fromQuery <= lesson.steps.length
        ? fromQuery - 1
        : stored;
    setIndex(Math.min(Math.max(candidate, 0), lesson.steps.length - 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, lesson.slug, lesson.steps.length]);

  const go = React.useCallback(
    (i: number) => {
      const n = Math.min(Math.max(i, 0), lesson.steps.length - 1);
      setIndex(n);
      setStep(lesson.slug, n);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("step", String(n + 1));
        window.history.replaceState(null, "", url);
      }
    },
    [lesson.slug, lesson.steps.length, setStep]
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || t?.isContentEditable) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(index + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(index - 1);
      } else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  const step = lesson.steps[index];
  const isLast = index === lesson.steps.length - 1;
  const complete = hydrated && isComplete(lesson.slug);

  return (
    <>
      <div className="mx-auto w-full max-w-[1120px]">
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <Link
            href="/"
            className="text-muted-foreground transition hover:text-foreground"
          >
            {moduleTitle}
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="num text-muted-foreground">
            {String(index + 1).padStart(2, "0")} of {lesson.steps.length}
          </span>
          <Badge variant="outline" className="ml-auto gap-1">
            <Clock className="h-3 w-3" />
            {lesson.minutes} min
          </Badge>
        </div>

        <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-tight sm:text-[30px]">
          {lesson.title}
        </h1>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-6 text-muted-foreground">
          {lesson.summary}
        </p>

        {/* step rail */}
        <div className="scroll-thin -mx-1 mb-6 mt-5 flex gap-1.5 overflow-x-auto px-1 pb-1.5 lg:flex-wrap lg:overflow-visible">
          {lesson.steps.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => go(i)}
              aria-current={i === index ? "step" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] transition",
                i === index
                  ? "border-brand/60 bg-brand/10 text-foreground"
                  : i < index
                    ? "border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground"
                    : "border-border/50 text-muted-foreground/70 hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "num flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px]",
                  i === index
                    ? "bg-brand text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {i + 1}
              </span>
              <span className="whitespace-nowrap">{s.title}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_minmax(0,540px)] xl:gap-9">
          {/* prose */}
          <div key={index} className="order-2 min-w-0 animate-fade-up xl:order-1">
            <div className="lesson-prose space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">
                {step.title}
              </h2>
              {step.body.map((paragraph, i) => (
                <p key={i}>
                  <Rich text={paragraph} />
                </p>
              ))}

              {step.keyIdea ? (
                <div className="rounded-lg border border-brand/25 bg-brand/[0.07] p-3.5">
                  <div className="flex gap-2.5">
                    <Lightbulb className="mt-1 h-3.5 w-3.5 shrink-0 text-brand" />
                    <div>
                      <div className="eyebrow text-brand">Key idea</div>
                      <p className="mt-1 text-[13.5px] leading-6 text-foreground/90">
                        <Rich text={step.keyIdea} />
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {step.points && step.points.length > 0 ? (
                <ul className="space-y-1.5 pt-1">
                  {step.points.map((point, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-[13.5px] leading-6 text-foreground/80"
                    >
                      <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-signal" />
                      <span>
                        <Rich text={point} />
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => go(index - 1)}
                disabled={index === 0}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Previous
              </Button>

              {isLast ? (
                next ? (
                  <Button size="sm" asChild>
                    <Link href={`/learn/${next.slug}/`}>
                      Next lesson
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="sm" asChild>
                    <Link href="/">
                      Back to the course
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )
              ) : (
                <Button size="sm" onClick={() => go(index + 1)}>
                  Next step
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                aria-pressed={complete}
                onClick={() => markComplete(lesson.slug, !complete)}
              >
                {complete ? (
                  <>
                    <CircleCheck className="h-3.5 w-3.5 text-ok" />
                    Completed
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Mark complete
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* diagram */}
          <div className="order-1 min-w-0 xl:order-2">
            <div className="xl:sticky xl:top-[4.5rem]">
              <div className="overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
                  <span className="eyebrow">Live diagram</span>
                  <button
                    type="button"
                    onClick={() => setPlaying((p) => !p)}
                    className="flex items-center gap-1.5 rounded text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground transition hover:text-foreground"
                  >
                    {playing ? (
                      <>
                        <Pause className="h-3 w-3" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3" /> Play
                      </>
                    )}
                  </button>
                </div>

                <div className="grid-surface px-1.5 py-1.5">
                  <Diagram lesson={lesson} step={step} playing={playing} />
                </div>

                {step.metrics && step.metrics.length > 0 ? (
                  <div className="grid grid-cols-2 gap-px border-t border-border/60 bg-border/40 sm:grid-cols-3">
                    {step.metrics.map((metric) => (
                      <div key={metric.label} className="bg-card px-3 py-2.5">
                        <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                          {metric.label}
                        </div>
                        <div
                          className={cn(
                            "num mt-0.5 text-[12.5px] font-semibold",
                            metricTone(metric.tone)
                          )}
                        >
                          {metric.value}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {step.note ? (
                  <p className="border-t border-border/60 px-3 py-2 text-[10.5px] leading-relaxed text-muted-foreground">
                    {step.note}
                  </p>
                ) : null}
              </div>

              <p className="mt-2 hidden px-1 text-[10.5px] text-muted-foreground xl:block">
                ← → to move between steps · space to pause
              </p>
            </div>
          </div>
        </div>

        {/* prev / next lesson */}
        <div className="mt-10 grid gap-3 border-t border-border/60 pt-5 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/learn/${prev.slug}/`}
              className="group rounded-lg border border-border/70 px-3.5 py-3 transition hover:border-brand/40 hover:bg-muted/40"
            >
              <span className="eyebrow">Previous lesson</span>
              <span className="mt-1 flex items-center gap-1.5 text-[13px] font-medium">
                <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground transition group-hover:-translate-x-0.5" />
                {prev.title}
              </span>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}
          {next ? (
            <Link
              href={`/learn/${next.slug}/`}
              className="group rounded-lg border border-border/70 px-3.5 py-3 text-right transition hover:border-brand/40 hover:bg-muted/40"
            >
              <span className="eyebrow">Next lesson</span>
              <span className="mt-1 flex items-center justify-end gap-1.5 text-[13px] font-medium">
                {next.title}
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ) : null}
        </div>
      </div>
    </>
  );
}
