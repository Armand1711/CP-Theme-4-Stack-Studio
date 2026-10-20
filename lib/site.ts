/** The official website, as shown to people (e.g. the website on a saved contact). Never overridden. */
export const liveUrl = "https://stackstudio.co.za";

/**
 * Origin the site is currently served from, used where a full URL must resolve (QR codes, metadata).
 * Defaults to the live domain; NEXT_PUBLIC_SITE_URL overrides it (in dev, next.config.ts sets it to
 * the LAN address so phones can reach the dev server).
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || liveUrl).replace(/\/$/, "");

export const cardHref = (slug: string) => `/card/${slug}`;
export const vcardHref = (slug: string) => `/card/${slug}/contact.vcf`;

/** Business cards stand alone: no site header or footer, so they don't read as part of the site. */
export const isStandalonePage = (pathname: string) => pathname.startsWith("/card/");
