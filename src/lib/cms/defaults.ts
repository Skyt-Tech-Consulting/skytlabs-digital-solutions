/**
 * Default content for every CMS-managed page.
 *
 * These values are the approved site copy at the time the CMS was introduced.
 * They are used until an administrator publishes an edited version, and they
 * also define the *shape* of each page's content — the admin editor builds its
 * form from these objects, so every field here is editable in the admin.
 */
import heroOffice from "@/assets/hero-office.jpg";
import aiCallCenter from "@/assets/ai-call-center.jpg";
import aboutTeam from "@/assets/about-team.jpg";
import digitalTransformation from "@/assets/digital-transformation.jpg";
import logoDark from "@/assets/Skytlab logo M2.png";
import logoLight from "@/assets/Skytlab logo M1.png";
import type { SeoFields } from "./types";

const seo = (title: string, description: string, slug: string): SeoFields => ({
  title,
  description,
  slug,
  ogImage: { src: "", alt: "" },
  noindex: false,
  canonical: "",
  structuredData: "",
});

/* ------------------------------------------------------------------ */
/* Site-wide settings (header, footer, navigation, company details)    */
/* ------------------------------------------------------------------ */

export const siteDefaults = {
  company: {
    name: "SkytLabs Limited",
    shortName: "SkytLabs",
    tagline: "Engineering the digital backbone of African enterprise",
    email: "info@skytlabs.com",
    phone: "",
    address: "Plot 4, Church Street, Magodo GRA, Lagos, Nigeria",
    streetAddress: "Plot 4, Church Street, Magodo GRA",
    city: "Lagos",
    countryCode: "NG",
  },
  header: {
    logo: { src: logoDark, alt: "SkytLabs Limited" },
    cta: { label: "Talk to us", href: "/contact" },
  },
  navigation: {
    home: "Home",
    about: "About",
    services: "Services",
    products: "Products",
    projects: "Projects",
    blog: "Insights",
    contact: "Contact",
  },
  footer: {
    logo: { src: logoLight, alt: "SkytLabs Limited" },
    blurb:
      "SkytLabs Limited is a Nigerian IT consulting firm building, securing and operating the systems that enterprises run on — from strategy through to production support.",
    companyHeading: "Company",
    capabilitiesHeading: "Capabilities",
    copyrightName: "SkytLabs Limited",
    location: "Lagos, Nigeria",
  },
  seo: {
    siteUrl: "",
    siteName: "SkytLabs Limited",
    defaultTitle: "SkytLabs Limited — IT Consulting in Lagos, Nigeria",
    defaultDescription:
      "SkytLabs Limited is a Nigerian IT consulting firm delivering software, automation, cloud, cybersecurity and data solutions for enterprises.",
    defaultOgImage: { src: heroOffice, alt: "SkytLabs consultants in a Lagos office" },
    twitterHandle: "",
  },
};

export type SiteSettings = typeof siteDefaults;

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

const homeContent = {
  hero: {
    eyebrow: "IT Consulting · Lagos, Nigeria",
    titleLead: "Engineering the digital backbone of",
    titleHighlight: "African enterprise",
    intro:
      "SkytLabs Limited partners with organisations to design, build, secure and operate the technology their business depends on — from enterprise architecture and cloud infrastructure to automation, analytics and AI.",
    backgroundImage: {
      src: heroOffice,
      alt: "SkytLabs consultants reviewing analytics dashboards in a Lagos office at dusk",
    },
    primaryCta: { label: "Explore our services", href: "/services" },
    secondaryCta: { label: "Speak with a consultant", href: "/contact" },
  },
  whatWeDo: {
    eyebrow: "What we do",
    title: "Ten disciplines, one delivery team",
    intro:
      "Strategy, engineering, infrastructure, security and operations under a single accountable partner — so nothing falls between vendors.",
    link: { label: "All ten services", href: "/services" },
    highlights: [
      {
        icon: "Code2",
        title: "Software Development & Deployment",
        body: "Systems built around how your business actually operates, shipped through disciplined release pipelines.",
      },
      {
        icon: "Workflow",
        title: "Business Automation",
        body: "Paper, queues and rework removed from core processes so teams spend their time on judgement, not admin.",
      },
      {
        icon: "ShieldCheck",
        title: "Cybersecurity & Risk Management",
        body: "Controls, identity governance and risk frameworks that satisfy regulators and survive real attackers.",
      },
    ],
  },
  whySkytlabs: {
    eyebrow: "Why SkytLabs",
    title: "A consulting partner that carries the delivery risk",
    intro:
      "Most technology programmes fail on execution, not on ideas. We build teams that stay accountable from the first workshop through to production support.",
    differentiators: [
      {
        icon: "BarChart3",
        title: "Outcomes before technology",
        body: "Every engagement starts with the business metric that has to move. Architecture follows the outcome, not the other way round.",
      },
      {
        icon: "Cloud",
        title: "Local context, global standards",
        body: "We design for Nigerian realities — connectivity, regulation, cost — while holding to international engineering practice.",
      },
      {
        icon: "ShieldCheck",
        title: "We stay after go-live",
        body: "Delivery is not the finish line. Our DevOps and operations teams keep platforms secure, observable and available.",
      },
    ],
  },
  product: {
    eyebrow: "Our product",
    title: "AI Call Center",
    body: "A conversational AI solution that reaches your target audience at scale — running natural voice conversations, capturing every response, and surfacing the results in a rich dashboard built for decision-making.",
    points: [
      "Automated outbound conversations across thousands of contacts",
      "Structured capture of every response and outcome",
      "Live dashboard for campaign performance and sentiment",
      "Insight ready for the next operational decision",
    ],
    cta: { label: "See the product", href: "/products" },
    image: {
      src: aiCallCenter,
      alt: "AI Call Center voice waveform feeding a live analytics dashboard",
    },
  },
  ctaBanner: {
    title: "Let's scope your next initiative",
    body: "Tell us the outcome you need. We will come back with an approach, a timeline and the team that delivers it.",
    button: { label: "Start a conversation", href: "/contact" },
  },
};

const aboutContent = {
  hero: {
    eyebrow: "About us",
    title: "A Nigerian consulting firm built for enterprise-grade delivery",
    intro:
      "SkytLabs Limited brings strategy, engineering and operations together so organisations can modernise without stalling the business that funds the modernisation.",
  },
  whoWeAre: {
    eyebrow: "Who we are",
    title: "Consultants who also build, ship and operate",
    paragraphs: [
      "SkytLabs Limited is an IT consulting company headquartered in Lagos, Nigeria. We work with enterprises, public institutions and fast-scaling businesses that need more than advice — they need systems in production.",
      "Our practice spans ten disciplines, from IT strategy and enterprise architecture through software engineering, cloud infrastructure, cybersecurity, data and analytics, ERP and DevOps. Because those capabilities sit under one roof, a client gets a single accountable partner instead of a chain of vendors pointing at each other.",
      "We design for Nigerian operating realities — intermittent connectivity, regulatory obligations, tight cost envelopes — while holding to the engineering standards expected of any global delivery team.",
    ],
    image: {
      src: aboutTeam,
      alt: "SkytLabs consultants reviewing an enterprise architecture diagram",
    },
  },
  howWeWork: {
    eyebrow: "How we work",
    title: "Three commitments we hold on every engagement",
    values: [
      {
        icon: "Target",
        title: "Outcome ownership",
        body: "We measure our work by the business result it produces, not the hours it consumes or the documents it generates.",
      },
      {
        icon: "Compass",
        title: "Architectural honesty",
        body: "We recommend the simplest system that will hold, and we say plainly when a proposed direction will not scale.",
      },
      {
        icon: "Handshake",
        title: "Long partnerships",
        body: "Our clients keep us because we stay through go-live, hypercare and the unglamorous years of operation that follow.",
      },
    ],
  },
  ctaBanner: {
    title: "Work with SkytLabs",
    body: "Whether you are planning a transformation programme or need a delivery team that can execute one, we would like to hear about it.",
    button: { label: "Start a conversation", href: "/contact" },
  },
};

const servicesContent = {
  hero: {
    eyebrow: "Services",
    title: "Ten disciplines that cover the full technology lifecycle",
    intro:
      "From the first strategy workshop to the on-call rotation that keeps a platform available, SkytLabs covers the whole path — with one team accountable for the outcome.",
  },
  serviceGroups: [
    {
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
  ],
  ctaBanner: {
    title: "Not sure which capability you need?",
    body: "Describe the problem in plain terms. We will tell you which of these disciplines applies — and which you can skip.",
    button: { label: "Start a conversation", href: "/contact" },
  },
};

const productsContent = {
  hero: {
    eyebrow: "Products",
    title: "AI Call Center",
    intro:
      "A conversational AI solution that helps your organisation call its target audience at scale — with a rich dashboard for responses and decision-making.",
  },
  problem: {
    image: {
      src: aiCallCenter,
      alt: "AI Call Center conversational waveform connected to an analytics dashboard",
    },
    eyebrow: "The problem it solves",
    title: "Human capacity should not cap your outreach",
    paragraphs: [
      "Traditional call centres scale by hiring. Campaigns get trimmed to fit the roster, notes are inconsistent, and the results arrive too late to change anything.",
      "AI Call Center removes that ceiling. Conversations run concurrently, every response is captured in a structured form, and the dashboard updates while the campaign is still live — so you can adjust the message rather than review it afterwards.",
    ],
    useCases: [
      "Customer satisfaction and feedback campaigns",
      "Collections, renewals and payment reminders",
      "Lead qualification and appointment setting",
      "Field surveys and member outreach at population scale",
    ],
  },
  capabilities: {
    eyebrow: "Capabilities",
    title: "What comes with AI Call Center",
    features: [
      {
        icon: "PhoneCall",
        title: "Outbound at scale",
        body: "Reach thousands of contacts with natural, on-brand voice conversations that run concurrently instead of queueing behind agents.",
      },
      {
        icon: "MessageSquare",
        title: "Conversational, not scripted",
        body: "The assistant understands answers, handles follow-up questions and adapts the flow rather than reading a rigid script.",
      },
      {
        icon: "BarChart3",
        title: "Rich response dashboard",
        body: "Every call is captured, categorised and charted — completion rates, sentiment, objections and outcomes in one view.",
      },
      {
        icon: "Gauge",
        title: "Decision-ready reporting",
        body: "Results roll up into the metrics leadership actually uses, so the next campaign decision is made on evidence.",
      },
      {
        icon: "Users",
        title: "Audience segmentation",
        body: "Target lists by segment, region or lifecycle stage and compare how each cohort responds to the same conversation.",
      },
      {
        icon: "Sparkles",
        title: "Configured to your process",
        body: "We tune the conversation design, escalation rules and integrations to your existing CRM and operating procedures.",
      },
    ],
    cta: { label: "Request a demo", href: "/contact" },
  },
  ctaBanner: {
    title: "See AI Call Center on your own campaign",
    body: "Send us a sample audience and objective, and we will walk you through how the conversation and dashboard would work for it.",
    button: { label: "Start a conversation", href: "/contact" },
  },
};

const projectsContent = {
  hero: {
    eyebrow: "Projects",
    title: "Digital Transformation Schedule",
    intro:
      "A multi-phase programme automating core internal processes for an organisation, delivering measurable operational efficiency across HR, assets and workforce management.",
  },
  engagement: {
    eyebrow: "The engagement",
    title: "One schedule, several processes, sequenced by value",
    paragraphs: [
      "The client operated critical internal processes on paper forms, email approvals and departmental spreadsheets. Requests stalled without anyone owning them, asset records drifted from reality, and management had no reliable view of either.",
      "SkytLabs built a digital transformation schedule: a prioritised sequence of process automations, each delivered as a working application and adopted before the next began. That kept disruption low while the estate steadily modernised.",
    ],
    image: {
      src: digitalTransformation,
      alt: "Connected enterprise systems and automated process flows",
    },
  },
  applications: {
    eyebrow: "Applications delivered",
    title: "The systems that came out of the programme",
    modules: [
      {
        icon: "UserCog",
        title: "Staff Management",
        body: "Central employee profiling with role, department, reporting line and document records replacing scattered spreadsheets.",
      },
      {
        icon: "CalendarCheck",
        title: "Employee Performance Review",
        body: "Structured review cycles with objectives, ratings and sign-off trails, so appraisal outcomes are traceable and on time.",
      },
      {
        icon: "Boxes",
        title: "Asset Management",
        body: "Full asset register covering assignment, movement, maintenance and disposal, with accountability at the individual level.",
      },
      {
        icon: "Plane",
        title: "Human Resource Management",
        body: "Leave application, travel desk and everyday HR requests routed through configurable approval workflows.",
      },
    ],
  },
  outcome: {
    eyebrow: "Outcome",
    title: "Operational efficiency, made visible",
    outcomes: [
      {
        title: "Manual steps removed",
        body: "Paper forms and email chains replaced by workflows with defined owners, timers and audit trails.",
      },
      {
        title: "Single source of truth",
        body: "Staff, asset and request data live in one place instead of being reconciled across departmental spreadsheets.",
      },
      {
        title: "Visibility for management",
        body: "Approval backlogs, asset positions and review completion are visible without asking anyone for a status report.",
      },
    ],
  },
  ctaBanner: {
    title: "Planning a transformation of your own?",
    body: "We can help you sequence it — which processes to automate first, and which to leave alone until the foundations are in place.",
    button: { label: "Start a conversation", href: "/contact" },
  },
};

const contactContent = {
  hero: {
    eyebrow: "Contact",
    title: "Tell us what you are trying to build",
    intro:
      "Send us the outcome you need and any constraints you are working within. We will respond with an approach and the right people to walk you through it.",
  },
  details: {
    eyebrow: "Reach us",
    title: "SkytLabs Limited, Lagos",
    officeLabel: "Office",
    emailLabel: "Email",
    phoneLabel: "Phone",
    hoursLabel: "Hours",
    hours: "Monday to Friday, 9:00 – 18:00 WAT",
    mapLocation: "Church Street, Magodo GRA, Lagos, Nigeria",
    mapTitle: "SkytLabs Limited office location in Magodo GRA, Lagos",
  },
  form: {
    title: "Send us a message",
    intro: "Fill in the form and our team will get back to you, usually within one business day.",
    nameLabel: "Your name",
    namePlaceholder: "Adaeze Okonkwo",
    companyLabel: "Company",
    companyPlaceholder: "Organisation name",
    emailLabel: "Email address",
    emailPlaceholder: "you@company.com",
    phoneLabel: "Phone number (optional)",
    phonePlaceholder: "+234 800 000 0000",
    messageLabel: "How can we help?",
    messagePlaceholder:
      "Describe the outcome you are after, any deadlines, and systems already in place.",
    submitLabel: "Send message",
    successTitle: "Thank you — your message has been sent",
    successBody: "We have received your enquiry and a member of our team will be in touch shortly.",
    errorMessage: "Sorry, we could not send your message. Please try again, or email us directly.",
  },
};

const blogContent = {
  hero: {
    eyebrow: "Insights",
    title: "Perspectives on technology, delivery and transformation",
    intro:
      "Practical thinking from the SkytLabs team on strategy, engineering, security, data and the realities of running technology in African enterprise.",
  },
  listing: {
    emptyTitle: "Articles are on their way",
    emptyBody: "We are preparing our first insights. Check back soon.",
    readMoreLabel: "Read article",
  },
  article: {
    backLabel: "All insights",
    relatedTitle: "More insights",
  },
  ctaBanner: {
    title: "Have a challenge you want to talk through?",
    body: "Tell us the outcome you need. We will come back with an approach, a timeline and the team that delivers it.",
    button: { label: "Start a conversation", href: "/contact" },
  },
};

export const pageDefaults = {
  home: {
    content: homeContent,
    seo: seo(
      "SkytLabs Limited — IT Consulting & Digital Transformation, Lagos",
      "SkytLabs Limited helps Nigerian enterprises build software, automate operations, secure infrastructure and turn data into decisions.",
      "",
    ),
  },
  about: {
    content: aboutContent,
    seo: seo(
      "About SkytLabs Limited — Nigerian IT Consulting Firm",
      "SkytLabs Limited is a Lagos-based IT consulting firm helping enterprises modernise, automate and secure the technology their business runs on.",
      "about",
    ),
  },
  services: {
    content: servicesContent,
    seo: seo(
      "IT Consulting Services — SkytLabs Limited, Lagos",
      "Software development, business automation, IT strategy, enterprise architecture, cloud, cybersecurity, data, ERP, QA and DevOps services from SkytLabs Limited.",
      "services",
    ),
  },
  products: {
    content: productsContent,
    seo: seo(
      "AI Call Center — Conversational AI Product by SkytLabs",
      "AI Call Center by SkytLabs is a conversational AI solution that reaches your target audience at scale and reports every response in a decision-ready dashboard.",
      "products",
    ),
  },
  projects: {
    content: projectsContent,
    seo: seo(
      "Projects — Enterprise Digital Transformation | SkytLabs",
      "How SkytLabs automated staff management, asset management and HR processes for an organisation to deliver measurable operational efficiency.",
      "projects",
    ),
  },
  contact: {
    content: contactContent,
    seo: seo(
      "Contact SkytLabs Limited — Magodo GRA, Lagos",
      "Reach SkytLabs Limited at Plot 4, Church Street, Magodo GRA, Lagos or email info@skytlabs.com to discuss your technology programme.",
      "contact",
    ),
  },
  blog: {
    content: blogContent,
    seo: seo(
      "Insights — SkytLabs Limited",
      "Articles and perspectives from SkytLabs Limited on IT strategy, software delivery, cybersecurity, data and digital transformation in Nigeria.",
      "blog",
    ),
  },
  site: {
    content: siteDefaults,
    seo: seo("", "", ""),
  },
};

export type PageKey = keyof typeof pageDefaults;
export type PageContent<K extends PageKey> = (typeof pageDefaults)[K]["content"];
