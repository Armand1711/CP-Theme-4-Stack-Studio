/*
 * Builds the contact photo embedded in each team member's vCard: their cutout from public/team/<slug>.webp
 * over the profile card's dark backdrop and Stack Studio logo pattern. Writes public/team/<slug>-contact.jpg.
 * Re-run after changing a team photo: npm run contact-photos
 */
import { readdirSync, readFileSync } from "node:fs";
import sharp from "sharp";

const SIZE = 640;
const tile = readFileSync("public/brand/stack-studio-pattern.svg", "utf8");
const marks = tile.match(/<defs>[\s\S]*<\/g>\s*(?=<\/svg>)/)[0].replace('fill="#000"', 'fill="#f36c21"');

const backdrop = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${SIZE}" height="${SIZE}">
  <defs>
    <linearGradient id="bg" x2="0" y2="1"><stop offset="0" stop-color="#2d2b2a"/><stop offset="1" stop-color="#121110"/></linearGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="55%">
      <stop offset="0" stop-color="#f36c21" stop-opacity="0.28"/><stop offset="1" stop-color="#f36c21" stop-opacity="0"/>
    </radialGradient>
    <pattern id="logos" width="360" height="360" patternUnits="userSpaceOnUse" patternTransform="scale(0.9)">${marks}</pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#logos)" opacity="0.14"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
</svg>`;

// Phones crop contact photos to a circle, so the face sits a little above centre with room around it.
const PERSON_WIDTH = 600;
const PERSON_TOP = 30;

for (const file of readdirSync("public/team").filter((f) => /^[a-z-]+\.webp$/.test(f))) {
  const slug = file.replace(".webp", "");
  const person = await sharp(`public/team/${file}`).resize({ width: PERSON_WIDTH }).toBuffer();
  const { height } = await sharp(person).metadata();
  const visible = await sharp(person)
    .extract({ left: 0, top: 0, width: PERSON_WIDTH, height: Math.min(height, SIZE - PERSON_TOP) })
    .toBuffer();
  const out = `public/team/${slug}-contact.jpg`;
  const info = await sharp(Buffer.from(backdrop))
    .composite([{ input: visible, left: (SIZE - PERSON_WIDTH) / 2, top: PERSON_TOP }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
  console.log(`${out}  ${Math.round(info.size / 1024)} KB`);
}
