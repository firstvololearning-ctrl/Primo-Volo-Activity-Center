-- LOCAL POSTGRESQL 17 TESTS ONLY. Never apply to Supabase or production.
\set ON_ERROR_STOP on
begin;

insert into auth.users(id) values
  ('10000000-0000-0000-0000-000000000001'), -- educator
  ('20000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000005'),
  ('20000000-0000-0000-0000-000000000006'),
  ('20000000-0000-0000-0000-000000000007'),
  ('20000000-0000-0000-0000-000000000008'),
  ('20000000-0000-0000-0000-000000000009'),
  ('20000000-0000-0000-0000-000000000010'),
  ('20000000-0000-0000-0000-000000000011');

insert into public.classes(id,owner_user_id,name,class_code) values
  ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Active class','ACTIVE1'),
  ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Archived class','ARCHIVE1'),
  ('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','No access class','NOACCESS1');
update public.classes set archived_at=now() where id='30000000-0000-0000-0000-000000000002';

insert into public.students(id,owner_user_id,display_name) values
  ('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Student One'),
  ('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Student Two'),
  ('40000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','Student Three'),
  ('40000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','Student Four'),
  ('40000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001','Other Student'),
  ('40000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000001','Same Display'),
  ('40000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000001','Revoked'),
  ('40000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000001','Archived Student'),
  ('40000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000001','Archived Class Student'),
  ('40000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000001','No Membership'),
  ('40000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000001','No Product Access');
update public.students set archived_at=now() where id='40000000-0000-0000-0000-000000000008';

insert into public.class_memberships(class_id,student_id,owner_user_id)
select '30000000-0000-0000-0000-000000000001', id, owner_user_id
from public.students where id in (
  '40000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000003','40000000-0000-0000-0000-000000000004',
  '40000000-0000-0000-0000-000000000005','40000000-0000-0000-0000-000000000006',
  '40000000-0000-0000-0000-000000000007','40000000-0000-0000-0000-000000000008'
);
insert into public.class_memberships values
  ('30000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000001',now()),
  ('30000000-0000-0000-0000-000000000003','40000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000001',now());

insert into public.class_product_access values
  ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','primo-volo',now()),
  ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','primo-volo',now());
insert into public.product_entitlements(owner_user_id,product_key,access_type,status,starts_at,expires_at)
values ('10000000-0000-0000-0000-000000000001','primo-volo','manual','active',now()-interval '1 day',now()+interval '1 year');

insert into public.student_auth_links(auth_user_id,student_id,owner_user_id,class_id)
select ('20000000-0000-0000-0000-' || right(id::text,12))::uuid, id, owner_user_id,
       case when id='40000000-0000-0000-0000-000000000009' then '30000000-0000-0000-0000-000000000002'::uuid
            when id='40000000-0000-0000-0000-000000000011' then '30000000-0000-0000-0000-000000000003'::uuid
            else '30000000-0000-0000-0000-000000000001'::uuid end
from public.students;
update public.student_auth_links set revoked_at=now() where auth_user_id='20000000-0000-0000-0000-000000000007';

-- Prepared profile-resolution cases.
insert into public.learner_profiles(owner_user_id,local_profile_id,display_name,product_key,student_id)
values ('10000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000002','Old Two','primo-volo',null);
insert into public.learner_profiles(owner_user_id,local_profile_id,display_name,product_key,student_id,deleted_at)
values ('10000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000003','Old Three','primo-volo','40000000-0000-0000-0000-000000000003',now());
insert into public.learner_profiles(owner_user_id,local_profile_id,display_name,product_key,student_id)
values ('10000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000004','Wrong owner student','primo-volo','40000000-0000-0000-0000-000000000005');
insert into public.learner_profiles(owner_user_id,local_profile_id,display_name,product_key)
values ('10000000-0000-0000-0000-000000000001','unrelated-local-profile','Same Display','primo-volo');

select pg_catalog.set_config('request.jwt.claims','{"is_anonymous":true}',true);

-- Browser-role smoke test. Reset to the local superuser afterward so the test
-- harness can inspect RLS-protected rows created by SECURITY DEFINER RPCs.
set local role authenticated;
select pg_catalog.set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000001',true);
select pg_catalog.count(*) from public.get_primo_student_state('progress');
reset role;

do $test$
declare
  v_result record;
  v_revision_a timestamptz;
  v_revision_b timestamptz;
  v_profile_id uuid;
  v_write_id uuid := '50000000-0000-0000-0000-000000000001';
begin
  perform pg_catalog.set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000001',true);

  -- Missing row + non-null base conflicts without creating the row.
  select * into strict v_result from public.save_primo_student_state(
    'progress','{"attempts":0,"correct":0,"byTopic":{},"byActivity":{},"sessions":[]}',
    '2026-01-01T00:00:00Z',v_write_id
  );
  if v_result.write_applied or not v_result.conflict or v_result.data is not null then
    raise exception 'Missing-row non-null-base CAS failed';
  end if;

  -- First creation and write.
  select * into strict v_result from public.save_primo_student_state(
    'journey','{"version":1,"exploredTopics":{},"celebratedCities":[],"migratedPassport":false}',
    null,v_write_id
  );
  if not v_result.write_applied or v_result.conflict or v_result.write_id <> v_write_id then
    raise exception 'First write failed';
  end if;
  v_revision_a := v_result.updated_at;
  if v_result.data ? 'write_id' then raise exception 'write_id leaked into stored data'; end if;

  -- Exact base applies and advances.
  select * into strict v_result from public.save_primo_student_state(
    'journey','{"version":1,"exploredTopics":{},"celebratedCities":["roma"],"migratedPassport":false}',
    v_revision_a,'50000000-0000-0000-0000-000000000002'
  );
  if not v_result.write_applied or v_result.updated_at <= v_revision_a then
    raise exception 'Exact-base update or revision advancement failed';
  end if;
  v_revision_b := v_result.updated_at;

  -- Stale/different conflicts.
  select * into strict v_result from public.save_primo_student_state(
    'journey','{"version":1,"exploredTopics":{},"celebratedCities":["milano"],"migratedPassport":false}',
    v_revision_a,'50000000-0000-0000-0000-000000000003'
  );
  if v_result.write_applied or not v_result.conflict or v_result.already_current then
    raise exception 'Stale different-data conflict failed';
  end if;

  -- Stale/same is already_current.
  select * into strict v_result from public.save_primo_student_state(
    'journey','{"version":1,"exploredTopics":{},"celebratedCities":["roma"],"migratedPassport":false}',
    v_revision_a,'50000000-0000-0000-0000-000000000004'
  );
  if v_result.write_applied or v_result.conflict or not v_result.already_current
     or v_result.updated_at <> v_revision_b then
    raise exception 'Stale same-data idempotency failed';
  end if;

  -- A second equal-base write cannot overwrite the first.
  select * into strict v_result from public.save_primo_student_state(
    'journey','{"version":1,"exploredTopics":{},"celebratedCities":["genova"],"migratedPassport":false}',
    v_revision_a,'50000000-0000-0000-0000-000000000005'
  );
  if v_result.write_applied or not v_result.conflict then
    raise exception 'Equal-base second writer overwrote first';
  end if;

  select lp.id into strict v_profile_id from public.learner_profiles lp
  where lp.student_id='40000000-0000-0000-0000-000000000001' and lp.product_key='primo-volo' and lp.deleted_at is null;
  if (select count(*) from public.learner_profiles lp where lp.student_id='40000000-0000-0000-0000-000000000001' and lp.product_key='primo-volo' and lp.deleted_at is null) <> 1 then
    raise exception 'First profile creation was not unique';
  end if;

  -- Existing active profile is reused.
  perform * from public.save_primo_student_state(
    'practice','{"version":1,"byTopic":{}}',null,'50000000-0000-0000-0000-000000000006'
  );
  if (select id from public.learner_profiles lp where lp.student_id='40000000-0000-0000-0000-000000000001' and lp.product_key='primo-volo' and lp.deleted_at is null) <> v_profile_id then
    raise exception 'Active profile was not reused';
  end if;

  -- Canonical local profile attachment.
  perform pg_catalog.set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000002',true);
  perform * from public.save_primo_student_state(
    'journey','{"version":1,"exploredTopics":{},"celebratedCities":[],"migratedPassport":false}',null,'50000000-0000-0000-0000-000000000007'
  );
  if not exists(select 1 from public.learner_profiles lp where lp.local_profile_id='40000000-0000-0000-0000-000000000002' and lp.student_id='40000000-0000-0000-0000-000000000002' and lp.deleted_at is null) then
    raise exception 'Canonical local profile was not attached';
  end if;

  -- Soft-deleted profile reactivation.
  perform pg_catalog.set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000003',true);
  perform * from public.save_primo_student_state(
    'journey','{"version":1,"exploredTopics":{},"celebratedCities":[],"migratedPassport":false}',null,'50000000-0000-0000-0000-000000000008'
  );
  if not exists(select 1 from public.learner_profiles lp where lp.student_id='40000000-0000-0000-0000-000000000003' and lp.deleted_at is null) then
    raise exception 'Soft-deleted profile was not reactivated';
  end if;

  -- Display-name equality alone does not reuse unrelated profile.
  perform pg_catalog.set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000006',true);
  perform * from public.save_primo_student_state(
    'journey','{"version":1,"exploredTopics":{},"celebratedCities":[],"migratedPassport":false}',null,'50000000-0000-0000-0000-000000000009'
  );
  if (select count(*) from public.learner_profiles lp where lp.display_name='Same Display' and lp.product_key='primo-volo') <> 2 then
    raise exception 'Display-name-only profile was incorrectly reused';
  end if;

  -- Different non-null student collision fails closed.
  perform pg_catalog.set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000004',true);
  begin
    perform * from public.save_primo_student_state(
      'journey','{"version":1,"exploredTopics":{},"celebratedCities":[],"migratedPassport":false}',null,'50000000-0000-0000-0000-000000000010'
    );
    raise exception 'Different-student collision did not fail';
  exception when unique_violation then null;
  end;
end;
$test$;

-- Authorization fail-closed cases and exact store whitelist.
do $test$
declare v_subject text;
begin
  foreach v_subject in array array[
    '20000000-0000-0000-0000-000000000007', -- revoked
    '20000000-0000-0000-0000-000000000008', -- archived student
    '20000000-0000-0000-0000-000000000009', -- archived class
    '20000000-0000-0000-0000-000000000010', -- missing membership
    '20000000-0000-0000-0000-000000000011'  -- no class product access
  ] loop
    perform pg_catalog.set_config('request.jwt.claim.sub',v_subject,true);
    begin
      perform * from public.get_primo_student_state('progress');
      raise exception 'Unauthorized subject passed: %',v_subject;
    exception when insufficient_privilege then null;
    end;
  end loop;
  perform pg_catalog.set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000001',true);
  begin perform * from public.get_primo_student_state('Progress'); raise exception 'Case variant passed'; exception when invalid_parameter_value then null; end;
  begin perform * from public.get_primo_student_state(''); raise exception 'Empty store passed'; exception when invalid_parameter_value then null; end;
end;
$test$;

-- Entitlement must be active, current, and present.
select pg_catalog.set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000001',true);
update public.product_entitlements set status='revoked';
do $test$ begin
  begin perform * from public.get_primo_student_state('progress'); raise exception 'Revoked entitlement passed'; exception when insufficient_privilege then null; end;
end; $test$;
update public.product_entitlements set status='active', expires_at=now()-interval '1 second';
do $test$ begin
  begin perform * from public.get_primo_student_state('progress'); raise exception 'Expired entitlement passed'; exception when insufficient_privilege then null; end;
end; $test$;
delete from public.product_entitlements;
do $test$ begin
  begin perform * from public.get_primo_student_state('progress'); raise exception 'Missing entitlement passed'; exception when insufficient_privilege then null; end;
end; $test$;

-- Permanent educator and unlinked anonymous user boundaries.
select pg_catalog.set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000001',true);
select pg_catalog.set_config('request.jwt.claims','{"is_anonymous":false}',true);
do $test$ begin
  begin perform * from public.get_primo_student_state('progress'); raise exception 'Permanent educator passed'; exception when insufficient_privilege then null; end;
end; $test$;
select pg_catalog.set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000005',true);
select pg_catalog.set_config('request.jwt.claims','{"is_anonymous":true}',true);
delete from public.student_auth_links where auth_user_id='20000000-0000-0000-0000-000000000005';
do $test$ begin
  begin perform * from public.get_primo_student_state('progress'); raise exception 'Unlinked anonymous user passed'; exception when insufficient_privilege then null; end;
end; $test$;

-- Privacy boundary: every frozen raw ordinary-response field is rejected.
do $test$
declare v_field text;
begin
  foreach v_field in array array[
    'typedAnswer','studentAnswer','studentResponse','rawAnswer','responseText',
    'inputValue','conversationText','html','innerHTML'
  ] loop
    begin
      perform private.primo_sanitize_state('progress',pg_catalog.jsonb_build_object(
        'attempts',1,'correct',0,'byTopic','{}'::jsonb,'byActivity','{}'::jsonb,
        'sessions',pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object(
          'date','2026-01-01T00:00:00Z','topic','food','activity','write','correct',false,v_field,'private prose'
        ))
      ));
      raise exception 'Progress raw field passed: %',v_field;
    exception when invalid_parameter_value then null;
    end;
  end loop;
end;
$test$;

-- Starting Check typedAnswer remains bounded target-constrained evidence.
do $test$
declare v_value jsonb;
begin
  v_value := private.primo_sanitize_state('starting-checks','{
    "version":3,"byTopic":{"food":{"latest":null,"history":[{
      "id":"check-1","version":3,"topicKey":"food",
      "startedAt":"2026-01-01T00:00:00Z","completedAt":"2026-01-01T00:01:00Z",
      "recognitionTotal":1,"recognitionCorrect":1,
      "productionAdministered":true,"productionTotal":1,"productionCorrect":0,
      "itemStatuses":[{"itemId":"food-1","italian":"la mela","english":"apple","typedAnswer":"melaa","status":"not-yet-produced"}],
      "results":[]
    }]}}
  }');
  if v_value#>>'{byTopic,food,latest,itemStatuses,0,typedAnswer}' <> 'melaa' then
    raise exception 'Starting Check typedAnswer was not retained';
  end if;
end;
$test$;

rollback;
