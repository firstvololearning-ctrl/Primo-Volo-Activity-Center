-- LOCAL TEST FIXTURE ONLY. Never apply to Supabase or production.
\set ON_ERROR_STOP on

do $bootstrap$
begin
  if not exists (select 1 from pg_roles where rolname = 'postgres') then
    create role postgres superuser nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin;
  end if;
end;
$bootstrap$;

create schema auth authorization postgres;
revoke all on schema auth from public;

create table auth.users (
  id uuid primary key
);

create or replace function auth.uid()
returns uuid
language sql
stable
set search_path = ''
as $function$
  select nullif(pg_catalog.current_setting('request.jwt.claim.sub', true), '')::uuid;
$function$;

create or replace function auth.jwt()
returns jsonb
language sql
stable
set search_path = ''
as $function$
  select coalesce(
    nullif(pg_catalog.current_setting('request.jwt.claims', true), '')::jsonb,
    '{}'::jsonb
  );
$function$;

grant usage on schema auth to authenticated;
grant execute on function auth.uid(), auth.jwt() to authenticated;

create table public.students (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  student_code_hash text,
  student_code_hint text,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  archived_at timestamptz,
  constraint students_id_owner_unique unique (id, owner_user_id),
  constraint students_display_name_length check (
    pg_catalog.char_length(pg_catalog.btrim(display_name)) between 1 and 80
  )
);

create table public.classes (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  class_code text not null unique,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  archived_at timestamptz,
  constraint classes_id_owner_unique unique (id, owner_user_id)
);

create table public.class_memberships (
  class_id uuid not null,
  student_id uuid not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default pg_catalog.now(),
  constraint class_memberships_pkey primary key (class_id, student_id),
  constraint class_memberships_class_owner_fkey
    foreign key (class_id, owner_user_id) references public.classes(id, owner_user_id) on delete cascade,
  constraint class_memberships_student_owner_fkey
    foreign key (student_id, owner_user_id) references public.students(id, owner_user_id) on delete cascade
);

create table public.student_auth_links (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  student_id uuid not null,
  owner_user_id uuid not null,
  created_at timestamptz not null default pg_catalog.now(),
  last_verified_at timestamptz not null default pg_catalog.now(),
  revoked_at timestamptz,
  class_id uuid,
  constraint student_auth_links_student_owner_fkey
    foreign key (student_id, owner_user_id) references public.students(id, owner_user_id) on delete cascade,
  constraint student_auth_links_class_owner_fkey
    foreign key (class_id, owner_user_id) references public.classes(id, owner_user_id) on delete cascade,
  constraint student_auth_links_active_class_check check (revoked_at is not null or class_id is not null)
);

create table public.class_product_access (
  class_id uuid not null,
  owner_user_id uuid not null,
  product_key text not null,
  created_at timestamptz not null default pg_catalog.now(),
  constraint class_product_access_pkey primary key (class_id, product_key),
  constraint class_product_access_class_owner_fkey
    foreign key (class_id, owner_user_id) references public.classes(id, owner_user_id) on delete cascade,
  constraint class_product_access_product_key_check check (
    product_key in ('first-volo-story-builder', 'first-volo-morphology', 'primo-volo')
  )
);

create table public.product_entitlements (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  product_key text not null,
  access_type text not null,
  status text not null default 'active',
  starts_at timestamptz not null default pg_catalog.now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint product_entitlements_status check (status in ('active', 'revoked')),
  constraint product_entitlements_valid_window check (expires_at > starts_at)
);

create table public.learner_profiles (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  local_profile_id text not null,
  display_name text not null,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  product_key text not null default 'first-volo-morphology',
  deleted_at timestamptz,
  student_id uuid,
  constraint learner_profiles_owner_product_local_unique
    unique (owner_user_id, product_key, local_profile_id),
  constraint learner_profiles_student_owner_fkey
    foreign key (student_id, owner_user_id)
    references public.students(id, owner_user_id) on delete set null (student_id),
  constraint learner_profiles_display_name_length check (
    pg_catalog.char_length(pg_catalog.btrim(display_name)) between 1 and 80
  ),
  constraint learner_profiles_local_profile_id_length check (
    pg_catalog.char_length(local_profile_id) between 1 and 120
  ),
  constraint learner_profiles_product_key_length check (
    pg_catalog.char_length(product_key) between 1 and 80
  )
);

create unique index learner_profiles_student_product_active_unique
  on public.learner_profiles (student_id, product_key)
  where student_id is not null and deleted_at is null;

create table public.learning_state (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  learner_profile_id uuid not null references public.learner_profiles(id) on delete cascade,
  product_key text not null,
  store_key text not null,
  data jsonb not null default '{}'::jsonb,
  client_updated_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint learning_state_learner_product_store_unique
    unique (learner_profile_id, product_key, store_key),
  constraint learning_state_product_key_length check (
    pg_catalog.char_length(product_key) between 1 and 80
  ),
  constraint learning_state_store_key_length check (
    pg_catalog.char_length(store_key) between 1 and 120
  )
);

alter table public.students enable row level security;
alter table public.classes enable row level security;
alter table public.class_memberships enable row level security;
alter table public.student_auth_links enable row level security;
alter table public.class_product_access enable row level security;
alter table public.product_entitlements enable row level security;
alter table public.learner_profiles enable row level security;
alter table public.learning_state enable row level security;

create policy learner_profiles_permanent_users_only on public.learner_profiles
  for all to authenticated
  using (coalesce((auth.jwt()->>'is_anonymous')::boolean, false) = false)
  with check (coalesce((auth.jwt()->>'is_anonymous')::boolean, false) = false);
create policy learning_state_permanent_users_only on public.learning_state
  for all to authenticated
  using (coalesce((auth.jwt()->>'is_anonymous')::boolean, false) = false)
  with check (coalesce((auth.jwt()->>'is_anonymous')::boolean, false) = false);

grant select, insert, update, delete on public.learner_profiles, public.learning_state to authenticated;
