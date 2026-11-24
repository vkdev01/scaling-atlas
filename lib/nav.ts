import { courseModules, searchIndex } from "@/content";
import type { NavModuleData } from "@/components/course-nav";
import type { SearchItem } from "@/components/search-dialog";

/** Lightweight course tree for the sidebar, the mobile sheet and search. */
export const navModules: NavModuleData[] = courseModules.map((m) => ({
  id: m.id,
  title: m.title,
  blurb: m.blurb,
  icon: m.icon,
  lessons: m.lessons.map((l) => ({
    slug: l.slug,
    title: l.title,
    minutes: l.minutes,
  })),
}));

export const searchItems: SearchItem[] = searchIndex;
