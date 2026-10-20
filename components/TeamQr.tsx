"use client";

import { QRCodeSVG } from "qrcode.react";
import { cardHref, siteUrl } from "@/lib/site";

/*
 * QR code that opens a team member's digital business card. Dark on light, because many phone
 * scanners struggle with inverted codes. Error level H leaves room for the logo in the middle.
 */
export function TeamQr({ slug, name, size = 152 }: { slug: string; name: string; size?: number }) {
  const logo = Math.round(size * 0.2);
  return (
    <QRCodeSVG
      className="team-qr"
      value={`${siteUrl}${cardHref(slug)}`}
      size={size}
      level="H"
      marginSize={2}
      bgColor="#f5f3ef"
      fgColor="#0a0a0a"
      title={`QR code: ${name}'s digital business card`}
      imageSettings={{ src: "/brand/stack-studio-mark.svg", width: logo, height: Math.round(logo * 0.955), excavate: true }}
    />
  );
}
