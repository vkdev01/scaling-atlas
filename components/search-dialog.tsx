"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { DialogTitle } from "@/components/ui/dialog";

export type SearchItem = {
  slug: string;
  step: number;
  kind: "lesson" | "step";
  module: string;
  title: string;
  detail: string;
};

export function SearchDialog({
  items,
  open,
  onOpenChange,
}: {
  items: SearchItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  const grouped = React.useMemo(() => {
    const map = new Map<string, SearchItem[]>();
    for (const item of items) {
      const list = map.get(item.module) ?? [];
      list.push(item);
      map.set(item.module, list);
    }
    return [...map.entries()];
  }, [items]);

  const go = (item: SearchItem) => {
    onOpenChange(false);
    router.push(`/learn/${item.slug}/?step=${item.step + 1}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Search the course</DialogTitle>
      <CommandInput placeholder="Search lessons and steps…" />
      <CommandList>
        <CommandEmpty>Nothing matched. Try “cache”, “shard” or “latency”.</CommandEmpty>
        {grouped.map(([moduleTitle, moduleItems]) => (
          <CommandGroup key={moduleTitle} heading={moduleTitle}>
            {moduleItems.map((item) => (
              <CommandItem
                key={`${item.slug}-${item.step}-${item.kind}`}
                value={`${item.title} ${item.detail} ${moduleTitle}`}
                onSelect={() => go(item)}
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[13.5px] font-medium">
                    {item.title}
                  </span>
                  <span className="truncate text-[11.5px] text-muted-foreground">
                    {item.kind === "lesson"
                      ? `Lesson · ${item.detail}`
                      : `Step ${item.step + 1} · ${item.detail}`}
                  </span>
                </span>
                <CommandShortcut>
                  <CornerDownLeft className="h-3 w-3" />
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
