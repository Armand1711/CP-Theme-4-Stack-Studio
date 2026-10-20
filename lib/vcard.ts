import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { TeamMember } from "./content";
import { liveUrl } from "./site";

// vCard 3.0 text values escape backslash, comma, semicolon and newlines.
const esc = (value: string) => value.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\r?\n/g, "\\n");

// Lines longer than 75 octets are folded: CRLF, then a space before each continuation.
const fold = (line: string) => line.match(/.{1,72}/gu)!.join("\r\n ");

// Contact photo, embedded rather than linked because iOS ignores photo URLs: the member's photo on the
// logo-pattern backdrop (built by `npm run contact-photos`), or the plain Stack Studio mark without one.
const contactPhoto = (slug: string) => {
  const own = join(process.cwd(), `public/team/${slug}-contact.jpg`);
  const file = existsSync(own) ? own : join(process.cwd(), "public/brand/contact-photo.jpg");
  return readFileSync(file).toString("base64");
};

/** A contact file phones can import straight into the address book. */
export function toVCard(member: TeamMember) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(member.lastName)};${esc(member.firstName)};;;`,
    `FN:${esc(member.name)}`,
    "ORG:Stack Studio",
    `TITLE:${esc(member.role)}`,
    `EMAIL;TYPE=INTERNET,WORK:${esc(member.email)}`,
    `TEL;TYPE=CELL,VOICE:${esc(member.phone)}`,
    `URL;TYPE=WORK:${liveUrl}`,
    member.linkedin && `X-SOCIALPROFILE;TYPE=linkedin:${member.linkedin}`,
    `PHOTO;ENCODING=b;TYPE=JPEG:${contactPhoto(member.slug)}`,
    "ADR;TYPE=WORK:;;;Centurion;Gauteng;;South Africa",
    `NOTE:${esc(member.bio)}`,
    "END:VCARD",
  ];
  return lines.filter((l): l is string => Boolean(l)).map(fold).join("\r\n") + "\r\n";
}
