# Stack Studio

Marketing site for Stack Studio. Next.js 16 (App Router) + React 19 + TypeScript, plain CSS.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (all pages prerender statically)
npm run typecheck
```

## Layout

| Path | What |
|---|---|
| `lib/content.ts` | All copy: services, plans, FAQ, contact details. Edit content here. |
| `app/globals.css` | Design tokens (`:root`) and every component style. |
| `app/page.tsx` | Home (`/`) |
| `app/services/[slug]/page.tsx` | The four service pages, generated from `services` in `lib/content.ts` |
| `app/pricing`, `app/contact`, `app/about` | `/pricing`, `/contact`, `/about` (company + meet the team) |
| `app/card/[slug]` | Digital business cards the team QR codes open, plus a `contact.vcf` download each. Team details live in `team` in `lib/content.ts` |
| `app/api/contact/route.ts` | Contact form endpoint |
| `components/` | Nav, footer, flip cards, case-study tabs, plan ladder, contact form |

## Contact form

Submissions are validated (client and server, `lib/contact.ts`) and POSTed as JSON to
`CONTACT_WEBHOOK_URL` (see `.env.example`). With no URL set, dev accepts and discards
submissions; production returns a 503 so leads are never silently lost.

## Before launch

Bracketed placeholders are intentional. Search for `[` in `lib/content.ts`
(prices, plan hours, FAQ) plus the `TODO`s in `Footer.tsx` and
`ContactDetails.tsx` (privacy/terms pages, social links). Team QR codes and business cards link to https://stackstudio.co.za, so make sure
the site is live there before printing them; after changing a team photo, run `npm run contact-photos`. Case-study visuals are
still striped placeholders.
