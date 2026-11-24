import type { Lesson } from "./types";

export const communicationLessons: Lesson[] = [
  {
    slug: "queues",
    moduleId: "communication",
    title: "Queues & Async Work",
    summary:
      "Answer the user right away and do the slow work later — without losing a job on the way.",
    minutes: 8,
    lanes: { client: "Client", edge: "API", service: "Queue", data: "Workers" },
    nodes: [
      { id: "client", label: "Client", sub: "waiting on the response", lane: "client", x: 110, y: 300, icon: "user" },
      { id: "api", label: "API", sub: "answers in 40 ms", lane: "edge", x: 370, y: 300, icon: "api" },
      { id: "queue", label: "Queue", sub: "durable, ordered", lane: "service", x: 640, y: 300, icon: "queue", tone: "brand" },
      { id: "mail", label: "Email worker", sub: "slow, retryable", lane: "data", x: 890, y: 140, icon: "worker" },
      { id: "thumb", label: "Image worker", sub: "CPU heavy", lane: "data", x: 890, y: 300, icon: "worker" },
      { id: "index", label: "Index worker", sub: "writes to search", lane: "data", x: 890, y: 460, icon: "worker" },
      { id: "dlq", label: "Dead letters", sub: "after N failures", lane: "service", x: 640, y: 480, icon: "file", tone: "bad" },
    ],
    edges: [
      { from: "client", to: "api" },
      { from: "api", to: "client", curve: 34, dashed: true },
      { from: "api", to: "queue" },
      { from: "queue", to: "mail" },
      { from: "queue", to: "thumb" },
      { from: "queue", to: "index" },
      { from: "queue", to: "dlq", dashed: true },
    ],
    steps: [
      {
        title: "The user is waiting for something they do not need",
        body: [
          "Someone places an order. Your API writes the order, then sends a confirmation email, then generates a thumbnail, then updates the search index. The user waits for all four.",
          "Only the first one is part of the answer. The other three are consequences that nobody is watching.",
        ],
        active: ["client", "api"],
        edges: [["client", "api"]],
        metrics: [
          { label: "Synchronous total", value: "1,240 ms", tone: "bad" },
          { label: "What the user needs", value: "the order row", tone: "muted" },
        ],
      },
      {
        title: "Put a queue in the middle",
        body: [
          "The API writes the order, drops a message on a queue, and returns. A worker picks the message up and does the slow part afterwards.",
          "The response time is now the database write plus a queue publish — tens of milliseconds. The slow work still happens, just not in front of a person.",
        ],
        keyIdea: "A queue moves work out of the request path. It does not make the work faster; it makes the user stop paying for it.",
        active: ["client", "api", "queue"],
        edges: [["client", "api"], ["api", "queue"], ["api", "client"]],
        metrics: [
          { label: "API response", value: "40 ms", tone: "ok" },
          { label: "Work deferred", value: "1,200 ms", tone: "muted" },
        ],
        note: "Dashed line: the response returning before the work is done.",
      },
      {
        title: "What the queue guarantees",
        body: [
          "A durable queue writes the message to disk before acknowledging it, so a broker crash does not lose the job. That is the property you are paying for.",
          "Most queues promise **at-least-once** delivery: a worker that crashes after doing the work but before acknowledging will see the message again. Your worker must therefore be idempotent — doing it twice must be harmless.",
        ],
        points: [
          "At-least-once + idempotent worker = correct, and the usual design.",
          "At-most-once = may lose work, never duplicates. Rarely what you want.",
          "Exactly-once is a claim about a specific pair of systems, not a universal property.",
        ],
        active: ["queue", "thumb"],
        edges: [["api", "queue"], ["queue", "thumb"]],
        metrics: [
          { label: "Delivery", value: "at-least-once", tone: "warn" },
          { label: "Duplicates possible", value: "yes", tone: "warn" },
        ],
      },
      {
        title: "Many workers, one queue",
        body: [
          "Add workers and throughput grows: each message is claimed by exactly one worker, so you scale by adding consumers, not by splitting the queue.",
          "The limit is usually downstream — ten workers all writing to the same database have just moved the bottleneck.",
        ],
        active: ["queue", "mail", "thumb", "index"],
        edges: [["queue", "mail"], ["queue", "thumb"], ["queue", "index"]],
        metrics: [
          { label: "Workers", value: "3 → 12", tone: "ok" },
          { label: "Throughput", value: "4×", tone: "ok" },
          { label: "DB pressure", value: "4×", tone: "warn" },
        ],
      },
      {
        title: "When a job keeps failing",
        body: [
          "A message that always fails will be retried forever, blocking or burning workers. Give each message an attempt count and back off between tries.",
          "After the limit, move it to a **dead letter queue** — a place for messages nobody could process, where a human can look at them. Silently dropping them is how you lose orders.",
        ],
        keyIdea: "Retries with backoff, then a dead letter queue. Never retry forever and never drop silently.",
        active: ["queue", "dlq"],
        edges: [["queue", "dlq"]],
        metrics: [
          { label: "Attempts", value: "5", tone: "muted" },
          { label: "Backoff", value: "1s → 5m", tone: "muted" },
          { label: "Then", value: "dead letter", tone: "bad" },
        ],
      },
      {
        title: "The new failure modes",
        body: [
          "A queue does not remove failures, it relocates them. A message can be published twice, processed out of order, or pile up unnoticed until the queue is hours deep.",
          "Watch queue depth and message age. Depth rising with age flat is normal load; both rising together means your consumers cannot keep up.",
        ],
        points: [
          "Duplicate delivery: make the worker idempotent on a natural key.",
          "Ordering: only guaranteed within a partition or a single queue, if at all.",
          "Backlog: alert on the age of the oldest message, not just the count.",
        ],
        active: ["queue", "mail", "thumb", "index", "dlq"],
        edges: [["api", "queue"], ["queue", "mail"], ["queue", "thumb"], ["queue", "index"]],
        metrics: [
          { label: "Depth", value: "12k", tone: "warn" },
          { label: "Oldest message", value: "34 min", tone: "bad" },
        ],
      },
    ],
  },
];
