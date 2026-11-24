"use client";

import * as React from "react";

const STORAGE_KEY = "scaling-atlas.progress.v1";

type Stored = {
  completed: string[];
  steps: Record<string, number>;
};

type ProgressContextValue = {
  hydrated: boolean;
  completed: Set<string>;
  completedCount: number;
  isComplete: (slug: string) => boolean;
  markComplete: (slug: string, value?: boolean) => void;
  getStep: (slug: string) => number;
  setStep: (slug: string, index: number) => void;
  reset: () => void;
};

const ProgressContext = React.createContext<ProgressContextValue | null>(null);

function readStorage(): Stored {
  if (typeof window === "undefined") return { completed: [], steps: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: [], steps: {} };
    const parsed = JSON.parse(raw) as Partial<Stored>;
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      steps: typeof parsed.steps === "object" && parsed.steps ? parsed.steps : {},
    };
  } catch {
    return { completed: [], steps: {} };
  }
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<Stored>({ completed: [], steps: {} });
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setState(readStorage());
    setHydrated(true);
  }, []);

  const persist = React.useCallback((next: Stored) => {
    setState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage full or blocked — progress is a convenience, not a requirement */
    }
  }, []);

  const completed = React.useMemo(
    () => new Set(state.completed),
    [state.completed]
  );

  const markComplete = React.useCallback(
    (slug: string, value = true) => {
      const has = state.completed.includes(slug);
      if (value === has) return;
      persist({
        ...state,
        completed: value
          ? [...state.completed, slug]
          : state.completed.filter((s) => s !== slug),
      });
    },
    [state, persist]
  );

  const setStep = React.useCallback(
    (slug: string, index: number) => {
      if (state.steps[slug] === index) return;
      persist({ ...state, steps: { ...state.steps, [slug]: index } });
    },
    [state, persist]
  );

  const reset = React.useCallback(() => {
    persist({ completed: [], steps: {} });
  }, [persist]);

  const value = React.useMemo<ProgressContextValue>(
    () => ({
      hydrated,
      completed,
      completedCount: state.completed.length,
      isComplete: (slug: string) => completed.has(slug),
      markComplete,
      getStep: (slug: string) => state.steps[slug] ?? 0,
      setStep,
      reset,
    }),
    [hydrated, completed, state.completed.length, markComplete, state.steps, setStep, reset]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = React.useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used inside ProgressProvider");
  }
  return ctx;
}
