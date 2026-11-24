import Link from "next/link";
import { ArrowRight, MousePointerClick, Route, Timer } from "lucide-react";

import { CourseOverview } from "@/components/course-overview";
import { HeroPreview } from "@/components/hero-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLesson, stats } from "@/content";
import { navModules } from "@/lib/nav";

const HOW = [
  {
    icon: MousePointerClick,
    title: "Step through it",
    body: "Every lesson is a sequence of short steps. Read one, then look up at the diagram and find the arrow it just described.",
  },
  {
    icon: Route,
    title: "Watch the path light up",
    body: "The active connection is highlighted and a packet travels along it, so you can see which hop costs what.",
  },
  {
    icon: Timer,
    title: "Keep your place",
    body: "Progress and the last step you read are stored in this browser. Close the tab, come back, carry on.",
  },
];

export default function HomePage() {
  const first = getLesson("request-lifecycle");

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="grid-surface pointer-events-none absolute inset-0 opacity-30" />
        <div className="pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-brand/20 blur-[130px]" />
        <div className="pointer-events-none absolute -right-32 top-10 h-[22rem] w-[22rem] rounded-full bg-signal/10 blur-[120px]" />

        <div className="relative mx-auto grid w-full max-w-[1180px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:py-16">
          <div>
            <Badge variant="brand" className="mb-4">
              Interactive system design
            </Badge>
            <h1 className="text-balance text-[34px] font-semibold leading-[1.08] tracking-tight sm:text-[46px]">
              See where the time
              <br className="hidden sm:block" /> actually goes.
            </h1>
            <p className="mt-4 max-w-xl text-[14.5px] leading-7 text-muted-foreground">
              A request is a chain of conversations between machines, and every
              one of them costs something. {stats.lessons} animated lessons on
              latency, caching, replication and the systems you get when you put
              them together.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button asChild size="lg">
                <Link href="/learn/request-lifecycle/">
                  Start with lesson one
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#course">Browse the course</Link>
              </Button>
            </div>

            <dl className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-border/60 pt-5">
              {[
                { k: "Lessons", v: stats.lessons },
                { k: "Modules", v: stats.modules },
                { k: "Steps", v: stats.steps },
              ].map((item) => (
                <div key={item.k}>
                  <dt className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {item.k}
                  </dt>
                  <dd className="num mt-1 text-[20px] font-semibold leading-none">
                    {item.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {first ? <HeroPreview lesson={first} stepIndex={4} /> : null}
        </div>
      </section>

      <div id="course">
        <CourseOverview modules={navModules} />
      </div>

      <section className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-12 sm:px-6">
          <h2 className="text-xl font-semibold tracking-tight">How to use it</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {HOW.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-border/70 bg-card/60 p-4"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-signal/10 text-signal">
                  <item.icon className="h-3.5 w-3.5" />
                </span>
                <h3 className="mt-3 text-[13.5px] font-semibold">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-6 max-w-3xl text-[11.5px] leading-relaxed text-muted-foreground">
            A note on the numbers: latencies, sizes and throughput figures in
            these lessons are teaching models, chosen to make a relationship
            visible. They are not measurements of any production system. Before
            you size anything for real, measure your own workload.
          </p>
        </div>
      </section>
    </>
  );
}
