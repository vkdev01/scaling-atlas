"use client";

import * as React from "react";
import { Diagram } from "@/components/diagram";
import type { Lesson } from "@/content/types";

export function HeroPreview({
  lesson,
  stepIndex = 4,
}: {
  lesson: Lesson;
  stepIndex?: number;
}) {
  const [playing, setPlaying] = React.useState(true);
  const step = lesson.steps[Math.min(stepIndex, lesson.steps.length - 1)];

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card/70 shadow-xl shadow-black/5 backdrop-blur">
      <div className="flex items-center gap-2 border-b border-border/60 px-3.5 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-bad/60" />
          <span className="h-2 w-2 rounded-full bg-warn/60" />
          <span className="h-2 w-2 rounded-full bg-ok/60" />
        </span>
        <span className="num ml-1 truncate text-[11px] text-muted-foreground">
          {lesson.title} — step {stepIndex + 1}
        </span>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="ml-auto text-[10px] uppercase tracking-[0.12em] text-muted-foreground transition hover:text-foreground"
        >
          {playing ? "Pause" : "Play"}
        </button>
      </div>
      <div className="grid-surface px-2 py-2">
        <Diagram lesson={lesson} step={step} playing={playing} />
      </div>
    </div>
  );
}
