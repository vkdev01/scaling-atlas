import type { Lesson } from "./types";

export const reliabilityLessons: Lesson[] = [
  {
    slug: "failover",
    moduleId: "reliability",
    title: "Redundancy & Failover",
    summary:
      "Everything fails eventually. Design so that no single failure — machine, zone or network — takes the product down.",
    minutes: 8,
    nodes: [
      { id: "client", label: "Client", sub: "keeps retrying", lane: "client", x: 110, y: 300, icon: "user" },
      { id: "lb", label: "Load balancer", sub: "health-checked", lane: "edge", x: 370, y: 300, icon: "lb" },
      { id: "a", label: "Server A", sub: "zone 1", lane: "service", x: 640, y: 170, icon: "server", tone: "ok" },
      { id: "b", label: "Server B", sub: "zone 2", lane: "service", x: 640, y: 420, icon: "server", tone: "bad" },
      { id: "primary", label: "Primary DB", sub: "zone 1", lane: "data", x: 890, y: 170, icon: "db" },
      { id: "replica", label: "Replica", sub: "promoted on failure", lane: "data", x: 890, y: 420, icon: "replica" },
    ],
    edges: [
      { from: "client", to: "lb" },
      { from: "lb", to: "a" },
      { from: "lb", to: "b", dashed: true },
      { from: "a", to: "primary" },
      { from: "primary", to: "replica", dashed: true },
      { from: "replica", to: "a", curve: 44, dashed: true },
    ],
    steps: [
      {
        title: "Assume it breaks",
        body: [
          "Disks fail, instances are reclaimed, a zone loses power, a network provider drops a route. None of these are rare at scale — they are routine.",
          "Reliability is not the absence of failure. It is the property that a failure is absorbed by a spare instead of reaching a user.",
        ],
        keyIdea: "Design for the failure you can name. If you cannot say what happens when a component dies, you do not know your system.",
        active: ["client", "lb", "a"],
        edges: [["client", "lb"], ["lb", "a"]],
      },
      {
        title: "Remove the single point of failure",
        body: [
          "A single point of failure is any component whose death takes the service with it. The first one to find is usually the database, the second is the load balancer, the third is DNS.",
          "Each one gets the same treatment: run at least two, put them in different failure domains, and make something decide which one is live.",
        ],
        active: ["client", "lb", "a", "b"],
        edges: [["client", "lb"], ["lb", "a"], ["lb", "b"]],
        metrics: [
          { label: "Single points", value: "3", tone: "bad" },
          { label: "After", value: "0", tone: "ok" },
        ],
      },
      {
        title: "One zone is one machine",
        body: [
          "Two servers in the same availability zone share a power feed, a network switch and often a hypervisor. When the zone goes, both go.",
          "Redundancy only counts when the copies fail independently. Spread across zones first, then regions if the recovery time target demands it.",
        ],
        points: [
          "Zone failure: minutes to hours. Survive with a second zone.",
          "Region failure: rare, but total. Survive with a warm copy elsewhere.",
          "Shared dependencies — DNS, identity, config — fail globally. Check them too.",
        ],
        active: ["a", "b", "primary", "replica"],
        edges: [["lb", "a"], ["lb", "b"], ["primary", "replica"]],
        metrics: [
          { label: "Zones", value: "2", tone: "ok" },
          { label: "Shared fate", value: "none", tone: "ok" },
        ],
      },
      {
        title: "Detect, then switch",
        body: [
          "Failover needs a detector and a decision. The detector is a health check; the decision is who gets promoted, and it must not require a human at 3 a.m.",
          "Promotion is the dangerous part. Two nodes both believing they are primary will accept conflicting writes — **split brain**. Systems solve this with quorum: a majority must agree before a leader exists.",
        ],
        keyIdea: "Failover without a quorum is how you get two primaries and two histories.",
        active: ["lb", "b", "primary", "replica"],
        edges: [["lb", "b"], ["primary", "replica"], ["replica", "a"]],
        metrics: [
          { label: "Detection", value: "~15 s", tone: "warn" },
          { label: "Promotion", value: "~20 s", tone: "warn" },
          { label: "Split brain", value: "prevented by quorum", tone: "ok" },
        ],
        note: "Dashed lines: a failing node, replication, and reads failing over to the promoted replica.",
      },
      {
        title: "What the user sees",
        body: [
          "The honest measure of reliability is the user's experience of the outage, not the server's. Twenty seconds of failed requests is an incident; twenty seconds of retried requests is a blip.",
          "So clients must retry with backoff and jitter, and writes must be idempotent so a retry cannot double-charge anyone.",
        ],
        active: ["client", "lb"],
        edges: [["client", "lb"]],
        metrics: [
          { label: "Without retry", value: "visible errors", tone: "bad" },
          { label: "With retry + jitter", value: "absorbed", tone: "ok" },
        ],
      },
      {
        title: "Rehearse it",
        body: [
          "An untested failover is a hypothesis. Kill a node during business hours on purpose, watch what happens, and fix what surprises you.",
          "Teams that rehearse discover the real problems: the health check that never fails, the replica nobody ever promoted, the runbook with a stale hostname.",
        ],
        keyIdea: "You do not have redundancy until you have failed over on purpose and watched it work.",
        active: ["client", "lb", "a", "b", "primary", "replica"],
        edges: [
          ["client", "lb"],
          ["lb", "a"],
          ["a", "primary"],
          ["primary", "replica"],
        ],
        metrics: [
          { label: "Rehearsed", value: "quarterly", tone: "muted" },
          { label: "Mean time to recover", value: "measured, not assumed", tone: "ok" },
        ],
      },
    ],
  },
];
