-- Run after both migrations. Safe to run more than once.
with demo_company as (
  insert into public.companies (
    id,
    name,
    slug,
    logo_url,
    banner_image_url,
    description,
    company_profile_pdf_url,
    website,
    verified_status,
    status,
    headquarters_city,
    headquarters_country
  ) values (
    '90000000-0000-4000-8000-000000000001',
    'Harborlight Freight Co.',
    'harborlight-freight-demo',
    null,
    'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&w=1600&q=85',
    'A demo forwarding partner coordinating ocean freight, customs support and port-to-door logistics across Southeast Asia and Europe. This sample profile is provided for testing the directory and profile experience.',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    'https://example.com',
    'pending',
    'published',
    'Singapore',
    'Singapore'
  )
  on conflict (slug) do update set
    name = excluded.name,
    logo_url = excluded.logo_url,
    banner_image_url = excluded.banner_image_url,
    description = excluded.description,
    company_profile_pdf_url = excluded.company_profile_pdf_url,
    website = excluded.website,
    verified_status = excluded.verified_status,
    status = excluded.status,
    headquarters_city = excluded.headquarters_city,
    headquarters_country = excluded.headquarters_country
  returning id
)
insert into public.company_services (id, company_id, category_id, description, scope_of_work)
select
  '90000000-0000-4000-8000-000000000002',
  demo_company.id,
  categories.id,
  'Ocean forwarding for full-container and consolidated cargo, with customs coordination at origin and destination.',
  array['FCL and LCL', 'Export documentation', 'Customs coordination']
from demo_company
join public.service_categories categories on categories.slug = 'sea-freight'
on conflict (company_id, category_id) do update set
  description = excluded.description,
  scope_of_work = excluded.scope_of_work;

insert into public.company_services (id, company_id, category_id, description, scope_of_work)
select
  '90000000-0000-4000-8000-000000000003',
  companies.id,
  categories.id,
  'Cross-border customs clearance support and preparation of import and export documentation.',
  array['Import declarations', 'Export declarations', 'Trade documentation']
from public.companies companies
join public.service_categories categories on categories.slug = 'customs-clearance'
where companies.slug = 'harborlight-freight-demo'
on conflict (company_id, category_id) do update set
  description = excluded.description,
  scope_of_work = excluded.scope_of_work;

insert into public.company_gallery (id, company_id, image_url, caption, sort_order)
select
  gallery.id,
  companies.id,
  gallery.image_url,
  gallery.caption,
  gallery.sort_order
from public.companies companies
cross join (values
  (
    '90000000-0000-4000-8000-000000000004'::uuid,
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1200&q=85',
    'Warehouse handling operations',
    0
  ),
  (
    '90000000-0000-4000-8000-000000000005'::uuid,
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=85',
    'Storage and fulfillment facility',
    1
  )
) as gallery(id, image_url, caption, sort_order)
where companies.slug = 'harborlight-freight-demo'
on conflict (id) do update set
  image_url = excluded.image_url,
  caption = excluded.caption,
  sort_order = excluded.sort_order;

insert into public.company_contacts (
  id,
  company_id,
  pic_name,
  pic_role,
  email,
  phone,
  whatsapp,
  is_primary
)
select
  '90000000-0000-4000-8000-000000000006',
  companies.id,
  'Avery Tan',
  'Regional Partnerships Manager',
  'avery@harborlight.example',
  '+65 6000 1234',
  '+6560001234',
  true
from public.companies companies
where companies.slug = 'harborlight-freight-demo'
on conflict (id) do update set
  pic_name = excluded.pic_name,
  pic_role = excluded.pic_role,
  email = excluded.email,
  phone = excluded.phone,
  whatsapp = excluded.whatsapp,
  is_primary = excluded.is_primary;

insert into public.service_areas (
  id,
  company_id,
  origin_region,
  origin_country,
  destination_region,
  destination_country,
  is_domestic,
  is_international
)
select
  '90000000-0000-4000-8000-000000000007',
  companies.id,
  'Southeast Asia',
  'Singapore',
  'Western Europe',
  'Netherlands',
  false,
  true
from public.companies companies
where companies.slug = 'harborlight-freight-demo'
on conflict (id) do update set
  origin_region = excluded.origin_region,
  origin_country = excluded.origin_country,
  destination_region = excluded.destination_region,
  destination_country = excluded.destination_country,
  is_domestic = excluded.is_domestic,
  is_international = excluded.is_international;

-- Optional: after creating a real Supabase Auth account, assign it to the demo company.
-- Replace the email with the account used to sign in, then run this block in the SQL editor.
-- insert into public.company_members (company_id, user_id, role)
-- select companies.id, users.id, 'owner'
-- from public.companies companies
-- cross join auth.users users
-- where companies.slug = 'harborlight-freight-demo'
--   and users.email = 'your-forwarder-login@example.com'
-- on conflict (company_id, user_id) do update set role = excluded.role;
