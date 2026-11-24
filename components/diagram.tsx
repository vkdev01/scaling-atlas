"use client";

import * as React from "react";
import {
  Activity,
  ArrowLeftRight,
  Boxes,
  Clock,
  Cloud,
  Copy,
  Cpu,
  Database,
  FileText,
  Gauge,
  GitBranch,
  Globe,
  Hash,
  ListOrdered,
  Lock,
  Monitor,
  Network,
  Pause,
  Play,
  Search,
  Server,
  User,
  Zap,
} from "lucide-react";

import type { DiagramNode, Lane, Lesson, Step } from "@/content/types";
import { cn } from "@/lib/utils";

const VW = 1000;
const VH = 600;

const LANES: { lane: Lane; x0: number; x1: number; label: string }[] = [
  { lane: "client", x0: 0, x1: 240, label: "Client" },
  { lane: "edge", x0: 240, x1: 510, label: "Edge" },
  { lane: "service", x0: 510, x1: 770, label: "Service" },
  { lane: "data", x0: 770, x1: 1000, label: "Data" },
];

export const NODE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  browser: Monitor,
  user: User,
  globe: Globe,
  dns: Network,
  lock: Lock,
  server: Server,
  lb: ArrowLeftRight,
  cache: Zap,
  db: Database,
  replica: Copy,
  queue: ListOrdered,
  worker: Cpu,
  cdn: Cloud,
  gauge: Gauge,
  clock: Clock,
  id: Hash,
  file: FileText,
  monitor: Activity,
  api: Boxes,
  router: GitBranch,
  search: Search,
};

function size(node: DiagramNode) {
  return { w: node.w ?? 200, h: node.h ?? 84 };
}

function edgePath(a: DiagramNode, b: DiagramNode, curve = 0) {
  const A = size(a);
  const B = size(b);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const horizontal = Math.abs(dx) >= Math.abs(dy);

  const padA = (horizontal ? A.w / 2 : A.h / 2) + 13;
  const padB = (horizontal ? B.w / 2 : B.h / 2) + 13;

  const sx = a.x + ux * padA;
  const sy = a.y + uy * padA;
  const ex = b.x - ux * padB;
  const ey = b.y - uy * padB;

  const cx = horizontal ? (sx + ex) / 2 : (sx + ex) / 2 + curve;
  const cy = horizontal ? (sy + ey) / 2 + curve : (sy + ey) / 2;

  return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
}

function toneBorder(node: DiagramNode) {
  switch (node.tone) {
    case "ok":
      return "border-ok/50";
    case "bad":
      return "border-bad/50";
    case "warn":
      return "border-warn/50";
    case "brand":
      return "border-brand/50";
    default:
      return "border-border/80";
  }
}

function NodeBox({ node, active }: { node: DiagramNode; active: boolean }) {
  const Icon = NODE_ICONS[node.icon ?? "server"] ?? Server;
  const { w, h } = size(node);

  return (
    <foreignObject
      x={node.x - w / 2}
      y={node.y - h / 2}
      width={w}
      height={h}
      className="overflow-visible"
    >
      <div
        className={cn(
          "flex h-full w-full items-center gap-2.5 rounded-2xl border bg-card px-3 transition-all duration-300",
          active
            ? "border-brand opacity-100 shadow-[0_0_0_4px_hsl(var(--brand)/0.14)]"
            : cn(toneBorder(node), "opacity-45")
        )}
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
            active ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[16px] font-semibold leading-tight text-foreground">
            {node.label}
          </span>
          {node.sub ? (
            <span className="mt-1 block truncate text-[12px] leading-tight text-muted-foreground">
              {node.sub}
            </span>
          ) : null}
        </span>
      </div>
    </foreignObject>
  );
}

export function Diagram({
  lesson,
  step,
  playing = true,
  onTogglePlay,
  className,
}: {
  lesson: Lesson;
  step: Step;
  playing?: boolean;
  onTogglePlay?: () => void;
  className?: string;
}) {
  const rawId = React.useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, "");

  const byId = React.useMemo(() => {
    const map: Record<string, DiagramNode> = {};
    for (const n of lesson.nodes) map[n.id] = n;
    return map;
  }, [lesson.nodes]);

  const activeNodes = React.useMemo(
    () => new Set(step.active ?? []),
    [step.active]
  );
  const activeEdges = React.useMemo(
    () => new Set((step.edges ?? []).map(([a, b]) => `${a}->${b}`)),
    [step.edges]
  );

  const laneLabel = (lane: Lane, fallback: string) =>
    lesson.lanes?.[lane] ?? fallback;

  return (
    <div className={cn("relative", className)}>
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
        {onTogglePlay ? (
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={playing ? "Pause the animation" : "Play the animation"}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border/70 bg-card/80 text-muted-foreground transition hover:text-foreground"
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
        ) : null}
      </div>

      <div className="scroll-thin overflow-x-auto">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="h-auto w-full min-w-[560px] select-none sm:min-w-0"
        role="img"
        aria-label={`Diagram for step: ${step.title}`}
      >
        <defs>
          <marker
            id={`arrow-${uid}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--border))" />
          </marker>
          <marker
            id={`arrow-active-${uid}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--signal))" />
          </marker>
        </defs>

        {/* lane bands */}
        {LANES.map((band, i) => (
          <g key={band.lane}>
            {i % 2 === 1 ? (
              <rect
                x={band.x0}
                y={0}
                width={band.x1 - band.x0}
                height={VH}
                fill="hsl(var(--muted) / 0.35)"
              />
            ) : null}
            <text
              x={(band.x0 + band.x1) / 2}
              y={26}
              textAnchor="middle"
              fontSize={11}
              letterSpacing={1.8}
              fill="hsl(var(--muted-foreground))"
              style={{ textTransform: "uppercase", fontWeight: 600 }}
            >
              {laneLabel(band.lane, band.label).toUpperCase()}
            </text>
            {i > 0 ? (
              <line
                x1={band.x0}
                y1={44}
                x2={band.x0}
                y2={VH - 8}
                stroke="hsl(var(--border) / 0.6)"
                strokeDasharray="3 6"
              />
            ) : null}
          </g>
        ))}

        {/* edges */}
        {lesson.edges.map((edge, i) => {
          const a = byId[edge.from];
          const b = byId[edge.to];
          if (!a || !b) return null;
          const key = `${edge.from}->${edge.to}`;
          const isActive = activeEdges.has(key);
          return (
            <path
              key={`${key}-${i}`}
              d={edgePath(a, b, edge.curve)}
              fill="none"
              stroke={isActive ? "hsl(var(--signal))" : "hsl(var(--border))"}
              strokeWidth={isActive ? 2.2 : 1.3}
              strokeDasharray={edge.dashed ? "6 6" : undefined}
              markerEnd={`url(#${isActive ? "arrow-active" : "arrow"}-${uid})`}
              opacity={isActive ? 1 : 0.5}
              className="transition-all duration-300"
            />
          );
        })}

        {/* travelling packets */}
        {playing
          ? lesson.edges.map((edge, i) => {
              const key = `${edge.from}->${edge.to}`;
              if (!activeEdges.has(key)) return null;
              const a = byId[edge.from];
              const b = byId[edge.to];
              if (!a || !b) return null;
              return (
                <circle
                  key={`packet-${key}-${i}`}
                  r={5}
                  fill="hsl(var(--signal))"
                  opacity={0.95}
                >
                  <animateMotion
                    dur="1.5s"
                    repeatCount="indefinite"
                    path={edgePath(a, b, edge.curve)}
                  />
                </circle>
              );
            })
          : null}

        {/* nodes */}
        {lesson.nodes.map((node) => (
          <NodeBox
            key={node.id}
            node={node}
            active={activeNodes.has(node.id)}
          />
        ))}
      </svg>
      </div>
    </div>
  );
}
