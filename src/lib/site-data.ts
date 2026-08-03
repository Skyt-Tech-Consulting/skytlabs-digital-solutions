export const COMPANY = {
  name: "SkytLabs Limited",
  short: "SkytLabs",
  tagline: "Engineering the digital backbone of African enterprise",
  email: "info@skytlabs.com",
  address: "Plot 4, Church Street, Magodo GRA, Lagos, Nigeria",
} as const;

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/products", label: "Products" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
] as const;

export type ServiceGroup = {
  id: string;
  group: string;
  blurb: string;
  services: { title: string; description: string }[];
};

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    id: "build",
    group: "Build & Assure",
    blurb: "Software engineered to production standards, then proven before it ships.",
    services: [
      {
        title: "Software Development & Deployment",
        description:
          "Custom web, mobile and back-office systems designed around your operating model, delivered through disciplined release pipelines.",
      },
      {
        title: "Quality Assurance & Testing",
        description:
          "Functional, regression, performance and user-acceptance testing that catches defects long before your customers do.",
      },
    ],
  },
  {
    id: "strategy",
    group: "Strategy & Architecture",
    blurb: "Decisions made once, correctly, so the next decade of technology compounds.",
    services: [
      {
        title: "IT Strategy & Digital Transformation",
        description:
          "Roadmaps that tie technology investment to measurable business outcomes, sequenced by value and feasibility.",
      },
      {
        title: "Enterprise Architecture & Solution Design",
        description:
          "Reference architectures, integration blueprints and solution designs that keep a growing estate coherent.",
      },
    ],
  },
  {
    id: "platform",
    group: "Platform & Protection",
    blurb: "Resilient foundations, locally grounded and globally connected.",
    services: [
      {
        title: "Infrastructure & Cloud Services",
        description:
          "Local and global cloud landing zones, migrations, hybrid estates and cost-optimised infrastructure operations.",
      },
      {
        title: "Cybersecurity & Risk Management",
        description:
          "Security assessments, controls implementation, identity governance and risk frameworks aligned to regulation.",
      },
    ],
  },
  {
    id: "data",
    group: "Data & Enterprise Applications",
    blurb: "Turning transactional noise into decisions leadership can act on.",
    services: [
      {
        title: "Data & Analytics",
        description:
          "Data platforms, warehousing, reporting and executive dashboards that make performance visible in real time.",
      },
      {
        title: "ERP & Enterprise Application Solutions",
        description:
          "Selection, implementation, extension and support of ERP and core enterprise applications across functions.",
      },
    ],
  },
  {
    id: "run",
    group: "Automate & Operate",
    blurb: "Removing manual effort, then keeping everything running.",
    services: [
      {
        title: "Business Automation",
        description:
          "Workflow and process automation that removes paper, queues and rework from day-to-day operations.",
      },
      {
        title: "IT Operations & DevOps",
        description:
          "CI/CD, observability, incident response and managed operations for platforms that must not go down.",
      },
    ],
  },
];

export const ALL_SERVICES = SERVICE_GROUPS.flatMap((g) => g.services);
