import type { Lesson } from "./types";

export const systemsLessons: Lesson[] = [
  {
    slug: "url-shortener",
    moduleId: "systems",
    title: "Design a URL Shortener",
    summary:
      "A first end-to-end design: from a one-line brief to a system that serves billions of redirects without a single counter in the way.",
    minutes: 11,
    lanes: { client: "Client", edge: "API", service: "Services", data: "Storage" },
    nodes: [
      { id: "client", label: "Client", sub: "follows a link", lane: "client", x: 110, y: 300, icon: "user" },
      { id: "api", label: "API servers", sub: "stateless, N of them", lane: "edge", x: 370, y: 300, icon: "api" },
      { id: "idgen", label: "ID generator", sub: "leases ID ranges", lane: "service", x: 640, y: 130, icon: "id", tone: "brand" },
      { id: "cache", label: "Redis", sub: "code → target URL", lane: "service", x: 640, y: 320, icon: "cache" },
      { id: "queue", label: "Click stream", sub: "fire and forget", lane: "edge", x: 370, y: 490, icon: "queue" },
      { id: "db", label: "Key-value store", sub: "the durable mapping", lane: "data", x: 890, y: 320, icon: "db" },
      { id: "analytics", label: "Analytics", sub: "batched writes", lane: "service", x: 640, y: 490, icon: "monitor" },
    ],
    edges: [
      { from: "client", to: "api" },
      { from: "api", to: "client", curve: 36, dashed: true },
      { from: "api", to: "idgen", dashed: true },
      { from: "api", to: "cache" },
      { from: "cache", to: "api", curve: 28, dashed: true },
      { from: "cache", to: "db", dashed: true },
      { from: "db", to: "cache", curve: 30, dashed: true },
      { from: "api", to: "queue" },
      { from: "queue", to: "analytics" },
    ],
    steps: [
      {
        title: "The brief",
        body: [
          "Shorten a long URL into a short one, and redirect anyone who visits the short one to the original. Links should not expire, and the redirect should feel instant.",
          "Two operations, very different in cost: **create** happens rarely and can be slow; **redirect** happens constantly and must be fast. Almost every design decision follows from that asymmetry.",
        ],
        keyIdea: "Reads outnumber writes by orders of magnitude. Optimise the read path and keep the write path simple.",
        active: ["client", "api"],
        edges: [["client", "api"]],
        metrics: [
          { label: "Creates", value: "100 /s", tone: "muted" },
          { label: "Redirects", value: "20,000 /s", tone: "warn" },
        ],
      },
      {
        title: "Estimate before you build",
        body: [
          "100 new links a second is 8.6 million a day. At 500 bytes a record — code, URL, owner, timestamp — that is about 4 GB a day, 1.6 TB a year, before replication.",
          "20,000 redirects a second at 100 KB each for click logging is 2 GB per second of write traffic. That number alone tells you analytics cannot be synchronous.",
        ],
        points: [
          "8.6 M links/day × 500 B ≈ 4.3 GB/day.",
          "Cache the hot 1% of links; it usually serves most of the traffic.",
          "Click logging is the biggest write load, not the mapping itself.",
        ],
        active: ["api", "db"],
        edges: [["api", "cache"]],
        metrics: [
          { label: "Storage / year", value: "~1.6 TB", tone: "warn" },
          { label: "With 3 copies", value: "~4.8 TB", tone: "warn" },
        ],
      },
      {
        title: "The short code",
        body: [
          "Seven characters from a 62-symbol alphabet is 62⁷ ≈ 3.5 trillion combinations. Enough to never run out, short enough to type.",
          "The obvious approach — hash the URL and take the first seven characters — collides and forces a lookup on every write. Better: generate a number and encode it in base62, so the code is unique by construction.",
        ],
        points: [
          "Hash + truncate: collisions, needs a uniqueness check, same URL can give different codes.",
          "Counter + base62: no collisions, but the counter is a global bottleneck.",
          "Random + retry: simple, works, wastes a few attempts on collisions.",
        ],
        active: ["api", "idgen"],
        edges: [["api", "idgen"]],
        metrics: [
          { label: "Space", value: "3.5 × 10¹²", tone: "ok" },
          { label: "Code length", value: "7", tone: "ok" },
        ],
      },
      {
        title: "A counter without a queue",
        body: [
          "One global counter means every create waits its turn — a single point of contention and a single point of failure.",
          "Instead, each API server leases a block of a thousand IDs from the generator and hands them out locally. The generator is touched once per thousand creates, and a server can create links with no coordination at all.",
        ],
        keyIdea: "Give each writer a private range instead of a shared lock.",
        active: ["api", "idgen"],
        edges: [["api", "idgen"]],
        metrics: [
          { label: "Generator calls", value: "1 per 1,000", tone: "ok" },
          { label: "Create latency", value: "~2 ms", tone: "ok" },
        ],
      },
      {
        title: "The read path",
        body: [
          "A redirect is a single lookup: code in, URL out. No joins, no sorting, no aggregation — which is exactly what a key-value store and an in-memory cache are for.",
          "Check Redis first. On a hit, return a 301 or 302 immediately. On a miss, read the store, populate the cache, and return.",
        ],
        active: ["client", "api", "cache", "db"],
        edges: [["client", "api"], ["api", "cache"], ["cache", "db"], ["db", "cache"], ["cache", "api"], ["api", "client"]],
        metrics: [
          { label: "Cache hit", value: "0.4 ms", tone: "ok" },
          { label: "Cache miss", value: "4 ms", tone: "warn" },
          { label: "Hit rate", value: "~96%", tone: "ok" },
        ],
        note: "Dashed lines: the cached answer, and the miss path down to storage.",
      },
      {
        title: "301 or 302",
        body: [
          "A **301** is permanent, so browsers and CDNs cache the redirect themselves and may never ask you again. That is wonderful for your servers and terrible for your analytics.",
          "A **302** is temporary: the client asks every time. Most link shorteners choose 302 precisely so clicks remain countable.",
        ],
        keyIdea: "Permanent redirects move the traffic off your servers — including the traffic you wanted to measure.",
        active: ["client", "api"],
        edges: [["api", "client"]],
        metrics: [
          { label: "301", value: "cheap, uncountable", tone: "warn" },
          { label: "302", value: "countable", tone: "ok" },
        ],
      },
      {
        title: "Clicks are not the request path",
        body: [
          "Every redirect is also a click to record. Writing it to the database inline would add a write to a 20,000-per-second read path.",
          "Publish a small event to a queue and let analytics workers batch-insert. A dropped click event is acceptable; a slow redirect is not.",
        ],
        active: ["api", "queue", "analytics"],
        edges: [["api", "queue"], ["queue", "analytics"]],
        metrics: [
          { label: "Inline write", value: "+8 ms", tone: "bad" },
          { label: "Queued", value: "+0.2 ms", tone: "ok" },
        ],
      },
      {
        title: "What would break first",
        body: [
          "The cache is the whole design. If Redis empties, 20,000 reads a second fall through to the store at once — so the store must survive the cold path, with its own replicas and a rate limit in front.",
          "Second: a single hot link. One viral code can take a shard of the cache with it. Detect hot keys and replicate them across cache nodes rather than sharding them.",
        ],
        keyIdea: "In a read-heavy design, the cache is not an optimisation — it is load-bearing. Size and protect it accordingly.",
        active: ["client", "api", "idgen", "cache", "db", "queue", "analytics"],
        edges: [
          ["client", "api"],
          ["api", "cache"],
          ["cache", "db"],
          ["api", "idgen"],
          ["api", "queue"],
        ],
        metrics: [
          { label: "Reads served by cache", value: "96%", tone: "ok" },
          { label: "Cold-path capacity", value: "must handle 20k/s", tone: "bad" },
          { label: "Hot-key protection", value: "replicated keys", tone: "ok" },
        ],
        note: "Teaching model: figures are illustrative. Measure your own workload before provisioning.",
      },
    ],
  },
];
