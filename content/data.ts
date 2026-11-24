import type { Lesson } from "./types";

export const dataLessons: Lesson[] = [
  {
    slug: "sql-vs-nosql",
    moduleId: "data",
    title: "SQL vs NoSQL",
    summary:
      "Tables, documents or plain keys — what each kind of store is actually good at, and what it quietly gives up.",
    minutes: 8,
    nodes: [
      { id: "app", label: "App server", sub: "one data access layer", lane: "client", x: 110, y: 300, icon: "server" },
      { id: "api", label: "Data layer", sub: "chooses per use case", lane: "edge", x: 370, y: 300, icon: "api" },
      { id: "rel", label: "Relational", sub: "rows, joins, transactions", lane: "service", x: 640, y: 140, icon: "db" },
      { id: "doc", label: "Document", sub: "whole objects, nested", lane: "service", x: 640, y: 300, icon: "file" },
      { id: "kv", label: "Key-value", sub: "lookup by exact key", lane: "service", x: 640, y: 460, icon: "cache" },
    ],
    edges: [
      { from: "app", to: "api" },
      { from: "api", to: "rel" },
      { from: "api", to: "doc" },
      { from: "api", to: "kv" },
    ],
    steps: [
      {
        title: "The question is the shape of your queries",
        body: [
          "The database choice follows from how you will read the data, not from how fashionable the store is. If you need to ask new questions of the same rows, you need a store that can answer questions it was not designed for.",
          "Relational engines are general-purpose query machines. Most non-relational stores are specialised access paths.",
        ],
        keyIdea: "Pick a database by its read patterns, not by its marketing.",
        active: ["app", "api"],
        edges: [["app", "api"]],
      },
      {
        title: "Relational: the safe default",
        body: [
          "Rows in tables, a schema enforced on write, joins across tables, and transactions that are all-or-nothing. It is the only mainstream option that gives you all four.",
          "The cost is that changing shape later is a migration, and that a single machine eventually cannot hold the writes.",
        ],
        points: [
          "Strong: constraints, joins, multi-row transactions, ad-hoc queries.",
          "Weak: writes beyond one primary, schema changes on huge tables.",
          "Use it for: money, inventory, anything with relationships.",
        ],
        active: ["api", "rel"],
        edges: [["api", "rel"]],
        metrics: [
          { label: "Read", value: "indexed, flexible", tone: "ok" },
          { label: "Write ceiling", value: "one primary", tone: "warn" },
        ],
      },
      {
        title: "Document: the object is the unit",
        body: [
          "A document store keeps a whole JSON object together. Fetching a product with its variants is one read, not four joins.",
          "The trade is that relationships across documents are the application's job, and updating one field deep inside a huge document rewrites the document.",
        ],
        active: ["api", "doc"],
        edges: [["api", "doc"]],
        metrics: [
          { label: "Product + variants", value: "1 read", tone: "ok" },
          { label: "Cross-entity query", value: "app-side join", tone: "warn" },
        ],
      },
      {
        title: "Key-value: the fastest lookup there is",
        body: [
          "One key in, one value out, usually held in memory. There is no query language because there is no query — the access pattern is fixed by construction.",
          "This is what sits behind sessions, rate-limit counters, feature flags and leaderboards.",
        ],
        active: ["api", "kv"],
        edges: [["api", "kv"]],
        metrics: [
          { label: "Get by key", value: "0.2 ms", tone: "ok" },
          { label: "Scan by value", value: "not supported", tone: "bad" },
        ],
      },
      {
        title: "Polyglot is normal",
        body: [
          "Real systems use several stores at once, each for what it is good at: a relational database for the money, a key-value cache for sessions, a search index for text, an object store for images.",
          "Every additional store is an additional thing to operate, back up and keep consistent. Add one when a specific access pattern is measurably failing, not in advance.",
        ],
        keyIdea: "Every store you add buys one access pattern and costs one operational burden.",
        active: ["app", "api", "rel", "doc", "kv"],
        edges: [["app", "api"], ["api", "rel"], ["api", "doc"], ["api", "kv"]],
        metrics: [
          { label: "Stores", value: "4", tone: "warn" },
          { label: "On-call surface", value: "4×", tone: "bad" },
        ],
      },
      {
        title: "When you have outgrown the relational database",
        body: [
          "Most teams never do. Before you leave, check that you have added indexes, removed N+1 queries, cached the hot reads, and moved reporting off the primary.",
          "If you still cannot keep up, the answer is usually replication for reads and sharding for writes — not a different kind of database.",
        ],
        active: ["api", "rel"],
        edges: [["api", "rel"]],
        metrics: [
          { label: "Typical app", value: "10k reads/s, 1k writes/s", tone: "ok" },
          { label: "Single primary", value: "plenty", tone: "ok" },
        ],
      },
    ],
  },
  {
    slug: "indexes",
    moduleId: "data",
    title: "Indexes",
    summary:
      "Why the same query takes two seconds or two milliseconds, and what an index actually stores.",
    minutes: 7,
    nodes: [
      { id: "query", label: "Query", sub: "WHERE email = ?", lane: "client", x: 110, y: 300, icon: "search" },
      { id: "planner", label: "Query planner", sub: "scan or seek?", lane: "edge", x: 360, y: 300, icon: "gauge" },
      { id: "index", label: "B-tree index", sub: "sorted, small", lane: "service", x: 640, y: 160, icon: "file", tone: "brand" },
      { id: "table", label: "Table rows", sub: "unsorted, wide", lane: "service", x: 640, y: 430, icon: "db" },
      { id: "disk", label: "Disk pages", sub: "4 KB reads", lane: "data", x: 890, y: 300, icon: "monitor" },
    ],
    edges: [
      { from: "query", to: "planner" },
      { from: "planner", to: "index" },
      { from: "planner", to: "table", dashed: true },
      { from: "index", to: "disk" },
      { from: "table", to: "disk" },
    ],
    steps: [
      {
        title: "A table is not sorted",
        body: [
          "Rows are stored in insertion order. To find the row where the email matches, the database has to look at every row until it finds one — a full scan.",
          "On a million rows that is a million comparisons and thousands of page reads. The data is fine; the access path is wrong.",
        ],
        active: ["query", "planner", "table", "disk"],
        edges: [["query", "planner"], ["planner", "table"], ["table", "disk"]],
        metrics: [
          { label: "Rows scanned", value: "1,000,000", tone: "bad" },
          { label: "Time", value: "~1,900 ms", tone: "bad" },
        ],
      },
      {
        title: "An index is a sorted copy",
        body: [
          "An index is a separate structure holding one column's values in sorted order, each pointing at the row that owns it. Sorted data can be searched by halving the range repeatedly.",
          "A million rows in a B-tree is about 20 comparisons — three or four page reads instead of thousands.",
        ],
        keyIdea: "An index trades write speed and disk space for read speed. It is the cheapest performance fix in existence.",
        active: ["planner", "index", "disk"],
        edges: [["planner", "index"], ["index", "disk"]],
        metrics: [
          { label: "Comparisons", value: "~20", tone: "ok" },
          { label: "Time", value: "~2 ms", tone: "ok" },
        ],
      },
      {
        title: "The planner chooses",
        body: [
          "The database decides per query whether to use an index. On a small table a scan is faster than a seek, and on a query returning 40% of the table the index is wasted work.",
          "This is why a query can be fast for one value and slow for another. The plan is not fixed — it depends on the data.",
        ],
        active: ["query", "planner", "index", "table"],
        edges: [["query", "planner"], ["planner", "index"], ["planner", "table"]],
        metrics: [
          { label: "1% of rows", value: "uses index", tone: "ok" },
          { label: "40% of rows", value: "ignores index", tone: "warn" },
        ],
        note: "Dashed line: the scan path the planner may choose instead.",
      },
      {
        title: "Composite order matters",
        body: [
          "An index on `(tenant_id, created_at)` answers queries filtered by tenant, or by tenant plus a date range. It cannot answer a query filtered by date alone, because the leading column is missing.",
          "Put the column you always filter on first, then the one you sort or range on.",
        ],
        points: [
          "Leftmost prefix rule: the index is usable only from its first column rightwards.",
          "An index on `(a, b)` makes a separate index on `(a)` redundant.",
          "Covering indexes answer a query without touching the table at all.",
        ],
        active: ["index"],
        edges: [["planner", "index"]],
        metrics: [
          { label: "tenant_id + date", value: "index seek", tone: "ok" },
          { label: "date only", value: "full scan", tone: "bad" },
        ],
      },
      {
        title: "What it costs on write",
        body: [
          "Every insert and update must maintain every index. Ten indexes on a table means one write becomes eleven writes, plus page splits when the sorted structure fills up.",
          "Indexes also consume disk and memory. An unused index is pure cost — audit them and drop the ones no query uses.",
        ],
        keyIdea: "Indexes are free to read and expensive to write. Index the queries you actually run.",
        active: ["table", "index", "disk"],
        edges: [["table", "disk"], ["index", "disk"]],
        metrics: [
          { label: "Insert", value: "1 + N writes", tone: "warn" },
          { label: "Index size", value: "10–30% of table", tone: "muted" },
        ],
      },
      {
        title: "Reading the plan",
        body: [
          "Every database can show you what it intends to do. Look for the word scan on a large table, for a sort that could have come from an index, and for a join without an index on the joined column.",
          "The fix is usually one line: add the index, or rewrite the predicate so the index applies.",
        ],
        active: ["query", "planner", "index", "table", "disk"],
        edges: [["query", "planner"], ["planner", "index"], ["index", "disk"]],
        metrics: [
          { label: "Before", value: "seq scan, 1.9 s", tone: "bad" },
          { label: "After", value: "index scan, 2 ms", tone: "ok" },
        ],
      },
    ],
  },
  {
    slug: "replication-sharding",
    moduleId: "data",
    title: "Replication & Sharding",
    summary:
      "Copies of the data on several machines for survival and read capacity — then splitting it across machines for write capacity.",
    minutes: 10,
    nodes: [
      { id: "client", label: "Client", sub: "reads and writes", lane: "client", x: 110, y: 300, icon: "user" },
      { id: "router", label: "Query router", sub: "picks shard, then node", lane: "edge", x: 360, y: 300, icon: "router" },
      { id: "shardA", label: "Shard A", sub: "primary, writes", lane: "service", x: 640, y: 150, icon: "db", tone: "brand" },
      { id: "shardB", label: "Shard B", sub: "primary, writes", lane: "service", x: 640, y: 320, icon: "db", tone: "brand" },
      { id: "replA", label: "Replica of A", sub: "reads only", lane: "data", x: 890, y: 150, icon: "replica" },
      { id: "replB", label: "Replica of B", sub: "reads only", lane: "data", x: 890, y: 320, icon: "replica" },
      { id: "shardC", label: "Shard C", sub: "newest range", lane: "service", x: 640, y: 480, icon: "db" },
    ],
    edges: [
      { from: "client", to: "router" },
      { from: "router", to: "shardA" },
      { from: "router", to: "shardB" },
      { from: "router", to: "shardC", dashed: true },
      { from: "shardA", to: "replA" },
      { from: "shardB", to: "replB" },
      { from: "replA", to: "router", curve: -30, dashed: true },
      { from: "replB", to: "router", curve: 30, dashed: true },
    ],
    steps: [
      {
        title: "One copy is not a backup",
        body: [
          "A single database is a single disk, a single machine and a single region. Any of those failing means the product is down and the data may be gone.",
          "Replication keeps an identical copy on another machine, updated continuously from the original. The original is the **primary**; the copies are **replicas**.",
        ],
        active: ["router", "shardA", "replA"],
        edges: [["router", "shardA"], ["shardA", "replA"]],
        metrics: [
          { label: "Copies", value: "1", tone: "bad" },
          { label: "RPO if disk dies", value: "everything", tone: "bad" },
        ],
      },
      {
        title: "Writes go to one place",
        body: [
          "All writes go to the primary, which records them in an ordered log. Replicas replay that log in the same order, so they converge on the same state.",
          "Reads can go anywhere. With three replicas you have four machines' worth of read capacity and three machines that can survive a primary failure.",
        ],
        keyIdea: "Replication scales reads and survives failures. It does not scale writes — every write still lands on one primary.",
        active: ["router", "shardA", "replA"],
        edges: [["router", "shardA"], ["shardA", "replA"], ["replA", "router"]],
        metrics: [
          { label: "Read capacity", value: "4×", tone: "ok" },
          { label: "Write capacity", value: "1×", tone: "warn" },
        ],
      },
      {
        title: "Replication lag",
        body: [
          "The copy is always a little behind. Under load the gap grows to hundreds of milliseconds or more.",
          "The classic bug: you write a profile update to the primary, redirect to the profile page, and the page reads from a lagging replica showing the old value. The user thinks the save failed and does it again.",
        ],
        points: [
          "Read-your-own-writes: send a user's reads to the primary for a few seconds after their write.",
          "Or pin a session to the primary for writes and to a replica for everything else.",
          "Monitor lag in seconds and alert before it reaches the TTL of your caches.",
        ],
        active: ["shardA", "replA"],
        edges: [["shardA", "replA"]],
        metrics: [
          { label: "Lag, quiet", value: "~5 ms", tone: "ok" },
          { label: "Lag, busy", value: "~900 ms", tone: "bad" },
        ],
        note: "Dashed lines carry reads back from the replicas.",
      },
      {
        title: "When writes are the problem",
        body: [
          "Replication gives you more readers of the same data. If the primary cannot keep up with writes, you need to split the data itself.",
          "**Sharding** puts different rows on different machines. Shard A holds users 0–4M, shard B holds 4–8M. Each shard is its own primary with its own replicas.",
        ],
        active: ["client", "router", "shardA", "shardB"],
        edges: [["client", "router"], ["router", "shardA"], ["router", "shardB"]],
        metrics: [
          { label: "Write capacity", value: "2×", tone: "ok" },
          { label: "Queries needing all shards", value: "slow", tone: "warn" },
        ],
      },
      {
        title: "Choosing a shard key",
        body: [
          "The shard key decides everything that follows. A good key spreads writes evenly and keeps each query on one shard.",
          "A bad key concentrates load. Shard by the first letter of the username and every name starting with S lands on one machine.",
        ],
        keyIdea: "A shard key is a permanent decision you cannot undo cheaply. Choose for even spread and single-shard queries.",
        points: [
          "Good: `user_id`, `tenant_id` — high cardinality, used in most queries.",
          "Bad: country, created_date, first letter — low cardinality and skewed.",
          "Hashed keys spread evenly but destroy range queries.",
        ],
        active: ["router", "shardA", "shardB", "shardC"],
        edges: [["router", "shardA"], ["router", "shardB"], ["router", "shardC"]],
        metrics: [
          { label: "Spread", value: "even", tone: "ok" },
          { label: "Cross-shard joins", value: "app-side", tone: "warn" },
        ],
        note: "Dashed line: a newly added shard receiving its first range.",
      },
      {
        title: "Rebalancing",
        body: [
          "Adding a shard means moving data. With `hash(key) % N`, changing N moves almost every key — which is why sharding usually uses a fixed number of hash slots, or consistent hashing, so only a fraction moves.",
          "Moving rows between live shards is a background operation with its own consistency rules: copy, catch up, switch reads, then switch writes.",
        ],
        active: ["shardA", "shardB", "shardC"],
        edges: [["router", "shardC"]],
        metrics: [
          { label: "Modulo hashing", value: "~all keys move", tone: "bad" },
          { label: "Slot-based", value: "~1/N moves", tone: "ok" },
        ],
      },
      {
        title: "What you gave up",
        body: [
          "Once the data is split, a transaction spanning two shards is no longer a database transaction. Cross-shard queries become scatter-gather: ask everyone, merge, sort.",
          "This is the real cost of sharding, and it is why the order is always: index, cache, replicate, then shard. Shard last, and only when writes have proven to be the ceiling.",
        ],
        keyIdea: "Sharding solves write throughput by destroying joins and cheap transactions. Exhaust everything else first.",
        active: ["client", "router", "shardA", "shardB", "replA", "replB"],
        edges: [
          ["client", "router"],
          ["router", "shardA"],
          ["router", "shardB"],
          ["shardA", "replA"],
          ["shardB", "replB"],
        ],
        metrics: [
          { label: "Single-shard query", value: "fast", tone: "ok" },
          { label: "Cross-shard query", value: "N× + merge", tone: "bad" },
          { label: "Cross-shard txn", value: "app-level saga", tone: "bad" },
        ],
      },
    ],
  },
];
