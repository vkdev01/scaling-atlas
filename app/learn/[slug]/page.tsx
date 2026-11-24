import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CourseNav } from "@/components/course-nav";
import { LessonView } from "@/components/lesson-view";
import { getLesson, getModule, lessons, neighbours } from "@/content";
import { navModules } from "@/lib/nav";

export function generateStaticParams() {
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return { title: "Lesson not found" };
  return {
    title: lesson.title,
    description: lesson.summary,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  const mod = getModule(lesson.moduleId);
  const { prev, next } = neighbours(slug);

  return (
    <div className="mx-auto flex w-full max-w-[1500px]">
      <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-[288px] shrink-0 border-r border-border/60 lg:block">
        <CourseNav modules={navModules} currentSlug={slug} />
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <LessonView
          lesson={lesson}
          moduleTitle={mod?.title ?? "Course"}
          prev={prev ? { slug: prev.slug, title: prev.title } : null}
          next={next ? { slug: next.slug, title: next.title } : null}
        />
      </main>
    </div>
  );
}
