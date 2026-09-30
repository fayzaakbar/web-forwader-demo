create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.platform_admins enable row level security;

drop policy if exists "Platform admins can read their own role" on public.platform_admins;
create policy "Platform admins can read their own role" on public.platform_admins
for select to authenticated using (user_id = (select auth.uid()));

grant select on public.platform_admins to authenticated;

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.platform_admins a
    where a.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_platform_admin() from public;
grant execute on function public.is_platform_admin() to authenticated;

drop policy if exists "Platform admins can review all companies" on public.companies;
create policy "Platform admins can review all companies" on public.companies
for select to authenticated using (public.is_platform_admin());
