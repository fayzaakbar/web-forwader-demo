create extension if not exists pgcrypto;

do $$ begin
  create type public.company_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.verification_status as enum ('pending', 'verified', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.company_member_role as enum ('owner', 'admin', 'editor');
exception when duplicate_object then null;
end $$;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  logo_url text,
  banner_image_url text,
  description text not null default '' check (char_length(description) <= 5000),
  company_profile_pdf_url text,
  website text,
  verified_status public.verification_status not null default 'pending',
  status public.company_status not null default 'draft',
  headquarters_city text,
  headquarters_country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.company_member_role not null default 'editor',
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  icon_name text
);

create table if not exists public.company_services (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  category_id uuid not null references public.service_categories(id) on delete restrict,
  description text not null default '' check (char_length(description) <= 2000),
  scope_of_work text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (company_id, category_id)
);

create table if not exists public.company_gallery (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  image_url text not null,
  caption text check (caption is null or char_length(caption) <= 240),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.company_contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  pic_name text not null check (char_length(trim(pic_name)) between 2 and 120),
  pic_role text,
  email text not null check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}$'),
  phone text,
  whatsapp text,
  avatar_url text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists company_contacts_one_primary_idx
  on public.company_contacts(company_id) where is_primary;

create table if not exists public.service_areas (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  origin_region text,
  origin_country text not null,
  destination_region text,
  destination_country text not null,
  is_domestic boolean not null default false,
  is_international boolean not null default true,
  check (is_domestic <> is_international),
  check (char_length(trim(origin_country)) between 2 and 100),
  check (char_length(trim(destination_country)) between 2 and 100)
);

create index if not exists companies_public_directory_idx
  on public.companies(status, name);
create index if not exists company_members_user_idx
  on public.company_members(user_id, company_id);
create index if not exists company_services_company_idx
  on public.company_services(company_id, category_id);
create index if not exists company_gallery_company_order_idx
  on public.company_gallery(company_id, sort_order);
create index if not exists company_contacts_company_idx
  on public.company_contacts(company_id);
create index if not exists service_areas_company_idx
  on public.service_areas(company_id);
create index if not exists service_areas_destination_idx
  on public.service_areas(destination_country);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at before update on public.companies
for each row execute function public.set_updated_at();

-- SECURITY DEFINER avoids recursive company_members RLS checks from company policies.
create or replace function public.is_company_member(target_company_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.company_members m
    where m.company_id = target_company_id and m.user_id = (select auth.uid())
  );
$$;

create or replace function public.can_manage_company(target_company_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.company_members m
    where m.company_id = target_company_id
      and m.user_id = (select auth.uid())
      and m.role in ('owner', 'admin', 'editor')
  );
$$;

create or replace function public.is_company_admin(target_company_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.company_members m
    where m.company_id = target_company_id
      and m.user_id = (select auth.uid())
      and m.role in ('owner', 'admin')
  );
$$;

create or replace function public.prevent_member_verification_changes()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.verified_status is distinct from old.verified_status
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Only platform administrators can change company verification status';
  end if;
  return new;
end;
$$;

create or replace function public.is_company_member_path(company_folder text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.company_members m
    where m.company_id::text = company_folder and m.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_company_member(uuid) from public;
revoke all on function public.can_manage_company(uuid) from public;
revoke all on function public.is_company_admin(uuid) from public;
revoke all on function public.is_company_member_path(text) from public;
grant execute on function public.is_company_member(uuid) to authenticated;
grant execute on function public.can_manage_company(uuid) to authenticated;
grant execute on function public.is_company_admin(uuid) to authenticated;
grant execute on function public.is_company_member_path(text) to authenticated;

drop trigger if exists companies_prevent_member_verification on public.companies;
create trigger companies_prevent_member_verification before update on public.companies
for each row execute function public.prevent_member_verification_changes();

alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.service_categories enable row level security;
alter table public.company_services enable row level security;
alter table public.company_gallery enable row level security;
alter table public.company_contacts enable row level security;
alter table public.service_areas enable row level security;

create policy "Published companies are public" on public.companies
for select to anon, authenticated using (status = 'published');
create policy "Members can read their company" on public.companies
for select to authenticated using (public.is_company_member(id));
create policy "Members can update their company" on public.companies
for update to authenticated using (public.can_manage_company(id)) with check (public.can_manage_company(id));

create policy "Users can read their memberships" on public.company_members
for select to authenticated using (user_id = (select auth.uid()));
create policy "Company admins can add members" on public.company_members
for insert to authenticated with check (public.is_company_admin(company_id));
create policy "Company admins can update members" on public.company_members
for update to authenticated using (public.is_company_admin(company_id))
with check (public.is_company_admin(company_id));
create policy "Company admins can remove members" on public.company_members
for delete to authenticated using (public.is_company_admin(company_id));

create policy "Service categories are public" on public.service_categories
for select to anon, authenticated using (true);

create policy "Published company services are public" on public.company_services
for select to anon, authenticated using (exists (
  select 1 from public.companies c where c.id = company_id and c.status = 'published'
));
create policy "Members manage company services" on public.company_services
for all to authenticated using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Published gallery is public" on public.company_gallery
for select to anon, authenticated using (exists (
  select 1 from public.companies c where c.id = company_id and c.status = 'published'
));
create policy "Members manage gallery" on public.company_gallery
for all to authenticated using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Published contacts are public" on public.company_contacts
for select to anon, authenticated using (exists (
  select 1 from public.companies c where c.id = company_id and c.status = 'published'
));
create policy "Members manage contacts" on public.company_contacts
for all to authenticated using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Published service areas are public" on public.service_areas
for select to anon, authenticated using (exists (
  select 1 from public.companies c where c.id = company_id and c.status = 'published'
));
create policy "Members manage service areas" on public.service_areas
for all to authenticated using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'company-assets',
  'company-assets',
  true,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Company assets are publicly readable" on storage.objects
for select to anon, authenticated using (bucket_id = 'company-assets');
create policy "Company members upload assets" on storage.objects
for insert to authenticated with check (
  bucket_id = 'company-assets'
  and public.is_company_member_path((storage.foldername(name))[1])
);
create policy "Company members update assets" on storage.objects
for update to authenticated using (
  bucket_id = 'company-assets'
  and public.is_company_member_path((storage.foldername(name))[1])
) with check (
  bucket_id = 'company-assets'
  and public.is_company_member_path((storage.foldername(name))[1])
);
create policy "Company members delete assets" on storage.objects
for delete to authenticated using (
  bucket_id = 'company-assets'
  and public.is_company_member_path((storage.foldername(name))[1])
);

grant select on public.companies, public.service_categories, public.company_services,
  public.company_gallery, public.company_contacts, public.service_areas to anon, authenticated;
grant select, insert, update, delete on public.company_members to authenticated;
grant insert, update, delete on public.companies, public.company_services,
  public.company_gallery, public.company_contacts, public.service_areas to authenticated;

insert into public.service_categories (name, slug, icon_name) values
  ('Sea freight', 'sea-freight', 'Ship'),
  ('Air freight', 'air-freight', 'Plane'),
  ('Customs clearance', 'customs-clearance', 'ClipboardCheck'),
  ('Warehousing', 'warehousing', 'Warehouse'),
  ('Inland transport', 'inland-transport', 'Truck'),
  ('Project cargo', 'project-cargo', 'Boxes')
on conflict (slug) do nothing;
