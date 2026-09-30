# Routewise Forwarder Directory

A Next.js App Router directory for freight forwarder profiles. Public visitors can search and filter published companies, review capabilities and coverage, browse operational photos, and contact listed PICs. The app does not handle bookings or show freight rates.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Without Supabase credentials the app uses a small, clearly illustrative in-memory dataset so the directory and profile UI can be explored. Workspace sign-in is disabled by default for presentations. After Supabase Auth and role records are configured, set `NEXT_PUBLIC_WORKSPACES_ENABLED=true` together with both Supabase public values in `.env.local` to enable admin and forwarder login. Set `NEXT_PUBLIC_SITE_URL` to the deployed origin and `NEXT_PUBLIC_PARTNERSHIPS_EMAIL` to enable the optional listing contact button.

When Supabase workspaces are not configured, `/forwarder/login` opens a read-only demo workspace in both development and production. Demo profile edits and registrations are not persisted. The admin workspace remains unavailable in production until Supabase is configured.

## Deploy a public demo to Vercel

1. Import this project into Vercel; the Next.js framework and build command are detected automatically (`npm run build`).
2. No environment variables or Supabase project are required for the public demo. The blank Supabase values in `.env.example` keep the sample directory active, and workspaces remain disabled unless explicitly enabled.
3. After assigning a production domain, set `NEXT_PUBLIC_SITE_URL` to its `https://` origin and optionally set `NEXT_PUBLIC_PARTNERSHIPS_EMAIL`. Redeploy after changing environment variables.
4. Keep `NEXT_PUBLIC_WORKSPACES_ENABLED` unset or set it to `false` for a public demo. Enable it only after configuring Supabase Auth, database migrations, and role records as described below.

Demo profiles and edits made in the workspace preview are illustrative and are not persisted. To run a connected production directory, configure the Supabase variables and setup described in the next section.

## Supabase setup

1. Apply `supabase/migrations/202609300001_directory_schema.sql` with the Supabase CLI or SQL editor.
2. Apply `supabase/migrations/202609300002_platform_roles.sql` to enable the admin role.
3. The migrations create the tables, indexes, RLS policies, `company-assets` public bucket and starter service categories. The bucket accepts JPEG, PNG, WebP, AVIF and PDF files up to 20 MB.
4. Keep uploads under `<company-uuid>/<logos|banners|gallery|documents>/...` in `company-assets`; authenticated company members can manage only their own folder. Public reads are enabled for this bucket.
5. Provision the first `companies` row and its `company_members` owner using a trusted server/service-role workflow. Create platform admins by inserting their `auth.users.id` into `public.platform_admins` from the Supabase SQL editor or a trusted server. The service-role key must never be sent to the browser. Membership admins can add subsequent members.
6. Store public Storage URLs in the company and gallery URL columns. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used by the frontend; `SUPABASE_SERVICE_ROLE_KEY` is server-only and required only for platform-admin verification actions.

For one complete test listing, run `supabase/seed.sql` after both migrations. It creates the published-but-unverified Harborlight Freight Co. profile with services, a trade lane, contact, gallery images and a sample PDF. To test `/forwarder`, create a real user in Supabase Auth, replace the example email in the optional membership block at the bottom of the seed, and run that block. To test `/admin`, add the Auth user's ID to `public.platform_admins` from the SQL editor.

The migration intentionally reserves verification changes for the Supabase service role. Company membership grants profile-content editing; it does not grant authority to self-verify a company.

## App structure

- `app/page.tsx`: server-rendered directory entry point.
- `app/forwarders/[slug]/page.tsx`: server-rendered, metadata-aware company profile.
- `app/admin/page.tsx`: platform-admin company review dashboard.
- `app/forwarder/page.tsx`: company-member dashboard with links to profile editing.
- `app/forwarder/companies/[id]/page.tsx`: company editor with tabs for branding/profile, services/scope, coverage lanes, PIC contacts, gallery/project photos and PDF. Company members can edit through RLS; uploads use the authenticated browser session and company Storage folder.
- `components/CompanyCard.tsx`: reusable company listing card.
- `components/DirectoryExplorer.tsx`: client-side search and filtering.
- `components/ProfileSections.tsx`: accessible profile tabs.
- `components/ForwarderProfileEditor.tsx`: role workspace data-entry forms. Demo edits are local previews only; real saves write to the company tables.
- `components/CompanyGallery.tsx` and `components/ProfileDocument.tsx`: gallery lightbox and PDF preview/download.
- `lib/data.ts`: Supabase server reads plus local demo data fallback.
- `types/database.ts`: database row and directory domain types.

Run `npm run typecheck` and `npm run build` before deployment.
