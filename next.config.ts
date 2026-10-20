import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

/** The machine's Wi-Fi/LAN IPv4, so a phone on the same network can reach the dev server. */
function lanAddress() {
  const virtual = /vethernet|virtualbox|vmware|wsl|docker|loopback/i;
  for (const [name, addrs] of Object.entries(networkInterfaces())) {
    if (virtual.test(name)) continue;
    const ip = addrs?.find((a) => a.family === "IPv4" && !a.internal);
    if (ip) return ip.address;
  }
  return null;
}

export default function config(phase: string): NextConfig {
  if (phase !== PHASE_DEVELOPMENT_SERVER) {
    // On Netlify, point QR codes and card links at the site being built (the demo at *.netlify.app, or
    // stackstudio.co.za once it is the primary domain; deploy previews use their own URL). Elsewhere,
    // production falls back to the live domain in lib/site.ts.
    const netlify = process.env.CONTEXT === "production" ? process.env.URL : process.env.DEPLOY_PRIME_URL || process.env.URL;
    return !process.env.NEXT_PUBLIC_SITE_URL && process.env.NETLIFY && netlify ? { env: { NEXT_PUBLIC_SITE_URL: netlify } } : {};
  }

  // Dev: let phones reach the server over Wi-Fi, or over an https tunnel (`npx cloudflared tunnel
  // --url http://localhost:3000`), which iOS needs before it shares motion data with the page.
  const lan = lanAddress();
  return {
    allowedDevOrigins: [...(lan ? [lan] : []), "*.trycloudflare.com"],
    // Point QR codes at the LAN address instead of localhost, which a phone can't reach.
    ...(!process.env.NEXT_PUBLIC_SITE_URL && lan && { env: { NEXT_PUBLIC_SITE_URL: `http://${lan}:${process.env.PORT || 3000}` } }),
  };
}
