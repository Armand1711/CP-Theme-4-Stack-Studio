// All marketing copy lives here so pages stay layout-only.
// Bracketed strings are intentional launch placeholders (see DESIGN.md).

export type ServiceKey = "web" | "software" | "uiux" | "mobile";

export type IncludedItem = { id: string; title: string; body: string };

export type CaseStudy = {
  title: string;
  summary: string;
  tags: string[];
};

export type Service = {
  key: ServiceKey;
  slug: string;
  number: string;
  name: string;
  navLabel: string;
  /** H1 is rendered as `titleLead <em>titleEm</em>`. */
  titleLead: string;
  titleEm: string;
  lede: string;
  /** Shorter line used in the home page's service list. */
  summary: string;
  included: IncludedItem[];
  caseStudy: CaseStudy | null;
  /** Heading + intro for the page's interactive signature section. Heading renders as `lead <em>em</em>`. */
  demo: { lead: string; em: string; lede: string };
};

export const gcSolar: CaseStudy = {
  title: "GC Solar: website redesign and CRM integration",
  summary:
    "A full website rebuild for a solar energy company, with Zoho CRM wired directly into the site for lead capture and live chat.",
  tags: ["Zoho CRM integration", "Live chat + lead capture", "Built on Next.js"],
};

export const services: Service[] = [
  {
    key: "web",
    slug: "web-development",
    number: "01",
    name: "Web Development",
    navLabel: "Web Dev",
    titleLead: "Web",
    titleEm: "Development",
    lede: "Marketing sites and web apps built for conversion and speed. Designed, built, and deployed as one job, not three handoffs.",
    summary: "Marketing sites and web apps built for conversion and speed.",
    included: [
      { id: "marketing", title: "Marketing & brochure sites", body: "Fast, conversion-focused sites for outreach and brand presence." },
      { id: "webapps", title: "Web applications", body: "Custom web apps with real functionality, not just static pages." },
      { id: "ecommerce", title: "E-commerce", body: "Storefronts with checkout, inventory and payment integration." },
      { id: "perf-seo", title: "Performance & SEO", body: "Sites that load fast and rank, not just look good." },
    ],
    caseStudy: gcSolar,
    demo: { lead: "Built to fit", em: "every screen.", lede: "Drag the handle or pick a device. The example site reflows the way every site we ship does." },
  },
  {
    key: "software",
    slug: "software-development",
    number: "02",
    name: "Software Development",
    navLabel: "Software",
    titleLead: "Software",
    titleEm: "Development",
    lede: "Custom business software and internal tools, built to fit how your team actually works, not the other way around.",
    summary: "Custom business software and internal tools, built to fit how you work.",
    included: [
      { id: "tools", title: "Internal tools & dashboards", body: "Custom tools built around how your team already works." },
      { id: "apis", title: "APIs & integrations", body: "Connect your systems so data moves without manual work." },
      { id: "legacy", title: "Legacy system modernization", body: "Rebuild aging systems without breaking what already works." },
      { id: "automation", title: "Workflow automation", body: "Cut manual steps out of repetitive business processes." },
    ],
    caseStudy: null,
    demo: { lead: "Watch the busywork", em: "disappear.", lede: "Press run to send a new enquiry through a pipeline like the ones we automate. Drag the steps around if you like." },
  },
  {
    key: "uiux",
    slug: "ui-ux-design",
    number: "03",
    name: "UI/UX Design",
    navLabel: "UI/UX",
    titleLead: "UI/UX",
    titleEm: "Design",
    lede: "Interfaces designed and tested before a single line of code ships.",
    summary: "Interfaces designed and tested before a line of code ships.",
    included: [
      { id: "product", title: "Product design", body: "End-to-end design for web and mobile products." },
      { id: "systems", title: "Design systems", body: "Reusable components and tokens that keep every screen consistent." },
      { id: "research", title: "User research & testing", body: "Real user feedback before you commit to a direction." },
      { id: "prototyping", title: "Prototyping", body: "Clickable prototypes to validate ideas before a line of code ships." },
    ],
    caseStudy: null,
    demo: { lead: "From wireframe", em: "to finished.", lede: "Drag across the screen to compare the same booking flow before and after design." },
  },
  {
    key: "mobile",
    slug: "mobile-apps",
    number: "04",
    name: "Desktop & Mobile Apps",
    navLabel: "Mobile",
    titleLead: "Desktop &",
    titleEm: "Mobile Apps",
    lede: "Cross-platform apps for the devices your team already uses.",
    summary: "Cross-platform apps for the devices your team already uses.",
    included: [
      { id: "native", title: "iOS & Android apps", body: "Native-feeling apps built for both major platforms." },
      { id: "cross", title: "Cross-platform (React Native)", body: "One codebase, shipped to iOS and Android together." },
      { id: "desktop", title: "Desktop applications", body: "Windows and macOS apps for internal or client-facing tools." },
      { id: "stores", title: "App store deployment & maintenance", body: "Submission, updates and ongoing support after launch." },
    ],
    caseStudy: null,
    demo: { lead: "Made to feel right", em: "in the hand.", lede: "Drag the sheet up, flick it down. It tracks your finger, carries your momentum and settles like a native app." },
  },
];

export const serviceHref = (s: Service) => `/services/${s.slug}`;

export const getServiceBySlug = (slug: string) => services.find((s) => s.slug === slug);

export const processSteps = ["Discover", "Design", "Build", "Launch"];

export type PlanTier = {
  id: "starter" | "growth" | "team";
  name: string;
  blurb: string;
  price: string;
  facts: { label: string; value: string }[];
};

export const plans: PlanTier[] = [
  {
    id: "starter",
    name: "Starter / Project",
    blurb: "A single fixed-scope project, quoted up front.",
    price: "[From project quote]",
    facts: [
      { label: "Ideal for", value: "a single site, app, or design job" },
      { label: "Engagement", value: "project-based, no ongoing commitment" },
    ],
  },
  {
    id: "growth",
    name: "Growth Retainer",
    blurb: "Ongoing development support, part-time team integration.",
    price: "R30,000 / mo",
    facts: [
      { label: "Ideal for", value: "a steady stream of features and fixes" },
      { label: "Engagement", value: "monthly, part-time developer capacity" },
      { label: "Includes", value: "[add allocated hours per month]" },
    ],
  },
  {
    id: "team",
    name: "Full Team Retainer",
    blurb: "A dedicated dev team embedded in your business, full-time.",
    price: "R80,000 / mo",
    facts: [
      { label: "Ideal for", value: "teams that depend on shipping software continuously" },
      { label: "Engagement", value: "monthly, full-team capacity across all four services" },
      { label: "Includes", value: "[add team composition / hours]" },
    ],
  },
];

export const faqs = [
  { q: "[FAQ question, e.g. how does billing work?]", a: "[Answer placeholder]" },
  { q: "[FAQ question, e.g. can I change plans later?]", a: "[Answer placeholder]" },
  { q: "[FAQ question, e.g. what if a project runs over scope?]", a: "[Answer placeholder]" },
  { q: "[FAQ question, e.g. who owns the code?]", a: "[Answer placeholder]" },
];

export const contactDetails = {
  email: "[contact@stackstudio.example]",
  location: "Centurion, Gauteng, South Africa",
  socials: ["LinkedIn", "Instagram"],
};

export const contactInterests = [
  "Web Development",
  "Software Development",
  "UI/UX Design",
  "Mobile Apps",
  "Not sure yet",
] as const;
