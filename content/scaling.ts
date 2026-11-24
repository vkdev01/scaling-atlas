import type { Lesson } from "./types";

export const scalingLessons: Lesson[] = [
  {
    slug: "scale-up-or-out",
    moduleId: "scaling",
    title: "Scale Up or Scale Out",
    summary:
      "Your one server is melting. Do you buy a bigger one, or more of them? The answer depends on what is actually melting.",
    minutes: 8,
    nodes: [
      { id: "traffic", label: "Traffic", sub: "one address", lane: "client", x: 110, y: 300, icon: "user" },
      { id: "lb", label: "Load balancer", sub: "one front door", lane: "edge", x: 370, y: 300, icon: "lb" },
      { id: "a", label: "Server A", sub: "8 vCPU", lane: "service", x: 640, y: 170, icon: "server" },
      { id: "b", label: "Server B", sub: "8 vCPU", lane: "service", x: 640, y: 300, icon: "server" },
      { id: "c", label: "Server C", sub: "8 vCPU", lane: "service", x: 640, y: 430, icon: "server" },
      { id: "db", label: "Database", sub: "the shared truth", lane: "data", x: 890, y: 300, icon: "db" },
    ],
    edges: [
      { from: "traffic", to: "lb" },
      { from: "lb", to: "a" },
      { from: "lb", to: "b" },
      { from: "lb", to: "c" },
      { from: "a", to: "db", curve: 0 },
      { from: "b", to: "db" },
      { from: "c", to: "db", curve: 0 },
    ],
    steps: [
      {
        title: "One machine, one limit",
        body: [
          "You have one server running the app and one database. It was fine at 100 requests per second. At 400 it is dropping connections and the CPU graph is a flat line at the top.",
          "There are exactly two moves: make the machine bigger, or add more machines. They are not interchangeable.",
        ],
        active: ["traffic", "b", "db"],
        edges: [["traffic", "lb"], ["lb", "b"], ["b", "db"]],
        metrics: [
          { label: "Load", value: "400 rps", tone: "bad" },
          { label: "CPU", value: "98%", tone: "bad" },
        ],
      },
      {
        title: "Scale up",
        body: [
          "**Vertical scaling** means a bigger machine: more cores, more memory, faster disk. It is a reboot and a bill, not an engineering project.",
          "It works well until it does not. There is a largest instance size, it costs more than linearly, and you still have exactly one machine — so it is still exactly one point of failure.",
        ],
        points: [
          "No code changes, no distributed-systems problems.",
          "Doubling the price rarely doubles the capacity at the high end.",
          "You cannot fail over to a machine you do not have.",
        ],
        active: ["traffic", "b", "db"],
        edges: [["traffic", "lb"], ["lb", "b"], ["b", "db"]],
        metrics: [
          { label: "Capacity", value: "4×", tone: "ok" },
          { label: "Cost", value: "6×", tone: "warn" },
          { label: "Failure domains", value: "1", tone: "bad" },
        ],
      },
      {
        title: "Scale out",
        body: [
          "**Horizontal scaling** means more machines behind a load balancer. Capacity grows in steps, and any one machine can die without taking the service with it.",
          "The price is that nothing can live on a single machine's memory any more. Sessions, uploaded files, in-flight jobs — all of it has to move somewhere shared.",
        ],
        keyIdea: "Scale out when you need availability as much as capacity. Scale up when you need capacity this afternoon.",
        active: ["traffic", "lb", "a", "b", "c"],
        edges: [["traffic", "lb"], ["lb", "a"], ["lb", "b"], ["lb", "c"]],
        metrics: [
          { label: "Capacity", value: "3×", tone: "ok" },
          { label: "Cost", value: "3×", tone: "ok" },
          { label: "Failure domains", value: "3", tone: "ok" },
        ],
      },
      {
        title: "The state problem",
        body: [
          "The moment there are three servers, the request that logs you in may land on A while the request that reads your cart lands on B. If the session lived in A's memory, B does not know you.",
          "This is why stateless services are the real prerequisite for scaling out — the servers must be interchangeable.",
        ],
        active: ["lb", "a", "b", "c"],
        edges: [["lb", "a"], ["lb", "b"], ["lb", "c"]],
        metrics: [
          { label: "Sticky sessions", value: "works, badly", tone: "warn" },
          { label: "Shared session store", value: "works", tone: "ok" },
        ],
      },
      {
        title: "Now the database",
        body: [
          "Three app servers now hammer one database. The app tier scaled, the data tier did not, and the database becomes the new ceiling within minutes.",
          "Scaling the data tier is a different and much harder problem — replicas for reads, sharding for writes. It gets its own lesson.",
        ],
        keyIdea: "Scaling the stateless tier is easy. The hard part is always the thing that holds the state.",
        active: ["a", "b", "c", "db"],
        edges: [["a", "db"], ["b", "db"], ["c", "db"]],
        metrics: [
          { label: "App capacity", value: "3×", tone: "ok" },
          { label: "DB connections", value: "3×", tone: "bad" },
        ],
      },
      {
        title: "Choosing",
        body: [
          "For most products the answer is both, in order: scale up first because it buys months for a credit card, then scale out once you need availability and the bill for bigger boxes stops making sense.",
          "The mistake is scaling out to fix a problem that lives inside one query. Three servers running a bad query is three times the bill and the same slow page.",
        ],
        active: ["traffic", "lb", "a", "b", "c", "db"],
        edges: [
          ["traffic", "lb"],
          ["lb", "a"],
          ["lb", "b"],
          ["lb", "c"],
          ["a", "db"],
          ["b", "db"],
          ["c", "db"],
        ],
        metrics: [
          { label: "Day 1", value: "1 big box", tone: "muted" },
          { label: "At scale", value: "N small + replicas", tone: "muted" },
        ],
      },
    ],
  },
  {
    slug: "load-balancing",
    moduleId: "scaling",
    title: "Load Balancing",
    summary:
      "One front door for many servers, the rules for who gets which request, and how the front door itself stays alive.",
    minutes: 8,
    nodes: [
      { id: "clients", label: "Clients", sub: "many connections", lane: "client", x: 110, y: 300, icon: "user" },
      { id: "lb", label: "Load balancer", sub: "health-checked pool", lane: "edge", x: 370, y: 300, icon: "lb" },
      { id: "a", label: "Server A", sub: "healthy", lane: "service", x: 640, y: 160, icon: "server", tone: "ok" },
      { id: "b", label: "Server B", sub: "healthy", lane: "service", x: 640, y: 300, icon: "server", tone: "ok" },
      { id: "c", label: "Server C", sub: "failing checks", lane: "service", x: 640, y: 440, icon: "server", tone: "bad" },
      { id: "db", label: "Database", sub: "shared by all", lane: "data", x: 890, y: 300, icon: "db" },
    ],
    edges: [
      { from: "clients", to: "lb" },
      { from: "lb", to: "a" },
      { from: "lb", to: "b" },
      { from: "lb", to: "c", dashed: true },
      { from: "a", to: "db" },
      { from: "b", to: "db" },
    ],
    steps: [
      {
        title: "One address, many servers",
        body: [
          "A load balancer is a single address that hides a pool of servers. Clients connect to it and never learn how many servers are behind it.",
          "This is what makes horizontal scaling invisible to the outside world. You can add, drain or replace servers without changing a DNS record.",
        ],
        active: ["clients", "lb", "a", "b", "c"],
        edges: [["clients", "lb"], ["lb", "a"], ["lb", "b"], ["lb", "c"]],
        metrics: [
          { label: "Pool size", value: "3", tone: "muted" },
          { label: "Client view", value: "1 address", tone: "ok" },
        ],
      },
      {
        title: "How it picks",
        body: [
          "**Round robin** hands requests out in order. It is fine when every request costs the same and every server is identical, which is rarely true.",
          "**Least connections** sends the next request to whichever server is currently holding the fewest. It adapts to slow requests without knowing anything about them.",
          "**Consistent hashing** sends the same key to the same server, which is what you want when a server has a warm cache you would like to keep hitting.",
        ],
        points: [
          "Round robin: simple, blind to request cost.",
          "Least connections: better under variable load, needs state in the balancer.",
          "Hashed: sticky by key, but hot keys concentrate load.",
        ],
        active: ["lb", "a", "b", "c"],
        edges: [["lb", "a"], ["lb", "b"], ["lb", "c"]],
        metrics: [
          { label: "Spread at p50", value: "even", tone: "ok" },
          { label: "Spread at p99", value: "uneven", tone: "warn" },
        ],
      },
      {
        title: "Health checks",
        body: [
          "The balancer asks each server a cheap question every few seconds — usually a `/health` endpoint. If a server fails the check, it is removed from the pool.",
          "The interval is a trade-off you cannot avoid: check often and a brief blip ejects a healthy server, check rarely and users hit a dead one for up to a minute.",
        ],
        keyIdea: "Health checks turn a dead server into a routing decision instead of an outage.",
        active: ["lb", "c"],
        edges: [["lb", "c"]],
        metrics: [
          { label: "Check interval", value: "5 s", tone: "muted" },
          { label: "Failures before eject", value: "3", tone: "muted" },
          { label: "User impact", value: "none", tone: "ok" },
        ],
        note: "Dashed line: a failing server still receives probes, but no traffic.",
      },
      {
        title: "Layer 4 or layer 7",
        body: [
          "A **layer 4** balancer forwards packets by IP and port. It is fast, protocol-agnostic and cannot read the request.",
          "A **layer 7** balancer terminates the connection and reads HTTP. That costs a little more but lets you route by path, rewrite headers, retry a failed request, and terminate TLS in one place.",
        ],
        active: ["clients", "lb"],
        edges: [["clients", "lb"]],
        metrics: [
          { label: "L4 overhead", value: "very low", tone: "ok" },
          { label: "L7 options", value: "routing, retries, TLS", tone: "ok" },
        ],
      },
      {
        title: "The balancer is now critical",
        body: [
          "You removed every single point of failure except the one you just built. A load balancer is a machine too, and it can die.",
          "The standard answer is a pair: an active balancer and a standby that takes over a virtual IP, or DNS pointing at several balancers. Managed cloud balancers do this for you, which is most of why people use them.",
        ],
        points: [
          "Two balancers, one address: active/standby or DNS round robin.",
          "Balancers must be in more than one availability zone.",
          "Never let a single balancer sit in front of a system you call highly available.",
        ],
        active: ["clients", "lb", "db"],
        edges: [["clients", "lb"], ["a", "db"], ["b", "db"]],
        metrics: [
          { label: "Balancers", value: "2", tone: "ok" },
          { label: "Zones", value: "2+", tone: "ok" },
        ],
      },
      {
        title: "What the balancer cannot fix",
        body: [
          "Requests are not equally expensive. One report request may take 40 times the CPU of a static page, and a balancer that spreads requests evenly still produces uneven load.",
          "Two fixes: make the expensive work asynchronous (queue it), or give it its own pool so it cannot starve the cheap requests.",
        ],
        active: ["lb", "a", "b", "db"],
        edges: [["lb", "a"], ["lb", "b"], ["a", "db"], ["b", "db"]],
        metrics: [
          { label: "Cheap request", value: "8 ms", tone: "ok" },
          { label: "Report request", value: "1.9 s", tone: "bad" },
        ],
      },
    ],
  },
  {
    slug: "caching",
    moduleId: "scaling",
    title: "Caching",
    summary:
      "Keep the answers people ask for most somewhere much faster than the database — and learn how stale you can afford to be.",
    minutes: 9,
    nodes: [
      { id: "client", label: "Client", sub: "browser cache", lane: "client", x: 110, y: 300, icon: "browser" },
      { id: "edge", label: "Edge cache", sub: "near the user", lane: "edge", x: 370, y: 300, icon: "cdn" },
      { id: "app", label: "App server", sub: "decides what to keep", lane: "service", x: 630, y: 300, icon: "server" },
      { id: "cache", label: "Shared cache", sub: "Redis / Memcached", lane: "service", x: 630, y: 120, icon: "cache", tone: "brand" },
      { id: "db", label: "Database", sub: "the source of truth", lane: "data", x: 890, y: 300, icon: "db" },
    ],
    edges: [
      { from: "client", to: "edge" },
      { from: "edge", to: "app" },
      { from: "app", to: "cache" },
      { from: "cache", to: "app", curve: 26, dashed: true },
      { from: "app", to: "db" },
      { from: "db", to: "app", curve: 30, dashed: true },
      { from: "app", to: "edge", curve: -40, dashed: true },
      { from: "edge", to: "client", curve: -34, dashed: true },
    ],
    steps: [
      {
        title: "The same answer, again",
        body: [
          "A product page gets 40,000 views an hour. The product changes twice a day. You are asking the database the same question 40,000 times and getting the same answer 39,999 times.",
          "A cache stores that answer somewhere with no query planning, no disk seeks and no locks. A cache hit costs a fraction of a millisecond; a database read costs a few.",
        ],
        keyIdea: "Caching is trading freshness for speed. The whole design question is how much staleness the product can tolerate.",
        active: ["app", "db"],
        edges: [["app", "db"], ["db", "app"]],
        metrics: [
          { label: "DB read", value: "~3 ms", tone: "warn" },
          { label: "Cache read", value: "~0.3 ms", tone: "ok" },
        ],
      },
      {
        title: "Check the cache first",
        body: [
          "The app asks the cache. On a hit, it returns immediately and never touches the database. On a miss, it reads the database and writes the result into the cache for next time.",
          "This is **cache-aside**, the default pattern. The application owns the logic, so there is no magic and no second copy of your data model.",
        ],
        active: ["app", "cache"],
        edges: [["app", "cache"], ["cache", "app"]],
        metrics: [
          { label: "Hit rate", value: "94%", tone: "ok" },
          { label: "DB load", value: "−94%", tone: "ok" },
        ],
        note: "Dashed line: the cached answer travelling back to the app.",
      },
      {
        title: "The cold start",
        body: [
          "A brand new cache is empty, so every request misses. Traffic hits the database at full rate while the cache fills up.",
          "Worse: if a popular key expires and 2,000 requests arrive in the same millisecond, all 2,000 miss and all 2,000 query the database. That is a **thundering herd**, and it can take down a healthy database in seconds.",
        ],
        points: [
          "Warm the cache at deploy time for known-hot keys.",
          "Add a short lock so only one request recomputes a missing key.",
          "Jitter your TTLs so keys do not all expire together.",
        ],
        active: ["app", "cache", "db"],
        edges: [["app", "cache"], ["app", "db"]],
        metrics: [
          { label: "Cold hit rate", value: "0%", tone: "bad" },
          { label: "DB load", value: "40,000/hr", tone: "bad" },
        ],
      },
      {
        title: "How long is too stale",
        body: [
          "Every cached value needs an expiry. Product price: seconds to minutes. Feature flags: seconds. User profile: minutes. Country list: hours.",
          "The expiry is a product decision expressed as a number. If nobody can answer how stale is acceptable, you do not yet know what you are caching.",
        ],
        keyIdea: "TTL is a product requirement, not a technical setting.",
        active: ["cache", "db"],
        edges: [["app", "cache"]],
        metrics: [
          { label: "Price", value: "30 s", tone: "warn" },
          { label: "Catalogue", value: "10 min", tone: "ok" },
          { label: "Static assets", value: "1 year", tone: "ok" },
        ],
      },
      {
        title: "Invalidation",
        body: [
          "Expiry handles the slow case. Writes handle the fast one: when a product is edited, delete its key so the next read repopulates it.",
          "Delete, do not update. Writing a new value into the cache races with other writers and with concurrent reads; deleting is idempotent and leaves exactly one source of truth.",
        ],
        points: [
          "Write through: update cache and database together — consistent, slower.",
          "Write behind: update cache, flush to database later — fast, risks data loss.",
          "Delete on write: simplest and the usual default.",
        ],
        active: ["app", "cache", "db"],
        edges: [["app", "db"], ["app", "cache"]],
        metrics: [
          { label: "Stale window", value: "≤ 1 read", tone: "ok" },
          { label: "Race window", value: "ms", tone: "warn" },
        ],
      },
      {
        title: "Push it closer",
        body: [
          "A shared cache saves the database but not the network. The user in Sydney still pays 150 ms to reach a cache in Frankfurt.",
          "An **edge cache** (a CDN) sits near the user and answers before the request ever reaches your infrastructure. For anything a logged-out user can see, this is the biggest single win available.",
        ],
        active: ["client", "edge", "app"],
        edges: [["client", "edge"], ["edge", "client"]],
        metrics: [
          { label: "Origin round trip", value: "150 ms", tone: "bad" },
          { label: "Edge hit", value: "12 ms", tone: "ok" },
        ],
      },
      {
        title: "The cache that hid the bug",
        body: [
          "Caches fail in a specific way: they make a broken system look fine, then reveal it all at once when a key expires or a node restarts.",
          "Test with the cache empty. If your database cannot survive the cold path, you do not have a cache — you have a dependency you cannot remove.",
        ],
        keyIdea: "A cache must be removable. If emptying it takes the site down, it is not a cache.",
        active: ["client", "edge", "app", "cache", "db"],
        edges: [["client", "edge"], ["edge", "app"], ["app", "cache"], ["app", "db"]],
        metrics: [
          { label: "Warm", value: "40 ms", tone: "ok" },
          { label: "Cold", value: "1,300 ms", tone: "bad" },
        ],
      },
    ],
  },
];
