import { modules } from "./modules";
import { foundationsLessons } from "./foundations";
import { scalingLessons } from "./scaling";
import { dataLessons } from "./data";
import { communicationLessons } from "./communication";
import { reliabilityLessons } from "./reliability";
import { systemsLessons } from "./systems";
import type { Lesson, Module } from "./types";

export const lessons: Lesson[] = [
  ...foundationsLessons,
  ...scalingLessons,
  ...dataLessons,
  ...communicationLessons,
  ...reliabilityLessons,
  ...systemsLessons,
];

export type ModuleWithLessons = Module & { lessons: Lesson[] };

export const courseModules: ModuleWithLessons[] = modules
  .map((m) => ({ ...m, lessons: lessons.filter((l) => l.moduleId === m.id) }))
  .filter((m) => m.lessons.length > 0);

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}

export function getModule(id: string): ModuleWithLessons | undefined {
  return courseModules.find((m) => m.id === id);
}

export function lessonIndex(slug: string): number {
  return lessons.findIndex((l) => l.slug === slug);
}

export function neighbours(slug: string): {
  prev: Lesson | null;
  next: Lesson | null;
} {
  const i = lessonIndex(slug);
  return {
    prev: i > 0 ? lessons[i - 1] : null,
    next: i >= 0 && i < lessons.length - 1 ? lessons[i + 1] : null,
  };
}

export function moduleOf(slug: string): ModuleWithLessons | undefined {
  const lesson = getLesson(slug);
  return lesson ? getModule(lesson.moduleId) : undefined;
}

/** flat list for the search dialog */
export const searchIndex = lessons.flatMap((lesson) => {
  const mod = modules.find((m) => m.id === lesson.moduleId);
  return [
    {
      slug: lesson.slug,
      step: 0,
      kind: "lesson" as const,
      module: mod?.title ?? "",
      title: lesson.title,
      detail: lesson.summary,
    },
    ...lesson.steps.map((step, i) => ({
      slug: lesson.slug,
      step: i,
      kind: "step" as const,
      module: mod?.title ?? "",
      title: step.title,
      detail: step.keyIdea ?? step.body[0] ?? "",
    })),
  ];
});

export const stats = {
  lessons: lessons.length,
  modules: courseModules.length,
  steps: lessons.reduce((n, l) => n + l.steps.length, 0),
  minutes: lessons.reduce((n, l) => n + l.minutes, 0),
};

export type { Lesson, Module };
