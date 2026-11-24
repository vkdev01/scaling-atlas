export type Lane = "client" | "edge" | "service" | "data";

export type IconKey =
  | "browser"
  | "user"
  | "globe"
  | "dns"
  | "lock"
  | "server"
  | "lb"
  | "cache"
  | "db"
  | "replica"
  | "queue"
  | "worker"
  | "cdn"
  | "gauge"
  | "clock"
  | "id"
  | "file"
  | "monitor"
  | "api"
  | "router"
  | "search";

export type NodeTone = "default" | "brand" | "warn" | "ok" | "bad";

export type DiagramNode = {
  id: string;
  label: string;
  sub?: string;
  lane: Lane;
  /** centre position in a 1000 x 600 viewBox */
  x: number;
  y: number;
  w?: number;
  h?: number;
  icon?: IconKey;
  tone?: NodeTone;
};

export type DiagramEdge = {
  from: string;
  to: string;
  dashed?: boolean;
  /** vertical bend, positive bows the line downwards */
  curve?: number;
  label?: string;
};

export type Metric = {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "bad" | "muted";
};

export type Step = {
  title: string;
  /** paragraphs; **bold** and `code` are rendered inline */
  body: string[];
  keyIdea?: string;
  points?: string[];
  metrics?: Metric[];
  /** node ids lit up on this step */
  active?: string[];
  /** directed edges lit up on this step, as [from, to] */
  edges?: [string, string][];
  /** caption printed under the diagram */
  note?: string;
};

export type Lesson = {
  slug: string;
  moduleId: string;
  title: string;
  summary: string;
  minutes: number;
  /** optional per-lesson column headings */
  lanes?: Partial<Record<Lane, string>>;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  steps: Step[];
};

export type Module = {
  id: string;
  title: string;
  blurb: string;
  icon: IconKey;
};
