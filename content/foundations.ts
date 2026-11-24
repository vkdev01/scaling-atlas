import type { Lesson } from "./types";

export const foundationsLessons: Lesson[] = [
  {
    slug: "request-lifecycle",
    moduleId: "foundations",
    title: "How a Request Travels",
    summary:
      "Follow one page load from the keypress to the painted pixel, and find out which hop is eating the time.",
    minutes: 9,
    nodes: [
      { id: "browser", label: "Browser", sub: "shop.example", lane: "client", x: 110, y: 300, icon: "browser" },
      { id: "resolver", label: "DNS resolver", sub: "name → address", lane: "edge", x: 340, y: 100, icon: "dns" },
      { id: "edge", label: "Edge / TLS", sub: "handshake, then bytes", lane: "edge", x: 340, y: 300, icon: "lock" },
      { id: "assets", label: "Asset cache", sub: "CSS, JS, images", lane: "edge", x: 340, y: 490, icon: "cdn" },
      { id: "app", label: "App server", sub: "renders the page", lane: "service", x: 620, y: 300, icon: "server" },
      { id: "db", label: "Database", sub: "one query per page", lane: "data", x: 880, y: 300, icon: "db" },
    ],
    edges: [
      { from: "browser", to: "resolver", dashed: true },
      { from: "resolver", to: "browser", dashed: true, curve: -34 },
      { from: "browser", to: "edge", curve: 0 },
      { from: "edge", to: "app" },
      { from: "app", to: "db" },
      { from: "db", to: "app", curve: 30 },
      { from: "app", to: "browser", curve: 34 },
      { from: "browser", to: "assets", dashed: true },
      { from: "assets", to: "browser", dashed: true, curve: -30 },
    ],
    steps: [
      {
        title: "Hit Enter",
        body: [
          "Someone types `shop.example` and presses Enter. Nothing on the network knows what that name means yet — it is a label, not an address. Every request starts with a translation.",
          "Before any translation happens the browser checks its own memory. If it has resolved this host recently, the whole first hop disappears.",
        ],
        keyIdea: "A request is a chain of conversations between machines. Each conversation has a cost, and the costs add up.",
        active: ["browser"],
        edges: [],
        metrics: [
          { label: "So far", value: "0 ms", tone: "muted" },
          { label: "Hops left", value: "6", tone: "muted" },
        ],
        note: "The user has done their part. Everything after this is the system's problem.",
      },
      {
        title: "Find the address",
        body: [
          "The browser asks a resolver to turn the hostname into an IP address. If the resolver has a cached answer it replies in a millisecond or two. If it does not, it walks the DNS hierarchy from the root down, and that walk is where the tens of milliseconds live.",
          "The answer comes back with a **TTL** — a number of seconds the answer stays usable. Long TTLs make lookups cheap and renames slow. Short TTLs make renames quick and every lookup expensive.",
        ],
        points: [
          "DNS is usually cached at four levels: browser, OS, resolver, and the authoritative server.",
          "A cold DNS lookup costs roughly 20–120 ms. A warm one costs almost nothing.",
          "Changing DNS records does not take effect until the TTL expires, everywhere.",
        ],
        active: ["browser", "resolver"],
        edges: [["browser", "resolver"], ["resolver", "browser"]],
        metrics: [
          { label: "Cold lookup", value: "~40 ms", tone: "warn" },
          { label: "Cached lookup", value: "~1 ms", tone: "ok" },
        ],
        note: "Dashed lines are control traffic: small messages, but they happen before anything else can.",
      },
      {
        title: "Open the connection",
        body: [
          "Now the browser has an address and opens a connection. A TCP handshake costs one round trip. TLS adds another before the first byte of the request can go out.",
          "This is why latency is not just bandwidth. A round trip to a server 150 ms away costs 150 ms before you have sent anything at all — and the handshake spends two of them.",
        ],
        keyIdea: "Connections are round trips. Round trips are bounded by the speed of light, so you can only reduce their number, not their length.",
        active: ["browser", "edge"],
        edges: [["browser", "edge"]],
        metrics: [
          { label: "TCP + TLS", value: "2 RTT", tone: "warn" },
          { label: "Same region", value: "~10 ms", tone: "ok" },
          { label: "Cross-continent", value: "~150 ms", tone: "bad" },
        ],
      },
      {
        title: "Send the request",
        body: [
          "The request itself is small: a method, a path, some headers, maybe a cookie. It travels one round trip and arrives at the app server, which now has to answer a question about data it does not hold.",
          "Notice that three round trips have already happened and the server has not done any work yet.",
        ],
        active: ["browser", "edge", "app"],
        edges: [["browser", "edge"], ["edge", "app"]],
        metrics: [
          { label: "Request size", value: "~1 KB", tone: "muted" },
          { label: "Round trips so far", value: "3", tone: "warn" },
        ],
      },
      {
        title: "Fetch the data",
        body: [
          "The app server asks the database for the product. The database reads from memory or disk, sorts, filters, and returns rows. On a healthy system this is a couple of milliseconds. On an unhealthy one it is the entire page-load budget.",
          "Every hop so far has been bounded by distance. This hop is bounded by work — and work is the part you can fix with an index or a cache.",
        ],
        active: ["app", "db"],
        edges: [["edge", "app"], ["app", "db"], ["db", "app"]],
        metrics: [
          { label: "Indexed read", value: "1–3 ms", tone: "ok" },
          { label: "Full table scan", value: "400+ ms", tone: "bad" },
        ],
      },
      {
        title: "Send the response",
        body: [
          "The server renders HTML and sends it back. The browser can start parsing before the last byte arrives, which is why the first paint often beats the full download.",
          "The page is visible now. It is also useless, because the stylesheet and the scripts have not arrived.",
        ],
        active: ["app", "browser"],
        edges: [["db", "app"], ["app", "browser"]],
        metrics: [
          { label: "HTML", value: "~28 KB", tone: "muted" },
          { label: "Time to first paint", value: "~310 ms", tone: "ok" },
        ],
      },
      {
        title: "More files",
        body: [
          "The browser parses the HTML, finds the stylesheet, the script and the hero image, and asks for each one. This is where a page load turns into dozens of requests.",
          "Static files should come from a cache near the user, not from the app server. If they come from the app server, you have just multiplied your data hop by the number of assets.",
        ],
        points: [
          "One page load is often 40–80 HTTP requests.",
          "Assets from a nearby cache cost a few milliseconds each instead of a full round trip.",
          "The critical path is only the files that block the first paint.",
        ],
        active: ["browser", "assets"],
        edges: [["browser", "assets"], ["assets", "browser"]],
        metrics: [
          { label: "Requests", value: "52", tone: "warn" },
          { label: "From cache", value: "48", tone: "ok" },
          { label: "Page loaded", value: "~640 ms", tone: "ok" },
        ],
      },
      {
        title: "When one query is slow",
        body: [
          "Nothing above changed. The user is in the same city, the connection is warm, the assets are cached — and the page takes four seconds.",
          "The data hop went from 2 ms to 1,800 ms because a query stopped using its index. This is the most common shape of a performance incident: distance is fine, work is not.",
        ],
        keyIdea: "Before you add servers, find the hop that got slower. Adding capacity to a bad query multiplies the problem.",
        active: ["app", "db"],
        edges: [["app", "db"], ["db", "app"]],
        metrics: [
          { label: "Data hop", value: "1,800 ms", tone: "bad" },
          { label: "Everything else", value: "~300 ms", tone: "ok" },
          { label: "Page loaded", value: "4.1 s", tone: "bad" },
        ],
      },
      {
        title: "When the user is far away",
        body: [
          "Same system, healthy query, user in another continent. Every round trip now costs 150 ms instead of 10, and the page makes six of them.",
          "You cannot make light faster. You can move the answer closer — a cache or a replica near the user turns six long round trips into one short one.",
        ],
        active: ["browser", "assets", "edge"],
        edges: [["browser", "edge"], ["edge", "browser"]],
        metrics: [
          { label: "Round trips", value: "6", tone: "warn" },
          { label: "Per round trip", value: "150 ms", tone: "bad" },
          { label: "Page loaded", value: "~1.2 s", tone: "warn" },
        ],
      },
      {
        title: "The whole path",
        body: [
          "Six hops, three of them round trips, one of them actual work. Total budget for a page a human calls fast: about one second.",
          "Keep this map in your head for the rest of the course. Every technique from here — caching, load balancing, replication, queues — is an edit to one of these arrows.",
        ],
        keyIdea: "Measure the hop before you optimise the system. The fix is almost always local.",
        active: ["browser", "resolver", "edge", "app", "db", "assets"],
        edges: [
          ["browser", "resolver"],
          ["resolver", "browser"],
          ["browser", "edge"],
          ["edge", "app"],
          ["app", "db"],
          ["db", "app"],
          ["app", "browser"],
          ["browser", "assets"],
        ],
        metrics: [
          { label: "DNS", value: "~2 ms", tone: "ok" },
          { label: "Connect", value: "~20 ms", tone: "ok" },
          { label: "Server", value: "~45 ms", tone: "ok" },
          { label: "Assets", value: "~250 ms", tone: "warn" },
        ],
        note: "Teaching model: the figures are illustrative, not measurements of your system.",
      },
    ],
  },
  {
    slug: "latency-throughput",
    moduleId: "foundations",
    title: "Latency & Throughput",
    summary:
      "Two different questions about speed, and why a server that is only 70% busy is already making people wait.",
    minutes: 8,
    nodes: [
      { id: "clients", label: "Clients", sub: "requests arriving", lane: "client", x: 110, y: 300, icon: "user" },
      { id: "queue", label: "Waiting line", sub: "work not yet started", lane: "edge", x: 340, y: 300, icon: "queue", tone: "warn" },
      { id: "workers", label: "Workers", sub: "capacity per second", lane: "service", x: 620, y: 300, icon: "server" },
      { id: "store", label: "Shared store", sub: "the slow dependency", lane: "data", x: 880, y: 300, icon: "db" },
    ],
    edges: [
      { from: "clients", to: "queue" },
      { from: "queue", to: "workers" },
      { from: "workers", to: "store" },
      { from: "store", to: "workers", curve: 30 },
      { from: "workers", to: "clients", curve: 40 },
    ],
    steps: [
      {
        title: "Two questions",
        body: [
          "**Latency** asks how long one request takes. **Throughput** asks how many requests finish per second. They are not the same number and they do not move together.",
          "A checkout counter can serve one person in 30 seconds — that is latency — and 120 people an hour — that is throughput. Add a second till and throughput doubles while latency stays 30 seconds.",
        ],
        keyIdea: "Latency is a property of one request. Throughput is a property of the system. Confusing them leads to the wrong fix.",
        active: ["clients", "workers"],
        edges: [["clients", "queue"]],
        metrics: [
          { label: "Latency p50", value: "45 ms", tone: "ok" },
          { label: "Throughput", value: "220 rps", tone: "ok" },
        ],
      },
      {
        title: "Where the time goes",
        body: [
          "A request's time is the sum of the time it spends running and the time it spends waiting. Running time is work. Waiting time is other people's work.",
          "Most performance work is about waiting: waiting for a connection, a lock, a disk, or a turn on the CPU.",
        ],
        points: [
          "**Service time** — the work your code does.",
          "**Queue time** — the delay before the work starts.",
          "**Network time** — moving bytes in and out.",
        ],
        active: ["queue", "workers"],
        edges: [["clients", "queue"], ["queue", "workers"]],
        metrics: [
          { label: "Service time", value: "12 ms", tone: "ok" },
          { label: "Queue time", value: "33 ms", tone: "warn" },
        ],
      },
      {
        title: "The queue is the tell",
        body: [
          "Requests that arrive faster than workers can finish them do not disappear — they wait. The waiting line is where latency is manufactured.",
          "Little's Law ties the three numbers together: the number of requests in the system equals arrival rate multiplied by the time each one spends inside. If 200 requests per second each take 50 ms, about 10 are in flight at any moment.",
        ],
        keyIdea: "Concurrency = arrival rate × latency. It is an identity, not an approximation.",
        active: ["clients", "queue", "workers"],
        edges: [["clients", "queue"], ["queue", "workers"]],
        metrics: [
          { label: "Arrivals", value: "200 rps", tone: "muted" },
          { label: "Latency", value: "50 ms", tone: "muted" },
          { label: "In flight", value: "10", tone: "ok" },
        ],
      },
      {
        title: "Why 70% is already busy",
        body: [
          "Utilisation is throughput divided by capacity. At 50% utilisation the queue is short. At 70% it grows. At 90% it explodes.",
          "The relationship is not linear. Queue length roughly scales with utilisation divided by one minus utilisation, so the last 10% of capacity buys you most of the waiting.",
        ],
        keyIdea: "A system running at 90% capacity does not have 10% headroom — it has almost none. Plan to peak at 60–70%.",
        active: ["queue", "workers"],
        edges: [["queue", "workers"]],
        metrics: [
          { label: "At 50% load", value: "2 in queue", tone: "ok" },
          { label: "At 80% load", value: "8 in queue", tone: "warn" },
          { label: "At 95% load", value: "38 in queue", tone: "bad" },
        ],
      },
      {
        title: "The slow dependency",
        body: [
          "One worker calls a shared store that takes 80 ms. Add ten workers and the store is now taking ten concurrent calls. Its own queue forms, and every worker's latency rises even though no worker got slower.",
          "This is the pattern behind most cascading slowdowns: the bottleneck moved one layer down and nobody looked there.",
        ],
        active: ["workers", "store"],
        edges: [["workers", "store"], ["store", "workers"]],
        metrics: [
          { label: "Store calls", value: "10 concurrent", tone: "warn" },
          { label: "Worker latency", value: "12 → 96 ms", tone: "bad" },
        ],
      },
      {
        title: "Percentiles, not averages",
        body: [
          "The average hides the users who are suffering. Report p50, p95 and p99: half your users beat p50, one in twenty beats p95, one in a hundred beats p99.",
          "A p99 of two seconds on a page that loads 50 assets means almost every page load includes something slow.",
        ],
        points: [
          "Averages blend a fast cache hit with a slow database miss into a number that describes neither.",
          "Alert on p99 and on error rate, not on the mean.",
          "Long tails usually come from retries, garbage collection, or one hot shard.",
        ],
        active: ["clients", "workers"],
        edges: [["workers", "clients"]],
        metrics: [
          { label: "p50", value: "38 ms", tone: "ok" },
          { label: "p95", value: "140 ms", tone: "warn" },
          { label: "p99", value: "900 ms", tone: "bad" },
        ],
      },
    ],
  },
  {
    slug: "capacity-math",
    moduleId: "foundations",
    title: "Capacity by Napkin",
    summary:
      "Turn a product idea into requests per second, servers and terabytes with arithmetic you can do in your head.",
    minutes: 8,
    nodes: [
      { id: "users", label: "Users", sub: "total population", lane: "client", x: 110, y: 200, icon: "user" },
      { id: "active", label: "Daily actives", sub: "share who show up", lane: "client", x: 110, y: 400, icon: "gauge" },
      { id: "rps", label: "Peak RPS", sub: "actives × actions ÷ time", lane: "edge", x: 380, y: 300, icon: "gauge", tone: "brand" },
      { id: "fleet", label: "Server fleet", sub: "peak ÷ per-server capacity", lane: "service", x: 660, y: 300, icon: "server" },
      { id: "storage", label: "Storage", sub: "writes × row size × time", lane: "data", x: 900, y: 300, icon: "db" },
    ],
    edges: [
      { from: "users", to: "active" },
      { from: "active", to: "rps" },
      { from: "rps", to: "fleet" },
      { from: "fleet", to: "storage" },
    ],
    steps: [
      {
        title: "Start from people",
        body: [
          "Every estimate starts with a population and a behaviour. Ten million registered users is not a load figure — it is a fact about a database row count.",
          "What matters for load is how many of them act, how often, and how big the action is.",
        ],
        active: ["users"],
        edges: [],
        metrics: [
          { label: "Registered", value: "10 M", tone: "muted" },
          { label: "Daily active", value: "2 M", tone: "muted" },
        ],
      },
      {
        title: "Convert to a rate",
        body: [
          "2 million daily actives each make 20 requests: 40 million requests a day. Divide by 86,400 seconds and you get about 460 requests per second on average.",
          "Averages are for storage. Traffic is for peaks, and peaks are what you provision.",
        ],
        keyIdea: "Divide a daily total by 86,400 for the average, then multiply by 2–5 for the peak.",
        active: ["users", "active", "rps"],
        edges: [["users", "active"], ["active", "rps"]],
        metrics: [
          { label: "Per day", value: "40 M", tone: "muted" },
          { label: "Average", value: "~460 rps", tone: "ok" },
          { label: "Peak ×3", value: "~1,400 rps", tone: "warn" },
        ],
      },
      {
        title: "Size one server",
        body: [
          "A single application server handling a database-backed request spends most of its time waiting, so it can hold a few hundred concurrent requests. At 20 ms each, 200 concurrent requests is 10,000 requests per second in theory.",
          "In practice assume far less: a fifth to a tenth of the theoretical number, because the database and the network are shared and nothing is uniform.",
        ],
        active: ["rps", "fleet"],
        edges: [["rps", "fleet"]],
        metrics: [
          { label: "Per server", value: "~300 rps", tone: "muted" },
          { label: "Peak", value: "1,400 rps", tone: "warn" },
          { label: "Servers", value: "5 + 2 spare", tone: "ok" },
        ],
      },
      {
        title: "Size the storage",
        body: [
          "Each write is a row: an ID, a few strings, a timestamp. Call it 1 KB with indexes and overhead. Two million writes a day is 2 GB a day, 60 GB a month.",
          "Storage grows linearly and predictably. Compute grows with traffic and is spiky. That is why storage estimates can be rough and compute estimates cannot.",
        ],
        points: [
          "1 KB × 1 M writes/day ≈ 1 GB/day ≈ 365 GB/year.",
          "Keep a compression and retention policy in the estimate from day one.",
          "Replication multiplies storage by the number of copies.",
        ],
        active: ["fleet", "storage"],
        edges: [["fleet", "storage"]],
        metrics: [
          { label: "Row size", value: "~1 KB", tone: "muted" },
          { label: "Per year", value: "~730 GB", tone: "warn" },
          { label: "With 3 replicas", value: "~2.2 TB", tone: "bad" },
        ],
      },
      {
        title: "The numbers that decide architecture",
        body: [
          "At a few hundred requests per second, one machine and one database will carry you for a long time. At tens of thousands, the shape of the system has to change.",
          "The estimate's job is not precision. It is to tell you which regime you are in before you build for the wrong one.",
        ],
        keyIdea: "An estimate that is right within a factor of ten is enough to choose an architecture. It is never enough to size a purchase order.",
        active: ["rps", "fleet", "storage"],
        edges: [["rps", "fleet"], ["fleet", "storage"]],
        metrics: [
          { label: "1 server", value: "≤ 500 rps", tone: "ok" },
          { label: "A few servers", value: "≤ 5,000 rps", tone: "warn" },
          { label: "Sharded", value: "> 10,000 rps", tone: "bad" },
        ],
      },
      {
        title: "Write it down",
        body: [
          "A capacity note that fits on a napkin is worth more than a spreadsheet nobody opens. State the assumptions, the arithmetic, and the conclusion.",
          "When the assumption changes — and it will — the note tells you exactly which conclusion to revisit.",
        ],
        points: [
          "Assumptions: population, activity, payload size, peak factor.",
          "Arithmetic: the four divisions.",
          "Conclusion: servers, storage, and the first thing that will break.",
        ],
        active: ["users", "active", "rps", "fleet", "storage"],
        edges: [
          ["users", "active"],
          ["active", "rps"],
          ["rps", "fleet"],
          ["fleet", "storage"],
        ],
        metrics: [
          { label: "Peak RPS", value: "1,400", tone: "muted" },
          { label: "Servers", value: "7", tone: "muted" },
          { label: "Storage/yr", value: "2.2 TB", tone: "muted" },
        ],
        note: "Teaching model: replace these figures with your own product's numbers.",
      },
    ],
  },
];
