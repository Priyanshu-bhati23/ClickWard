# ClickWard Experimentation Engine — Implementation Plan

## Summary

This phase adds the AI-powered variant generation, the lightweight JavaScript SDK, proper event tracking, an extended schema, and a self-contained demo page.

## User Review Required

> [!IMPORTANT]
> **Schema migration will run `prisma db push`** which syncs the new schema with your live Supabase database. This is non-destructive — it only adds new columns/tables. Existing experiments and variants are preserved.

> [!IMPORTANT]  
> You need to add your **Groq API key** to the `.env` file before the AI generation feature works.
> Get a free key at https://console.groq.com → API Keys.
> I will add a placeholder `GROQ_API_KEY=""` to `.env` now.

## Proposed Changes

---

### Phase A — Database Schema Extension

#### [MODIFY] [schema.prisma](file:///c:/Users/priya/Desktop/New%20folder/prisma/schema.prisma)

Add to `Experiment`:
- `targetSelector` (String?) — CSS selector for the element the SDK will modify
- relation to `Event[]`

Add to `Variant`:
- `allocation` (Int, default 50) — traffic % for this variant
- relation to `Event[]`

Add new model `Event`:
```
id           String   (uuid)
experimentId String
variantId    String
visitorId    String
eventType    String   ("impression" | "conversion")
createdAt    DateTime
```

---

### Phase B — Groq AI Integration (server-only)

#### [NEW] `src/app/api/ai/generate-variants/route.ts`
- POST endpoint, authenticated via Supabase session cookie
- Accepts: `{ experimentId, name, description, goal, controlVariant }`
- Calls Groq API (model: `llama3-8b-8192`) with a structured prompt
- Returns validated JSON: `{ variants: [{ name, headline, description, ctaText }] }`
- GROQ_API_KEY is **never sent to client**

#### [MODIFY] `src/app/dashboard/experiments/[id]/page.tsx`
- Add **"Generate with AI"** button on the variant editor section
- Shows a loading state while AI generates
- Renders generated variants in a review panel for the user to approve/edit/save
- User must explicitly click "Save this variant" — no auto-save

---

### Phase C — Experiment SDK

#### [NEW] `src/app/sdk.js/route.ts`
- Serves a public JavaScript file at `/sdk.js`
- Minified, no secrets, no server credentials
- Logic:
  1. Reads `data-experiment` from the `<script>` tag
  2. Generates/retrieves a `visitorId` from `localStorage` (uuid v4 in JS)
  3. Fetches `/api/sdk/config?experimentId=X` to get experiment config
  4. Deterministically assigns visitor to variant using `hash(visitorId + experimentId) % totalWeight`
  5. Stores assignment in `localStorage` so same visitor always gets same variant
  6. Applies the variant: finds `targetSelector` element, sets text content and data-attributes
  7. POSTs an impression to `/api/sdk/event`
  8. Attaches a click listener to the target element to POST a conversion

#### [NEW] `src/app/api/sdk/config/route.ts`
- Public GET endpoint (no auth required)
- Returns sanitized experiment config for active experiments only:
  ```json
  {
    "experimentId": "...",
    "targetSelector": ".hero-cta",
    "variants": [{ "id":"...", "name":"...", "ctaText":"...", "allocation":50 }]
  }
  ```

#### [NEW] `src/app/api/sdk/event/route.ts`
- Public POST endpoint (no auth required)
- Accepts: `{ experimentId, variantId, visitorId, eventType }`
- Validates experiment is active, variant belongs to experiment
- Creates an `Event` record
- Increments `visits` or `conversions` on the `Variant` for backward compat

---

### Phase D — Experiment Detail Page Updates

#### [MODIFY] `src/app/dashboard/experiments/[id]/page.tsx`
- Add **Target Selector** input field (e.g. `#clickward-demo-cta`)
- Add **Copy Snippet** section when experiment is Active:
  ```html
  <script src="http://localhost:3000/sdk.js" data-experiment="EXPERIMENT_ID"></script>
  ```
- Show proper results with Event-based counts (impressions/conversions)
- Label winner as "Leading variant" not "Winning variant"

#### [MODIFY] `src/app/dashboard/experiments/[id]/actions.ts`
- Add `updateTargetSelector` server action
- Update `updateVariant` to handle `allocation` field

---

### Phase E — Demo Page

#### [NEW] `src/app/demo/page.tsx`
- Public page (no auth required)
- Contains:
  - Headline: "Build better products"  
  - CTA button: "Get Started" with `id="clickward-demo-cta"`
  - Info box: "This page is a live demo of ClickWard. Paste your experiment snippet above to see the SDK in action."
- Includes a `<script>` tag area where users can paste/activate their snippet
- Clean, isolated layout — does not share header/footer with dashboard

---

### Phase F — Updated Results View

#### [MODIFY] `src/app/dashboard/experiments/[id]/page.tsx`
- Results now pull from `Event` count (grouped by variantId + eventType)
- Falls back to legacy `visits`/`conversions` columns if no events yet
- Shows "Leading variant" badge (not "Winning")
- Shows total impressions, total conversions, per-variant conversion rate

---

## Verification Plan

### Automated
- `npx prisma db push` (schema migration)
- `npm run build` (TypeScript check, all routes compile)

### Manual End-to-End
Follow the 18-step flow:
1. Login → 2. Create experiment → 3. Set target selector → 4. Generate AI variants → 5. Edit/approve → 6. Activate → 7. Copy snippet → 8. Open `/demo` → 9. SDK loads → 10. CTA changes → 11. Impression recorded → 12. Click CTA → 13. Conversion recorded → 14. Results page updated → 15. Leading variant displayed
