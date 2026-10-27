// All marketing copy lives here so pages stay layout-only.
// Bracketed strings are intentional launch placeholders (see DESIGN.md).

export type ServiceKey = "web" | "software" | "uiux" | "mobile";

export type IncludedItem = { id: string; title: string; body: string };

export type CaseStudy = {
  title: string;
  summary: string;
  tags: string[];
  /** The live site, linked as "Visit live site". */
  url?: string;
  /** Screenshot under /public, 16:10 (1600x1000). */
  image: { src: string; alt: string };
  /** Shown on /work. */
  client?: string;
  year?: string;
  /**
   * Full-length screenshot of the site (1000px wide), scrolled through inside the browser frame on /work.
   * `height` is its pixel height, which paces the scroll.
   */
  fullPage?: { src: string; height: number };
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
  /** One line on what the client walks away with. Used in the home list and the service hero. */
  lede: string;
  /** Starting price of a one-off project in this service, shown as "From {fromPrice}". */
  fromPrice: string;
  /** What a typical one-off project covers: three short lines. */
  projectIncludes: string[];
  included: IncludedItem[];
  /** Newest first. Services without any show a "coming soon" panel. */
  caseStudies: CaseStudy[];
  /** Heading + intro for the page's interactive signature section. Heading renders as `lead <em>em</em>`. */
  demo: { lead: string; em: string; lede: string };
};

export const mpgf: CaseStudy = {
  title: "MPG Foundation: website for a Pretoria non-profit",
  summary:
    "A full website for the Make Pretoria Great Foundation, a community non-profit restoring Pretoria's public spaces, with direct EFT donations, ways to volunteer or partner, and a live countdown for their charity event.",
  tags: ["Donations by EFT", "Volunteer & partner sign-ups", "Live event countdown"],
  url: "https://mpgf.org.za",
  client: "MPG Foundation",
  year: "2026",
  fullPage: { src: "/work/mpgf-full.webp", height: 8567 },
  image: { src: "/work/mpgf.webp", alt: "The MPG Foundation homepage: \"Make Pretoria Great.\"" },
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
    lede: "Websites and web apps that load fast and bring in leads.",
    fromPrice: "[R__]",
    projectIncludes: ["Custom design for your brand", "Works on phone, tablet and desktop", "Launch and handover"],
    included: [
      { id: "marketing", title: "Marketing & brochure sites", body: "Fast, conversion-focused sites for outreach and brand presence." },
      { id: "webapps", title: "Web applications", body: "Custom web apps with real functionality, not just static pages." },
      { id: "ecommerce", title: "E-commerce", body: "Storefronts with checkout, inventory and payment integration." },
      { id: "perf-seo", title: "Performance & SEO", body: "Sites that load fast and rank, not just look good." },
    ],
    caseStudies: [mpgf],
    demo: { lead: "Built to fit", em: "every screen.", lede: "Pick a device, or drag the handle to resize." },
  },
  {
    key: "software",
    slug: "software-development",
    number: "02",
    name: "Software Development",
    navLabel: "Software",
    titleLead: "Software",
    titleEm: "Development",
    lede: "Custom tools that cut the manual work out of your day.",
    fromPrice: "[R__]",
    projectIncludes: ["A map of the workflow to fix", "One tool or integration, built", "Training and handover"],
    included: [
      { id: "tools", title: "Internal tools & dashboards", body: "Custom tools built around how your team already works." },
      { id: "apis", title: "APIs & integrations", body: "Connect your systems so data moves without manual work." },
      { id: "legacy", title: "Legacy system modernization", body: "Rebuild aging systems without breaking what already works." },
      { id: "automation", title: "Workflow automation", body: "Cut manual steps out of repetitive business processes." },
    ],
    caseStudies: [],
    demo: { lead: "Hours of admin,", em: "handled in minutes.", lede: "One new enquiry, handled by hand and with software built for your business. Then see what it adds up to for you." },
  },
  {
    key: "uiux",
    slug: "ui-ux-design",
    number: "03",
    name: "UI/UX Design",
    navLabel: "UI/UX",
    titleLead: "UI/UX",
    titleEm: "Design",
    lede: "Screens you can click and test before anything gets built.",
    fromPrice: "[R__]",
    projectIncludes: ["Research with real users", "A clickable prototype", "Design files ready to build"],
    included: [
      { id: "product", title: "Product design", body: "End-to-end design for web and mobile products." },
      { id: "systems", title: "Design systems", body: "Reusable components and tokens that keep every screen consistent." },
      { id: "research", title: "User research & testing", body: "Real user feedback before you commit to a direction." },
      { id: "prototyping", title: "Prototyping", body: "Clickable prototypes to test ideas early." },
    ],
    caseStudies: [],
    demo: { lead: "From wireframe", em: "to finished.", lede: "Drag across to compare. Click a layer to inspect it." },
  },
  {
    key: "mobile",
    slug: "mobile-apps",
    number: "04",
    name: "Desktop & Mobile Apps",
    navLabel: "Apps",
    titleLead: "Desktop &",
    titleEm: "Mobile Apps",
    lede: "Apps for iOS, Android, Windows and macOS, from one team.",
    fromPrice: "[R__]",
    projectIncludes: ["iOS and Android from one codebase", "App store submission", "Launch support"],
    included: [
      { id: "native", title: "iOS & Android apps", body: "Native-feeling apps built for both major platforms." },
      { id: "cross", title: "Cross-platform (React Native)", body: "One codebase, shipped to iOS and Android together." },
      { id: "desktop", title: "Desktop applications", body: "Windows and macOS apps for internal or client-facing tools." },
      { id: "stores", title: "App store deployment & maintenance", body: "Submission, updates and ongoing support after launch." },
    ],
    caseStudies: [],
    demo: { lead: "Made to feel right", em: "in the hand.", lede: "Drag the sheet. Flick it." },
  },
];

export const serviceHref = (s: Service) => `/services/${s.slug}`;

/** Every case study with the service it belongs to, for the /work page. Follows service order, newest first within each. */
export const allWork = services.flatMap((service) => service.caseStudies.map((study) => ({ study, service })));

export const getServiceBySlug = (slug: string) => services.find((s) => s.slug === slug);

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
    name: "Project",
    blurb: "A single fixed-scope project, quoted up front.",
    price: "Fixed quote",
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
  email: "stackstudio26@gmail.com",
  location: "Centurion, Gauteng, South Africa",
  socials: ["LinkedIn", "Instagram"],
};

export const contactInterests = [
  "Web Development",
  "Software Development",
  "UI/UX Design",
  "Desktop & Mobile Apps",
  "Not sure yet",
] as const;

export type TeamMember = {
  /** Used in the card URL (/card/{slug}) and the vCard filename. */
  slug: string;
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  bio: string;
  /** Shown on the profile card footer, without the @. */
  handle: string;
  /** Path under /public, e.g. "/team/armand.jpg". Null shows initials until a photo is added. */
  photo: string | null;
  email: string;
  phone: string;
  linkedin: string | null;
};

// After changing a photo in public/team/, run `npm run contact-photos` to rebuild the vCard contact photos.
export const team: TeamMember[] = [
  {
    slug: "armand",
    name: "Armand Naudé",
    firstName: "Armand",
    lastName: "Naudé",
    role: "Co-founder · Software & Systems",
    bio: "Armand runs the engineering behind our builds: back ends, integrations and the automation that takes busywork off our clients' plates.",
    handle: "armand",
    photo: "/team/armand.webp",
    email: "armandn03@gmail.com",
    phone: "063 046 2397",
    linkedin: null,
  },
  {
    slug: "enzo",
    name: "Enzo De Vittorio",
    firstName: "Enzo",
    lastName: "De Vittorio",
    role: "Co-founder · Design & Engineering",
    bio: "Enzo leads design and front-end at Stack Studio, turning rough ideas into interfaces people enjoy using and seeing them through to fast, solid code.",
    handle: "enzo",
    photo: "/team/enzo.webp",
    email: "enzo.devittorio03@gmail.com",
    phone: "073 662 4471",
    linkedin: null,
  },
];

export const getTeamMember = (slug: string) => team.find((m) => m.slug === slug);

export const about = {
  lede: "Stack Studio is a design and development studio in Centurion. We build websites, software and apps for businesses that want a dev team without the hiring.",
  story: [
    "We started Stack Studio because good software shouldn't need a big agency or a full in-house team. Most businesses need a few sharp people who can design it, build it and keep it running.",
    "So that's what we are: a small team that works across web, software, UI/UX and apps. You talk directly to the people doing the work, and the same people stay with you after launch.",
  ],
  values: [
    { title: "Straight talk", body: "Clear quotes, honest timelines, and no jargon. If something won't work, we'll say so early." },
    { title: "Built to last", body: "Fast, well-structured code you own outright, documented so anyone can pick it up." },
    { title: "One team, start to finish", body: "Design, engineering and support under one roof, so nothing gets lost in a handover." },
  ],
};
