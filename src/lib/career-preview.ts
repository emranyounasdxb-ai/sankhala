import type { Metadata } from "next";
import { createPageMetadata } from "./page-metadata";

export type PreviewJob = {
  slug: string;
  reference: string;
  title: string;
  emirate: string;
  type: "Full time" | "Contract";
  department: string;
  origin: "sankhala" | "client";
  closed: boolean;
  summary: string;
  responsibilities: string[];
  requirements: string[];
};

// Fictional fixtures for interface review only. Never publish as vacancies.
export const careerEmirates = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
];
export const previewJobs: PreviewJob[] = [
  {
    slug: "sample-sales-associate",
    reference: "DEMO-001",
    title: "Sales associate",
    emirate: "Dubai",
    type: "Full time",
    department: "Customer service",
    origin: "client",
    closed: false,
    summary:
      "A sample customer-facing role used to demonstrate the recruitment journey.",
    responsibilities: [
      "Understand customer needs and explain available products.",
      "Maintain accurate records and coordinate with the team.",
      "Support an organised, welcoming customer experience.",
    ],
    requirements: [
      "Clear communication and customer service skills.",
      "Relevant sales experience for the role.",
      "Ability to work with a team and manage daily priorities.",
    ],
  },
  {
    slug: "sample-office-coordinator",
    reference: "DEMO-002",
    title: "Office coordinator",
    emirate: "Abu Dhabi",
    type: "Contract",
    department: "Administration",
    origin: "sankhala",
    closed: false,
    summary:
      "A sample administration role showing a different location and employment type.",
    responsibilities: [
      "Coordinate schedules and everyday office tasks.",
      "Organise documents and support internal communication.",
    ],
    requirements: [
      "Strong organisation and attention to detail.",
      "Confidence using everyday office software.",
    ],
  },
  {
    slug: "sample-warehouse-assistant",
    reference: "DEMO-003",
    title: "Warehouse assistant",
    emirate: "Sharjah",
    type: "Full time",
    department: "Operations",
    origin: "client",
    closed: true,
    summary:
      "A closed sample role demonstrating how unavailable opportunities are presented.",
    responsibilities: [
      "Support stock organisation and accurate inventory records.",
      "Follow workplace procedures and coordinate with supervisors.",
    ],
    requirements: [
      "Attention to detail and clear communication.",
      "Relevant experience for the role's responsibilities.",
    ],
  },
];

export function previewMetadata(title: string, path: string): Metadata {
  return {
    ...createPageMetadata(
      `Design preview: ${title}`,
      "Fictional sample roles and application screens for Sankhala interface review. No live vacancies or submissions.",
      path,
    ),
    robots: { index: false, follow: false },
  };
}

export function getPreviewJob(slug: string) {
  return previewJobs.find((job) => job.slug === slug);
}
