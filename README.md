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
| `app/pricing`, `app/contact` | `/pricing`, `/contact` |
| `app/api/contact/route.ts` | Contact form endpoint |
| `components/` | Nav, footer, flip cards, case-study tabs, plan ladder, contact form |

## Contact form

Submissions are validated (client and server, `lib/contact.ts`) and POSTed as JSON to
`CONTACT_WEBHOOK_URL` (see `.env.example`). With no URL set, dev accepts and discards
submissions; production returns a 503 so leads are never silently lost.

## Before launch

Bracketed placeholders are intentional. Search for `[` in `lib/content.ts`
(prices, plan hours, FAQ, contact email) plus the `TODO`s in `Footer.tsx` and
`ContactDetails.tsx` (privacy/terms pages, social links). Case-study visuals are
still striped placeholders.
