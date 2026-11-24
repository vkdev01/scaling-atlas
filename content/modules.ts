import type { Module } from "./types";

export const modules: Module[] = [
  {
    id: "foundations",
    title: "Foundations",
    blurb: "What actually happens between a keypress and a painted page, and what it costs.",
    icon: "globe",
  },
  {
    id: "scaling",
    title: "Scaling",
    blurb: "One server becomes many. Front doors, statelessness and the fastest byte.",
    icon: "lb",
  },
  {
    id: "data",
    title: "Data & Storage",
    blurb: "Where the bytes live, how they are found, and what happens when one machine is not enough.",
    icon: "db",
  },
  {
    id: "communication",
    title: "Communication",
    blurb: "Machines talking to machines without making anyone wait.",
    icon: "queue",
  },
  {
    id: "reliability",
    title: "Reliability",
    blurb: "Everything fails. Design so that no single failure is fatal.",
    icon: "monitor",
  },
  {
    id: "systems",
    title: "Whole Systems",
    blurb: "Put the pieces together into something you could actually defend in a design review.",
    icon: "router",
  },
];
