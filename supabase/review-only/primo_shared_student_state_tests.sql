-- REVIEW-ONLY TEST PLAN. DO NOT RUN AGAINST PRODUCTION.
-- Run only after applying the companion migration to an isolated Supabase branch.
-- Every mutation suite must execute in a transaction that is rolled back.

begin;

-- Executable static smoke checks for an isolated branch after migration apply.
do $test$
begin
  if pg_catalog.to_regprocedure('public.get_primo_student_state(text)') is null then
    raise exception 'Missing get_primo_student_state(text)';
  end if;
  if pg_catalog.to_regprocedure(
    'public.save_primo_student_state(text,jsonb,timestamp with time zone,uuid)'
  ) is null then
    raise exception 'Missing save_primo_student_state signature';
  end if;
  if pg_catalog.has_function_privilege('anon', 'public.get_primo_student_state(text)', 'EXECUTE')
     or pg_catalog.has_function_privilege(
       'anon',
       'public.save_primo_student_state(text,jsonb,timestamp with time zone,uuid)',
       'EXECUTE'
     ) then
    raise exception 'anon must not have direct RPC execute privilege';
  end if;
  if exists (
       select 1
       from pg_catalog.pg_proc as p
       cross join lateral pg_catalog.aclexplode(
         coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))
       ) as privilege
       where p.oid in (
         pg_catalog.to_regprocedure('public.get_primo_student_state(text)'),
         pg_catalog.to_regprocedure(
           'public.save_primo_student_state(text,jsonb,timestamp with time zone,uuid)'
         )
       )
         and privilege.grantee = 0
         and privilege.privilege_type = 'EXECUTE'
     ) then
    raise exception 'PUBLIC must not have RPC execute privilege';
  end if;
  if pg_catalog.has_function_privilege(
       'service_role', 'public.get_primo_student_state(text)', 'EXECUTE'
     ) or pg_catalog.has_function_privilege(
       'service_role',
       'public.save_primo_student_state(text,jsonb,timestamp with time zone,uuid)',
       'EXECUTE'
     ) then
    raise exception 'service_role must not have Primo student RPC execute privilege';
  end if;
  if not pg_catalog.has_function_privilege(
    'authenticated', 'public.get_primo_student_state(text)', 'EXECUTE'
  ) or not pg_catalog.has_function_privilege(
    'authenticated',
    'public.save_primo_student_state(text,jsonb,timestamp with time zone,uuid)',
    'EXECUTE'
  ) then
    raise exception 'authenticated RPC grants are missing';
  end if;
  if not pg_catalog.has_function_privilege(
    'postgres', 'public.get_primo_student_state(text)', 'EXECUTE'
  ) or not pg_catalog.has_function_privilege(
    'postgres',
    'public.save_primo_student_state(text,jsonb,timestamp with time zone,uuid)',
    'EXECUTE'
  ) then
    raise exception 'postgres owner RPC execution is missing';
  end if;
end;
$test$;

do $test$
declare
  v_helper regprocedure;
begin
  for v_helper in
    select p.oid::regprocedure
    from pg_catalog.pg_proc as p
    join pg_catalog.pg_namespace as n on n.oid = p.pronamespace
    where n.nspname = 'private'
      and (p.proname like 'primo_%' or p.proname like 'resolve_primo_%')
  loop
    if exists (
         select 1
         from pg_catalog.pg_proc as p
         cross join lateral pg_catalog.aclexplode(
           coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))
         ) as privilege
         where p.oid = v_helper
           and privilege.grantee = 0
           and privilege.privilege_type = 'EXECUTE'
       )
       or pg_catalog.has_function_privilege('anon', v_helper, 'EXECUTE')
       or pg_catalog.has_function_privilege('authenticated', v_helper, 'EXECUTE')
       or pg_catalog.has_function_privilege('service_role', v_helper, 'EXECUTE') then
      raise exception 'Non-owner execution leaked to private helper: %', v_helper;
    end if;
  end loop;
end;
$test$;

do $test$
declare
  v_store text;
  v_limit integer;
begin
  for v_store, v_limit in
    select * from (values
      ('progress'::text, 262144),
      ('practice'::text, 65536),
      ('starting-checks'::text, 524288),
      ('journey'::text, 65536)
    ) as limits(store_key, byte_limit)
  loop
    begin
      perform private.primo_sanitize_state(
        v_store,
        pg_catalog.jsonb_build_object('padding', pg_catalog.repeat('x', v_limit + 1))
      );
      raise exception '% oversized incoming payload was accepted', v_store;
    exception when string_data_right_truncation then
      null;
    end;
  end loop;
end;
$test$;

do $test$
declare
  v_value jsonb;
begin
  v_value := private.primo_sanitize_state(
    'progress',
    '{"attempts":0,"correct":0,"byTopic":{},"byActivity":{},"sessions":[]}'::jsonb
  );
  if v_value->>'schemaVersion' <> '1' then
    raise exception 'Progress schemaVersion was not canonicalized';
  end if;

  v_value := private.primo_sanitize_state(
    'practice',
    '{"version":1,"byTopic":{"food":{"practiced":["conversation-write","conversation-choice"],"available":[],"updatedAt":null,"availabilityUpdatedAt":null}}}'::jsonb
  );
  if v_value #> '{byTopic,food,practiced}' <> '["conversation-practice"]'::jsonb then
    raise exception 'Practice conversation normalization failed';
  end if;

  v_value := private.primo_sanitize_state(
    'journey',
    '{"version":1,"exploredTopics":{},"celebratedCities":["roma","roma"],"migratedPassport":false}'::jsonb
  );
  if v_value->'celebratedCities' <> '["roma"]'::jsonb then
    raise exception 'Journey city set normalization failed';
  end if;

  begin
    perform private.primo_sanitize_state(
      'progress',
      '{"attempts":1,"correct":0,"byTopic":{},"byActivity":{},"sessions":[{"date":"2026-01-01T00:00:00Z","topic":"food","activity":"write","correct":false,"typedAnswer":"private text"}]}'::jsonb
    );
    raise exception 'Progress typedAnswer privacy rejection did not fire';
  exception when sqlstate '22023' then
    null;
  end;
end;
$test$;

-- Harness prerequisites (branch only):
-- 1. Create dedicated educator and anonymous auth users.
-- 2. Set request.jwt.claim.sub and request.jwt.claims per case, or invoke through
--    the branch API with real branch-only sessions.
-- 3. Create branch-only students/classes/memberships/auth links/access/entitlements.
-- 4. Never reuse production identities or production learner data.

-- AUTHORIZATION matrix
-- [ ] authorized anonymous student reads each of four exact keys
-- [ ] authorized anonymous student saves each of four exact keys
-- [ ] NULL, empty, unknown, and case-variant keys raise 22023
-- [ ] unauthenticated caller raises 42501
-- [ ] permanent educator raises 42501 for both RPCs
-- [ ] unrelated anonymous user raises 42501
-- [ ] revoked link raises 42501
-- [ ] archived student raises 42501
-- [ ] archived class raises 42501
-- [ ] missing membership raises 42501
-- [ ] missing Primo class_product_access raises 42501
-- [ ] missing/not-started/expired/revoked Primo entitlement raises 42501
-- [ ] access to another product does not authorize Primo

-- PROFILE RESOLUTION matrix
-- [ ] first save creates canonical owner/student/product/local_profile_id profile
-- [ ] active student_id-linked profile is reused
-- [ ] compatible active local_profile_id profile with NULL student_id is attached
-- [ ] compatible soft-deleted linked profile is reactivated with state preserved
-- [ ] compatible soft-deleted canonical-local profile is reactivated
-- [ ] profile with another non-NULL student_id fails closed
-- [ ] display-name equality alone never causes reuse
-- [ ] concurrent first saves yield one active student/product profile
-- [ ] no duplicate active profile remains after uniqueness-race retry

-- READ matrix
-- [ ] no profile returns exactly one state_exists=false row and NULL state fields
-- [ ] profile without selected state returns the same missing-state shape
-- [ ] selected row returns only store_key/data/timestamps
-- [ ] response contains no student, owner, class, auth, or learner-profile IDs

-- SAVE/CAS executable outline (repeat for each store):
-- select * from public.save_primo_student_state(
--   'journey',
--   '{"schemaVersion":1,"version":1,"exploredTopics":{},"celebratedCities":[],"migratedPassport":false}'::jsonb,
--   null,
--   gen_random_uuid()
-- );
-- Capture updated_at as revision A.
-- [ ] first NULL-base write applies
-- [ ] second exact-A write applies and returns revision B > A
-- [ ] stale A + different data returns conflict=true and authoritative B
-- [ ] stale A + data identical to B returns already_current=true
-- [ ] NULL base cannot overwrite an existing row
-- [ ] write_id is echoed and is absent from stored JSON
-- [ ] saving one store leaves the other three unchanged
-- [ ] two concurrent branch sessions using the same base produce one apply/one conflict

-- PROGRESS sanitizer
-- [ ] accepts legacy events without eventId
-- [ ] accepts UUID eventId and rejects duplicate IDs
-- [ ] rejects >500 sessions, invalid totals, unknown identifiers, >256 KiB
-- [ ] rejects typedAnswer/studentAnswer/studentResponse/rawAnswer/responseText/
--     inputValue/conversationText/html/innerHTML in normal sessions
-- [ ] strips harmless unknown nested event keys
-- [ ] never adds raw Scrivi/conversation-write response fields

-- PRACTICE sanitizer
-- [ ] normalizes conversation-choice/write to conversation-practice
-- [ ] deduplicates/sorts mode sets
-- [ ] rejects sentences as a practice mode, >32 modes, unknown IDs, >64 KiB
-- [ ] creates no counts or repeated-practice history

-- STARTING CHECK sanitizer
-- [ ] permits bounded target-constrained typedAnswer
-- [ ] strips unknown nested evidence keys
-- [ ] rejects >10 distinct attempts, conflicting duplicate check IDs,
--     invalid totals, invalid recommendation activity, >512 KiB
-- [ ] recomputes latest from sorted history
-- [ ] does not synthesize recommendation
-- [ ] preserves productionAdministered=false without inventing incorrect evidence
-- [ ] preserves bounded language/carrier/pattern evidence

-- JOURNEY sanitizer
-- [ ] accepts only approved topics/cities/source values
-- [ ] deduplicates/sorts celebrated cities
-- [ ] rejects unlockedCities root, invalid counts/timestamps, >64 KiB
-- [ ] creates no mastery/accuracy/proficiency fields

-- ENVELOPE/ACL/PRIVACY
-- [ ] reject every ownership/product/store/timestamp envelope field
-- [ ] unknown root keys fail; schemaVersion is forced to 1
-- [ ] anon and PUBLIC lack function EXECUTE
-- [ ] authenticated has EXECUTE only on the two public RPCs
-- [ ] authenticated lacks private schema/function access
-- [ ] existing RLS and table grants are unchanged

-- Suggested post-apply branch catalog assertions:
-- select p.proname, p.prosecdef, pg_get_function_identity_arguments(p.oid),
--        pg_get_function_result(p.oid), p.proconfig, p.proacl
-- from pg_proc p join pg_namespace n on n.oid=p.pronamespace
-- where (n.nspname='public' and p.proname in
--        ('get_primo_student_state','save_primo_student_state'))
--    or (n.nspname='private' and p.proname like '%primo%');

rollback;
