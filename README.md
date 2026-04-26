# ScopeGuard AI

ScopeGuard AI is a Next.js app for uploading scope documents (PDF, DOCX, TXT), extracting text, and generating project analysis outputs for delivery teams.

## Sprint 8 Highlights

- Added SaaS billing foundation with Stripe.
- Added `/pricing` page with Free, Pro, and Enterprise plans.
- Added authenticated `/billing` page with Stripe checkout + customer portal actions.
- Added billing APIs:
  - `POST /api/billing/create-checkout-session`
  - `POST /api/billing/create-portal-session`
  - `POST /api/billing/webhook`
  - `GET /api/billing/state`
- Added company-level subscription persistence (`plan`, `subscriptionStatus`, Stripe IDs, renewal date).
- Added premium feature gates:
  - Free: limited uploads + rule-based analysis
  - Pro: AI analysis + exports
  - Enterprise: portfolio memory + enterprise-only permissions helpers
- Added billing status card in dashboard.

## Environment Setup

Create a `.env.local` file in the project root (or copy `.env.example`):

```bash
OPENAI_API_KEY=your_openai_api_key_here

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
```

> Keep secret keys server-side only. `NEXT_PUBLIC_*` values are safe for browser exposure.

## Getting Started

Install dependencies and run the app:

```bash
npm install
npm run dev
```

Open:
- [http://localhost:3000/pricing](http://localhost:3000/pricing)
- [http://localhost:3000/billing](http://localhost:3000/billing) (authenticated)

## Scripts

```bash
npm run lint
npm run build
npm run start
```

## Supported Upload Formats

- PDF (`.pdf`)
- Microsoft Word (`.docx`)
- Plain text (`.txt`)

Max file size: 10 MB per file.

## API Routes

- `POST /api/upload` — ingest documents, persist uploads, extract text, and enforce plan upload limits.
- `POST /api/analyze-ai` — analyze extracted text with OpenAI for Pro/Enterprise plans.
- `GET /api/portfolio` — enterprise portfolio-memory listing.
- Billing routes listed above.
