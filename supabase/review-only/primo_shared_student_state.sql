-- REVIEW ONLY. DO NOT APPLY WITHOUT HUMAN REVIEW AND BRANCH VALIDATION.
-- Primo Volo P3 shared-student state RPCs, cloud schemaVersion 1.
-- Catalog assumptions verified read-only against project apkvvspubolyxlqtlkto
-- on 2026-09-01 (PostgreSQL 17.6).

begin;

create schema if not exists private authorization postgres;
revoke all on schema private from public, anon, authenticated;

create or replace function private.primo_assert_store_key(p_store_key text)
returns text
language plpgsql
immutable
set search_path = ''
as $function$
begin
  if p_store_key is null
     or p_store_key not in ('progress', 'practice', 'starting-checks', 'journey') then
    raise exception 'Invalid Primo store key' using errcode = '22023';
  end if;
  return p_store_key;
end;
$function$;

create or replace function private.primo_assert_object_keys(
  p_value jsonb,
  p_allowed text[],
  p_label text
)
returns void
language plpgsql
immutable
set search_path = ''
as $function$
declare
  v_key text;
begin
  if p_value is null or pg_catalog.jsonb_typeof(p_value) is distinct from 'object' then
    raise exception '% must be a JSON object', p_label using errcode = '22023';
  end if;
  for v_key in select pg_catalog.jsonb_object_keys(p_value)
  loop
    if not (v_key = any(p_allowed)) then
      raise exception '% contains unsupported key: %', p_label, v_key using errcode = '22023';
    end if;
  end loop;
end;
$function$;

create or replace function private.primo_int(
  p_value jsonb,
  p_label text,
  p_max bigint default 2147483647
)
returns bigint
language plpgsql
immutable
set search_path = ''
as $function$
declare
  v_result bigint;
begin
  if p_value is null
     or pg_catalog.jsonb_typeof(p_value) is distinct from 'number'
     or p_value #>> '{}' !~ '^[0-9]+$' then
    raise exception '% must be a non-negative integer', p_label using errcode = '22023';
  end if;
  begin
    v_result := (p_value #>> '{}')::bigint;
  exception when numeric_value_out_of_range then
    raise exception '% is outside the accepted range', p_label using errcode = '22003';
  end;
  if v_result > p_max then
    raise exception '% is outside the accepted range', p_label using errcode = '22003';
  end if;
  return v_result;
end;
$function$;

create or replace function private.primo_iso_timestamp(p_value jsonb, p_label text)
returns text
language plpgsql
set search_path = ''
as $function$
declare
  v_text text;
  v_parsed timestamptz;
begin
  if p_value is null or pg_catalog.jsonb_typeof(p_value) is distinct from 'string' then
    raise exception '% must be an ISO timestamp string', p_label using errcode = '22023';
  end if;
  v_text := p_value #>> '{}';
  if pg_catalog.length(v_text) > 40 or v_text !~ 'T' then
    raise exception '% must be an ISO timestamp string', p_label using errcode = '22023';
  end if;
  begin
    v_parsed := v_text::timestamptz;
  exception when others then
    raise exception '% must be a valid timestamp', p_label using errcode = '22007';
  end;
  if v_parsed < timestamptz '2020-01-01 00:00:00+00'
     or v_parsed > pg_catalog.clock_timestamp() + interval '5 minutes' then
    raise exception '% is outside the accepted timestamp range', p_label using errcode = '22007';
  end if;
  return pg_catalog.to_char(
    v_parsed at time zone 'UTC',
    'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
  );
end;
$function$;

create or replace function private.primo_plain_text(
  p_value jsonb,
  p_label text,
  p_max_length integer default 200,
  p_nullable boolean default false
)
returns text
language plpgsql
immutable
set search_path = ''
as $function$
declare
  v_text text;
begin
  if p_value is null or pg_catalog.jsonb_typeof(p_value) = 'null' then
    if p_nullable then return null; end if;
    raise exception '% is required', p_label using errcode = '22023';
  end if;
  if pg_catalog.jsonb_typeof(p_value) is distinct from 'string' then
    raise exception '% must be text', p_label using errcode = '22023';
  end if;
  v_text := pg_catalog.btrim(p_value #>> '{}');
  v_text := pg_catalog.regexp_replace(v_text, '[[:cntrl:]]', '', 'g');
  if v_text = '' then
    if p_nullable then return null; end if;
    raise exception '% must not be empty', p_label using errcode = '22023';
  end if;
  if pg_catalog.char_length(v_text) > p_max_length then
    raise exception '% exceeds % characters', p_label, p_max_length using errcode = '22001';
  end if;
  return v_text;
end;
$function$;

create or replace function private.primo_topic_id(p_value jsonb, p_label text)
returns text
language plpgsql
immutable
set search_path = ''
as $function$
declare v_text text := private.primo_plain_text(p_value, p_label, 80, false);
begin
  if v_text not in (
    'greetings','hobbies','supplies','food','clothing','bodyParts','home','places',
    'prepositions','family','colors','adjectives','feelings','numbers','animals',
    'routines','days','months','time','weather','seasons','classroom'
  ) then
    raise exception 'Unknown Primo topic: %', v_text using errcode = '22023';
  end if;
  return v_text;
end;
$function$;

create or replace function private.primo_activity_id(p_value jsonb, p_label text)
returns text
language plpgsql
immutable
set search_path = ''
as $function$
declare v_text text := private.primo_plain_text(p_value, p_label, 80, false);
begin
  if v_text not in (
    'learn','choose','match-word','match-sound','memory','words-in-action',
    'conversation-choice','conversation-write','conversation-practice',
    'introductions-practice','assemble-sentences','complete','write','sentences'
  ) then
    raise exception 'Unknown Primo activity: %', v_text using errcode = '22023';
  end if;
  return v_text;
end;
$function$;

create or replace function private.primo_normalize_practice_mode(p_value jsonb, p_label text)
returns text
language plpgsql
immutable
set search_path = ''
as $function$
declare v_mode text := private.primo_activity_id(p_value, p_label);
begin
  if v_mode in ('conversation-choice', 'conversation-write') then
    return 'conversation-practice';
  end if;
  if v_mode = 'sentences' then
    raise exception 'sentences is legacy progress evidence, not a practice mode' using errcode = '22023';
  end if;
  return v_mode;
end;
$function$;

create or replace function private.primo_score_aggregate(p_value jsonb, p_label text)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $function$
declare
  v_attempts bigint;
  v_correct bigint;
begin
  perform private.primo_assert_object_keys(p_value, array['attempts','correct'], p_label);
  v_attempts := private.primo_int(p_value->'attempts', p_label || '.attempts');
  v_correct := private.primo_int(p_value->'correct', p_label || '.correct');
  if v_correct > v_attempts then
    raise exception '%.correct must not exceed attempts', p_label using errcode = '22023';
  end if;
  return pg_catalog.jsonb_build_object('attempts', v_attempts, 'correct', v_correct);
end;
$function$;

create or replace function private.primo_sanitize_progress(p_data jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $function$
declare
  v_attempts bigint;
  v_correct bigint;
  v_by_topic jsonb := '{}'::jsonb;
  v_by_activity jsonb := '{}'::jsonb;
  v_sessions jsonb := '[]'::jsonb;
  v_pair record;
  v_event jsonb;
  v_clean jsonb;
  v_topic text;
  v_activity text;
  v_event_id text;
  v_target_text text;
  v_seen_ids text[] := array[]::text[];
  v_count integer;
  v_forbidden text;
begin
  perform private.primo_assert_object_keys(
    p_data, array['schemaVersion','attempts','correct','byTopic','byActivity','sessions'], 'progress'
  );
  v_attempts := private.primo_int(p_data->'attempts', 'progress.attempts');
  v_correct := private.primo_int(p_data->'correct', 'progress.correct');
  if v_correct > v_attempts then
    raise exception 'progress.correct must not exceed attempts' using errcode = '22023';
  end if;
  if pg_catalog.jsonb_typeof(p_data->'byTopic') is distinct from 'object'
     or pg_catalog.jsonb_typeof(p_data->'byActivity') is distinct from 'object'
     or pg_catalog.jsonb_typeof(p_data->'sessions') is distinct from 'array' then
    raise exception 'Progress aggregates and sessions have invalid types' using errcode = '22023';
  end if;

  select count(*) into v_count from pg_catalog.jsonb_each(p_data->'byTopic');
  if v_count > 100 then raise exception 'Progress has too many topics' using errcode = '22023'; end if;
  for v_pair in select * from pg_catalog.jsonb_each(p_data->'byTopic')
  loop
    v_topic := private.primo_topic_id(pg_catalog.to_jsonb(v_pair.key), 'progress.byTopic key');
    v_by_topic := v_by_topic || pg_catalog.jsonb_build_object(
      v_topic, private.primo_score_aggregate(v_pair.value, 'progress.byTopic.' || v_topic)
    );
  end loop;

  select count(*) into v_count from pg_catalog.jsonb_each(p_data->'byActivity');
  if v_count > 100 then raise exception 'Progress has too many activities' using errcode = '22023'; end if;
  for v_pair in select * from pg_catalog.jsonb_each(p_data->'byActivity')
  loop
    v_activity := private.primo_activity_id(pg_catalog.to_jsonb(v_pair.key), 'progress.byActivity key');
    v_by_activity := v_by_activity || pg_catalog.jsonb_build_object(
      v_activity, private.primo_score_aggregate(v_pair.value, 'progress.byActivity.' || v_activity)
    );
  end loop;

  v_count := pg_catalog.jsonb_array_length(p_data->'sessions');
  if v_count > 500 then raise exception 'Progress sessions exceed 500' using errcode = '22023'; end if;
  for v_event in select value from pg_catalog.jsonb_array_elements(p_data->'sessions')
  loop
    if pg_catalog.jsonb_typeof(v_event) is distinct from 'object' then
      raise exception 'Each progress session must be an object' using errcode = '22023';
    end if;
    foreach v_forbidden in array array[
      'typedAnswer','studentAnswer','studentResponse','rawAnswer','responseText',
      'inputValue','conversationText','html','innerHTML'
    ]
    loop
      if v_event ? v_forbidden then
        raise exception 'Progress session contains forbidden raw-response field: %', v_forbidden
          using errcode = '22023';
      end if;
    end loop;
    -- Unknown harmless nested keys are stripped; privacy-sensitive keys above fail closed.
    v_topic := private.primo_topic_id(v_event->'topic', 'progress.sessions.topic');
    v_activity := private.primo_activity_id(v_event->'activity', 'progress.sessions.activity');
    if pg_catalog.jsonb_typeof(v_event->'correct') is distinct from 'boolean' then
      raise exception 'progress.sessions.correct must be boolean' using errcode = '22023';
    end if;
    v_clean := pg_catalog.jsonb_build_object(
      'date', private.primo_iso_timestamp(v_event->'date', 'progress.sessions.date'),
      'topic', v_topic,
      'activity', v_activity,
      'correct', (v_event->>'correct')::boolean
    );
    if v_event ? 'eventId' then
      v_event_id := private.primo_plain_text(v_event->'eventId', 'progress.sessions.eventId', 36, false);
      begin perform v_event_id::uuid; exception when others then
        raise exception 'progress.sessions.eventId must be a UUID' using errcode = '22023';
      end;
      if v_event_id = any(v_seen_ids) then
        raise exception 'Duplicate progress eventId: %', v_event_id using errcode = '22023';
      end if;
      v_seen_ids := pg_catalog.array_append(v_seen_ids, v_event_id);
      v_clean := v_clean || pg_catalog.jsonb_build_object('eventId', v_event_id);
    end if;
    if v_event ? 'targetItalian' then
      v_clean := v_clean || pg_catalog.jsonb_build_object(
        'targetItalian', private.primo_plain_text(v_event->'targetItalian', 'targetItalian', 200, false)
      );
    end if;
    if v_event ? 'targetEnglish' then
      v_target_text := private.primo_plain_text(v_event->'targetEnglish', 'targetEnglish', 200, true);
      if v_target_text is not null then
        v_clean := v_clean || pg_catalog.jsonb_build_object('targetEnglish', v_target_text);
      end if;
    end if;
    -- The server cannot infer whether an incorrect legacy Abbina target was canonical.
    -- Clients must omit ambiguous target metadata; this sanitizer does not relabel it.
    v_sessions := v_sessions || pg_catalog.jsonb_build_array(v_clean);
  end loop;

  return pg_catalog.jsonb_build_object(
    'schemaVersion', 1, 'attempts', v_attempts, 'correct', v_correct,
    'byTopic', v_by_topic, 'byActivity', v_by_activity, 'sessions', v_sessions
  );
end;
$function$;

create or replace function private.primo_sanitize_practice(p_data jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $function$
declare
  v_by_topic jsonb := '{}'::jsonb;
  v_pair record;
  v_topic text;
  v_topic_data jsonb;
  v_modes jsonb;
  v_mode jsonb;
  v_clean_modes text[];
  v_updated text;
  v_availability_updated text;
  v_count integer;
begin
  perform private.primo_assert_object_keys(p_data, array['schemaVersion','version','byTopic'], 'practice');
  if p_data ? 'version' and private.primo_int(p_data->'version', 'practice.version', 1) <> 1 then
    raise exception 'Unsupported practice version' using errcode = '22023';
  end if;
  if pg_catalog.jsonb_typeof(p_data->'byTopic') is distinct from 'object' then
    raise exception 'practice.byTopic must be an object' using errcode = '22023';
  end if;
  select count(*) into v_count from pg_catalog.jsonb_each(p_data->'byTopic');
  if v_count > 100 then raise exception 'Practice has too many topics' using errcode = '22023'; end if;

  for v_pair in select * from pg_catalog.jsonb_each(p_data->'byTopic')
  loop
    v_topic := private.primo_topic_id(pg_catalog.to_jsonb(v_pair.key), 'practice.byTopic key');
    v_topic_data := v_pair.value;
    perform private.primo_assert_object_keys(
      v_topic_data, array['practiced','available','updatedAt','availabilityUpdatedAt'],
      'practice.byTopic.' || v_topic
    );
    if pg_catalog.jsonb_typeof(v_topic_data->'practiced') is distinct from 'array'
       or pg_catalog.jsonb_typeof(v_topic_data->'available') is distinct from 'array' then
      raise exception 'Practice mode sets must be arrays' using errcode = '22023';
    end if;
    if pg_catalog.jsonb_array_length(v_topic_data->'practiced') > 32
       or pg_catalog.jsonb_array_length(v_topic_data->'available') > 32 then
      raise exception 'Practice mode set exceeds 32 entries' using errcode = '22023';
    end if;

    v_clean_modes := array[]::text[];
    for v_mode in select value from pg_catalog.jsonb_array_elements(v_topic_data->'practiced')
    loop
      v_clean_modes := pg_catalog.array_append(
        v_clean_modes, private.primo_normalize_practice_mode(v_mode, 'practice.practiced mode')
      );
    end loop;
    select coalesce(pg_catalog.jsonb_agg(x order by x), '[]'::jsonb) into v_modes
    from (select distinct unnest(v_clean_modes) as x) q;
    v_topic_data := pg_catalog.jsonb_build_object('practiced', v_modes);

    v_clean_modes := array[]::text[];
    for v_mode in select value from pg_catalog.jsonb_array_elements(v_pair.value->'available')
    loop
      v_clean_modes := pg_catalog.array_append(
        v_clean_modes, private.primo_normalize_practice_mode(v_mode, 'practice.available mode')
      );
    end loop;
    select coalesce(pg_catalog.jsonb_agg(x order by x), '[]'::jsonb) into v_modes
    from (select distinct unnest(v_clean_modes) as x) q;

    v_updated := case when v_pair.value->'updatedAt' is null
                           or pg_catalog.jsonb_typeof(v_pair.value->'updatedAt') = 'null'
                      then null else private.primo_iso_timestamp(v_pair.value->'updatedAt', 'practice.updatedAt') end;
    v_availability_updated := case when v_pair.value->'availabilityUpdatedAt' is null
                                        or pg_catalog.jsonb_typeof(v_pair.value->'availabilityUpdatedAt') = 'null'
                                   then null else private.primo_iso_timestamp(v_pair.value->'availabilityUpdatedAt', 'practice.availabilityUpdatedAt') end;
    v_topic_data := v_topic_data || pg_catalog.jsonb_build_object(
      'available', v_modes,
      'updatedAt', pg_catalog.to_jsonb(v_updated),
      'availabilityUpdatedAt', pg_catalog.to_jsonb(v_availability_updated)
    );
    v_by_topic := v_by_topic || pg_catalog.jsonb_build_object(v_topic, v_topic_data);
  end loop;
  return pg_catalog.jsonb_build_object('schemaVersion', 1, 'version', 1, 'byTopic', v_by_topic);
end;
$function$;

create or replace function private.primo_sanitize_check_result(p_value jsonb, p_label text)
returns jsonb
language plpgsql
set search_path = ''
as $function$
declare
  v_result jsonb := '{}'::jsonb;
  v_key text;
  v_text text;
begin
  if p_value is null or pg_catalog.jsonb_typeof(p_value) is distinct from 'object' then
    raise exception '% must be an object', p_label using errcode = '22023';
  end if;
  -- Unknown harmless legacy keys are stripped. Only bounded evidence below survives.
  foreach v_key in array array[
    'itemId','italian','english','taskType','stage','selectedItemId','typedAnswer',
    'productionStatus','status','section','carrierId','carrierItalian','selectedCarrierId',
    'patternId','selectedPatternId'
  ]
  loop
    if p_value ? v_key then
      v_text := private.primo_plain_text(p_value->v_key, p_label || '.' || v_key, 200, true);
      v_result := v_result || pg_catalog.jsonb_build_object(v_key, pg_catalog.to_jsonb(v_text));
    end if;
  end loop;
  if p_value ? 'number' then
    v_result := v_result || pg_catalog.jsonb_build_object('number', private.primo_int(p_value->'number', p_label || '.number', 1000000));
  end if;
  if p_value ? 'correct' then
    if pg_catalog.jsonb_typeof(p_value->'correct') is distinct from 'boolean' then
      raise exception '%.correct must be boolean', p_label using errcode = '22023';
    end if;
    v_result := v_result || pg_catalog.jsonb_build_object('correct', (p_value->>'correct')::boolean);
  end if;
  return v_result;
end;
$function$;

create or replace function private.primo_sanitize_check_item(p_value jsonb, p_label text)
returns jsonb
language plpgsql
set search_path = ''
as $function$
declare
  v_result jsonb := '{}'::jsonb;
  v_key text;
  v_text text;
begin
  if p_value is null or pg_catalog.jsonb_typeof(p_value) is distinct from 'object' then
    raise exception '% must be an object', p_label using errcode = '22023';
  end if;
  foreach v_key in array array[
    'itemId','italian','english','typedAnswer','recognitionStatus','productionStatus','status'
  ]
  loop
    if p_value ? v_key then
      v_text := private.primo_plain_text(p_value->v_key, p_label || '.' || v_key, 200, v_key in ('english','typedAnswer','recognitionStatus','productionStatus'));
      v_result := v_result || pg_catalog.jsonb_build_object(v_key, pg_catalog.to_jsonb(v_text));
    end if;
  end loop;
  if p_value ? 'number' then
    v_result := v_result || pg_catalog.jsonb_build_object('number', private.primo_int(p_value->'number', p_label || '.number', 1000000));
  end if;
  return v_result;
end;
$function$;

create or replace function private.primo_sanitize_evidence_array(
  p_value jsonb, p_label text, p_cap integer, p_items boolean default false
)
returns jsonb
language plpgsql
set search_path = ''
as $function$
declare v_element jsonb; v_result jsonb := '[]'::jsonb;
begin
  if p_value is null then return v_result; end if;
  if pg_catalog.jsonb_typeof(p_value) is distinct from 'array' then
    raise exception '% must be an array', p_label using errcode = '22023';
  end if;
  if pg_catalog.jsonb_array_length(p_value) > p_cap then
    raise exception '% exceeds % entries', p_label, p_cap using errcode = '22023';
  end if;
  for v_element in select value from pg_catalog.jsonb_array_elements(p_value)
  loop
    v_result := v_result || pg_catalog.jsonb_build_array(
      case when p_items then private.primo_sanitize_check_item(v_element, p_label)
           else private.primo_sanitize_check_result(v_element, p_label) end
    );
  end loop;
  return v_result;
end;
$function$;

create or replace function private.primo_sanitize_score_summary(p_value jsonb, p_label text)
returns jsonb
language plpgsql
set search_path = ''
as $function$
declare
  v_total bigint;
  v_correct bigint;
  v_by jsonb := '{}'::jsonb;
  v_pair record;
  v_count integer;
begin
  if p_value is null or pg_catalog.jsonb_typeof(p_value) is distinct from 'object' then
    raise exception '% must be an object', p_label using errcode = '22023';
  end if;
  v_total := private.primo_int(p_value->'total', p_label || '.total', 1000);
  v_correct := private.primo_int(p_value->'correct', p_label || '.correct', 1000);
  if v_correct > v_total then raise exception '%.correct exceeds total', p_label using errcode = '22023'; end if;
  if p_value ? 'byPattern' then
    if pg_catalog.jsonb_typeof(p_value->'byPattern') is distinct from 'object' then
      raise exception '%.byPattern must be an object', p_label using errcode = '22023';
    end if;
    select count(*) into v_count from pg_catalog.jsonb_each(p_value->'byPattern');
    if v_count > 50 then raise exception '%.byPattern exceeds 50 keys', p_label using errcode = '22023'; end if;
    for v_pair in select * from pg_catalog.jsonb_each(p_value->'byPattern')
    loop
      perform private.primo_assert_object_keys(v_pair.value, array['correct','total'], p_label || '.byPattern');
      if private.primo_int(v_pair.value->'correct', p_label || '.byPattern.correct', 1000)
         > private.primo_int(v_pair.value->'total', p_label || '.byPattern.total', 1000) then
        raise exception '%.byPattern correct exceeds total', p_label using errcode = '22023';
      end if;
      v_by := v_by || pg_catalog.jsonb_build_object(
        private.primo_plain_text(pg_catalog.to_jsonb(v_pair.key), p_label || ' key', 200, false),
        pg_catalog.jsonb_build_object(
          'correct', private.primo_int(v_pair.value->'correct', p_label || '.byPattern.correct', 1000),
          'total', private.primo_int(v_pair.value->'total', p_label || '.byPattern.total', 1000)
        )
      );
    end loop;
  end if;
  return pg_catalog.jsonb_build_object('total', v_total, 'correct', v_correct, 'byPattern', v_by);
end;
$function$;

create or replace function private.primo_sanitize_check_attempt(p_value jsonb, p_topic text)
returns jsonb
language plpgsql
set search_path = ''
as $function$
declare
  v_result jsonb;
  v_id text;
  v_started_at text;
  v_completed_at text;
  v_recognition_total bigint;
  v_recognition_correct bigint;
  v_production_total bigint;
  v_production_correct bigint;
  v_administered boolean;
  v_recommendation jsonb;
  v_primary text;
  v_key text;
  v_pair record;
  v_by_carrier jsonb := '{}'::jsonb;
  v_count integer;
begin
  if p_value is null or pg_catalog.jsonb_typeof(p_value) is distinct from 'object' then
    raise exception 'Starting Check attempt must be an object' using errcode = '22023';
  end if;
  v_started_at := private.primo_iso_timestamp(p_value->'startedAt', 'attempt.startedAt');
  v_completed_at := private.primo_iso_timestamp(p_value->'completedAt', 'attempt.completedAt');
  if p_value ? 'id' then
    v_id := private.primo_plain_text(p_value->'id', 'starting-checks.attempt.id', 120, false);
  else
    -- Deterministic compatibility identity for completed pre-ID attempts.
    v_id := 'legacy-' || pg_catalog.md5(
      p_topic || ':' || v_started_at || ':' || v_completed_at || ':' || p_value::text
    );
  end if;
  v_recognition_total := private.primo_int(p_value->'recognitionTotal', 'recognitionTotal', 1000);
  v_recognition_correct := private.primo_int(p_value->'recognitionCorrect', 'recognitionCorrect', 1000);
  v_production_total := private.primo_int(p_value->'productionTotal', 'productionTotal', 1000);
  v_production_correct := private.primo_int(p_value->'productionCorrect', 'productionCorrect', 1000);
  if v_recognition_correct > v_recognition_total or v_production_correct > v_production_total then
    raise exception 'Starting Check correct count exceeds total' using errcode = '22023';
  end if;
  if pg_catalog.jsonb_typeof(p_value->'productionAdministered') is distinct from 'boolean' then
    raise exception 'productionAdministered must be boolean' using errcode = '22023';
  end if;
  v_administered := (p_value->>'productionAdministered')::boolean;
  if not v_administered and v_production_correct <> 0 then
    raise exception 'Non-administered production cannot have correct responses' using errcode = '22023';
  end if;
  v_result := pg_catalog.jsonb_build_object(
    'id', v_id,
    'version', case when p_value ? 'version' then private.primo_int(p_value->'version', 'attempt.version', 100) else 3 end,
    'startedAt', v_started_at,
    'completedAt', v_completed_at,
    'recognitionTotal', v_recognition_total, 'recognitionCorrect', v_recognition_correct,
    'productionAdministered', v_administered,
    'productionTotal', v_production_total, 'productionCorrect', v_production_correct
  );
  if p_value ? 'topicKey' then
    if private.primo_topic_id(p_value->'topicKey', 'attempt.topicKey') <> p_topic then
      raise exception 'Starting Check topicKey does not match its parent topic' using errcode = '22023';
    end if;
    v_result := v_result || pg_catalog.jsonb_build_object('topicKey', p_topic);
  end if;
  if p_value ? 'recommendation' and pg_catalog.jsonb_typeof(p_value->'recommendation') <> 'null' then
    perform private.primo_assert_object_keys(p_value->'recommendation', array['primary','primaryLabel'], 'recommendation');
    if p_value->'recommendation'->'primary' is null
       or pg_catalog.jsonb_typeof(p_value->'recommendation'->'primary') = 'null' then
      v_primary := null;
    else
      v_primary := private.primo_activity_id(p_value->'recommendation'->'primary', 'recommendation.primary');
    end if;
    v_recommendation := pg_catalog.jsonb_build_object('primary', pg_catalog.to_jsonb(v_primary));
    if p_value->'recommendation' ? 'primaryLabel' then
      v_recommendation := v_recommendation || pg_catalog.jsonb_build_object(
        'primaryLabel', private.primo_plain_text(p_value->'recommendation'->'primaryLabel', 'recommendation.primaryLabel', 200, false)
      );
    end if;
    v_result := v_result || pg_catalog.jsonb_build_object('recommendation', v_recommendation);
  end if;
  if p_value ? 'itemStatuses' then v_result := v_result || pg_catalog.jsonb_build_object('itemStatuses', private.primo_sanitize_evidence_array(p_value->'itemStatuses','itemStatuses',100,true)); end if;
  if p_value ? 'results' then v_result := v_result || pg_catalog.jsonb_build_object('results', private.primo_sanitize_evidence_array(p_value->'results','results',200,false)); end if;
  if p_value ? 'recognitionResults' then v_result := v_result || pg_catalog.jsonb_build_object('recognitionResults', private.primo_sanitize_evidence_array(p_value->'recognitionResults','recognitionResults',100,false)); end if;
  if p_value ? 'productionResults' then v_result := v_result || pg_catalog.jsonb_build_object('productionResults', private.primo_sanitize_evidence_array(p_value->'productionResults','productionResults',100,false)); end if;
  if p_value ? 'languagePatternResults' then v_result := v_result || pg_catalog.jsonb_build_object('languagePatternResults', private.primo_sanitize_evidence_array(p_value->'languagePatternResults','languagePatternResults',100,false)); end if;
  if p_value ? 'carrierResults' then v_result := v_result || pg_catalog.jsonb_build_object('carrierResults', private.primo_sanitize_evidence_array(p_value->'carrierResults','carrierResults',100,false)); end if;
  if p_value ? 'languagePatterns' then v_result := v_result || pg_catalog.jsonb_build_object('languagePatterns', private.primo_sanitize_score_summary(p_value->'languagePatterns','languagePatterns')); end if;
  if p_value ? 'carrierTotal' then
    v_result := v_result || pg_catalog.jsonb_build_object('carrierTotal', private.primo_int(p_value->'carrierTotal','carrierTotal',1000));
  end if;
  if p_value ? 'carrierCorrect' then
    v_result := v_result || pg_catalog.jsonb_build_object('carrierCorrect', private.primo_int(p_value->'carrierCorrect','carrierCorrect',1000));
  end if;
  if (v_result ? 'carrierTotal') and (v_result ? 'carrierCorrect')
     and (v_result->>'carrierCorrect')::bigint > (v_result->>'carrierTotal')::bigint then
    raise exception 'carrierCorrect exceeds carrierTotal' using errcode = '22023';
  end if;
  if p_value ? 'byCarrier' then
    if pg_catalog.jsonb_typeof(p_value->'byCarrier') is distinct from 'object' then
      raise exception 'byCarrier must be an object' using errcode = '22023';
    end if;
    select count(*) into v_count from pg_catalog.jsonb_each(p_value->'byCarrier');
    if v_count > 50 then raise exception 'byCarrier exceeds 50 keys' using errcode = '22023'; end if;
    for v_pair in select * from pg_catalog.jsonb_each(p_value->'byCarrier')
    loop
      v_by_carrier := v_by_carrier || pg_catalog.jsonb_build_object(
        private.primo_plain_text(pg_catalog.to_jsonb(v_pair.key), 'byCarrier key', 200, false),
        private.primo_score_aggregate(v_pair.value - 'italian', 'byCarrier aggregate') ||
          case when v_pair.value ? 'italian' then pg_catalog.jsonb_build_object(
            'italian', private.primo_plain_text(v_pair.value->'italian','byCarrier.italian',200,false)
          ) else '{}'::jsonb end
      );
    end loop;
    v_result := v_result || pg_catalog.jsonb_build_object('byCarrier', v_by_carrier);
  end if;
  return v_result;
end;
$function$;

create or replace function private.primo_sanitize_starting_checks(p_data jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $function$
declare
  v_by_topic jsonb := '{}'::jsonb;
  v_pair record;
  v_topic text;
  v_topic_data jsonb;
  v_history_input jsonb;
  v_attempt jsonb;
  v_clean jsonb;
  v_attempts_by_id jsonb := '{}'::jsonb;
  v_history jsonb;
  v_latest jsonb;
  v_id text;
  v_count integer;
begin
  perform private.primo_assert_object_keys(p_data, array['schemaVersion','version','byTopic'], 'starting-checks');
  if p_data ? 'version' and private.primo_int(p_data->'version', 'starting-checks.version', 3) not between 1 and 3 then
    raise exception 'Unsupported Starting Checks legacy version' using errcode = '22023';
  end if;
  if pg_catalog.jsonb_typeof(p_data->'byTopic') is distinct from 'object' then
    raise exception 'starting-checks.byTopic must be an object' using errcode = '22023';
  end if;
  select count(*) into v_count from pg_catalog.jsonb_each(p_data->'byTopic');
  if v_count > 100 then raise exception 'Starting Checks has too many topics' using errcode = '22023'; end if;
  for v_pair in select * from pg_catalog.jsonb_each(p_data->'byTopic')
  loop
    v_topic := private.primo_topic_id(pg_catalog.to_jsonb(v_pair.key), 'starting-checks topic');
    v_topic_data := v_pair.value;
    perform private.primo_assert_object_keys(v_topic_data, array['latest','history'], 'starting-checks.' || v_topic);
    if pg_catalog.jsonb_typeof(v_topic_data->'history') is distinct from 'array' then
      raise exception 'Starting Check history must be an array' using errcode = '22023';
    end if;
    if pg_catalog.jsonb_array_length(v_topic_data->'history') > 10 then
      raise exception 'Starting Check history exceeds 10 attempts' using errcode = '22023';
    end if;
    v_history_input := v_topic_data->'history';
    if v_topic_data ? 'latest' and pg_catalog.jsonb_typeof(v_topic_data->'latest') <> 'null' then
      v_history_input := v_history_input || pg_catalog.jsonb_build_array(v_topic_data->'latest');
    end if;
    v_attempts_by_id := '{}'::jsonb;
    for v_attempt in select value from pg_catalog.jsonb_array_elements(v_history_input)
    loop
      v_clean := private.primo_sanitize_check_attempt(v_attempt, v_topic);
      v_id := v_clean->>'id';
      if v_attempts_by_id ? v_id and v_attempts_by_id->v_id <> v_clean then
        raise exception 'Conflicting Starting Check copies for id %', v_id using errcode = '22023';
      end if;
      v_attempts_by_id := v_attempts_by_id || pg_catalog.jsonb_build_object(v_id, v_clean);
    end loop;
    if (select count(*) from pg_catalog.jsonb_each(v_attempts_by_id)) > 10 then
      raise exception 'Starting Check history exceeds 10 distinct attempts' using errcode = '22023';
    end if;
    select coalesce(pg_catalog.jsonb_agg(value order by (value->>'completedAt')::timestamptz), '[]'::jsonb)
      into v_history from pg_catalog.jsonb_each(v_attempts_by_id);
    if pg_catalog.jsonb_array_length(v_history) = 0 then
      v_latest := 'null'::jsonb;
    else
      v_latest := v_history->(pg_catalog.jsonb_array_length(v_history) - 1);
    end if;
    v_by_topic := v_by_topic || pg_catalog.jsonb_build_object(
      v_topic, pg_catalog.jsonb_build_object('latest', v_latest, 'history', v_history)
    );
  end loop;
  return pg_catalog.jsonb_build_object('schemaVersion', 1, 'version', 3, 'byTopic', v_by_topic);
end;
$function$;

create or replace function private.primo_sanitize_journey(p_data jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $function$
declare
  v_explored jsonb := '{}'::jsonb;
  v_cities text[] := array[]::text[];
  v_city jsonb;
  v_city_text text;
  v_cities_json jsonb;
  v_pair record;
  v_topic text;
  v_entry jsonb;
  v_clean jsonb;
  v_source text;
  v_count integer;
begin
  perform private.primo_assert_object_keys(
    p_data, array['schemaVersion','version','exploredTopics','celebratedCities','migratedPassport'], 'journey'
  );
  if p_data ? 'version' and private.primo_int(p_data->'version', 'journey.version', 1) <> 1 then
    raise exception 'Unsupported Journey version' using errcode = '22023';
  end if;
  if pg_catalog.jsonb_typeof(p_data->'exploredTopics') is distinct from 'object'
     or pg_catalog.jsonb_typeof(p_data->'celebratedCities') is distinct from 'array'
     or pg_catalog.jsonb_typeof(p_data->'migratedPassport') is distinct from 'boolean' then
    raise exception 'Journey fields have invalid types' using errcode = '22023';
  end if;
  select count(*) into v_count from pg_catalog.jsonb_each(p_data->'exploredTopics');
  if v_count > 100 then raise exception 'Journey has too many explored topics' using errcode = '22023'; end if;
  for v_pair in select * from pg_catalog.jsonb_each(p_data->'exploredTopics')
  loop
    v_topic := private.primo_topic_id(pg_catalog.to_jsonb(v_pair.key), 'journey topic');
    v_entry := v_pair.value;
    perform private.primo_assert_object_keys(
      v_entry, array['earnedAt','practicedCount','availableCount','requiredAtAward','source'],
      'journey.exploredTopics.' || v_topic
    );
    v_clean := pg_catalog.jsonb_build_object(
      'earnedAt', private.primo_iso_timestamp(v_entry->'earnedAt', 'journey.earnedAt')
    );
    if v_entry ? 'practicedCount' then v_clean := v_clean || pg_catalog.jsonb_build_object('practicedCount', private.primo_int(v_entry->'practicedCount','practicedCount',100)); end if;
    if v_entry ? 'availableCount' then v_clean := v_clean || pg_catalog.jsonb_build_object('availableCount', private.primo_int(v_entry->'availableCount','availableCount',100)); end if;
    if v_entry ? 'requiredAtAward' then v_clean := v_clean || pg_catalog.jsonb_build_object('requiredAtAward', private.primo_int(v_entry->'requiredAtAward','requiredAtAward',100)); end if;
    if v_entry ? 'source' then
      v_source := private.primo_plain_text(v_entry->'source', 'journey.source', 40, false);
      if v_source not in ('flight-path','passport-migration') then raise exception 'Invalid Journey source' using errcode = '22023'; end if;
      v_clean := v_clean || pg_catalog.jsonb_build_object('source', v_source);
    end if;
    v_explored := v_explored || pg_catalog.jsonb_build_object(v_topic, v_clean);
  end loop;
  if pg_catalog.jsonb_array_length(p_data->'celebratedCities') > 20 then
    raise exception 'Journey celebratedCities exceeds 20 entries' using errcode = '22023';
  end if;
  for v_city in select value from pg_catalog.jsonb_array_elements(p_data->'celebratedCities')
  loop
    v_city_text := private.primo_plain_text(v_city, 'journey city', 40, false);
    if v_city_text not in ('genova','torino','milano','venezia','firenze','roma','napoli','lecce','palermo','cagliari') then
      raise exception 'Invalid Journey city: %', v_city_text using errcode = '22023';
    end if;
    v_cities := pg_catalog.array_append(v_cities, v_city_text);
  end loop;
  select coalesce(pg_catalog.jsonb_agg(x order by x), '[]'::jsonb) into v_cities_json
  from (select distinct unnest(v_cities) as x) q;
  return pg_catalog.jsonb_build_object(
    'schemaVersion', 1, 'version', 1, 'exploredTopics', v_explored,
    'celebratedCities', v_cities_json,
    'migratedPassport', (p_data->>'migratedPassport')::boolean
  );
end;
$function$;

create or replace function private.primo_sanitize_state(p_store_key text, p_data jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $function$
declare
  v_store text := private.primo_assert_store_key(p_store_key);
  v_result jsonb;
  v_limit integer;
  v_forbidden text;
begin
  if p_data is null or pg_catalog.jsonb_typeof(p_data) is distinct from 'object' then
    raise exception 'Primo state must be a JSON object' using errcode = '22023';
  end if;
  if p_data ? 'schemaVersion'
     and private.primo_int(p_data->'schemaVersion', 'schemaVersion', 1) <> 1 then
    raise exception 'Unsupported Primo cloud schemaVersion' using errcode = '22023';
  end if;
  foreach v_forbidden in array array[
    'student_id','studentId','owner_user_id','ownerUserId','educator_id','educatorId',
    'learner_profile_id','product_key','store_key','auth_user_id','client_updated_at','updated_at'
  ]
  loop
    if p_data ? v_forbidden then
      raise exception 'Primo state contains forbidden envelope field: %', v_forbidden using errcode = '22023';
    end if;
  end loop;
  v_limit := case v_store
    when 'progress' then 262144
    when 'practice' then 65536
    when 'starting-checks' then 524288
    when 'journey' then 65536
  end;
  if pg_catalog.octet_length(p_data::text) > v_limit then
    raise exception 'Primo % payload exceeds % bytes', v_store, v_limit using errcode = '22001';
  end if;
  v_result := case v_store
    when 'progress' then private.primo_sanitize_progress(p_data)
    when 'practice' then private.primo_sanitize_practice(p_data)
    when 'starting-checks' then private.primo_sanitize_starting_checks(p_data)
    when 'journey' then private.primo_sanitize_journey(p_data)
  end;
  if pg_catalog.octet_length(v_result::text) > v_limit then
    raise exception 'Canonical Primo % payload exceeds % bytes', v_store, v_limit using errcode = '22001';
  end if;
  return v_result;
end;
$function$;

create or replace function private.resolve_primo_student_context()
returns table (
  resolved_student_id uuid,
  resolved_owner_user_id uuid,
  resolved_display_name text
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_auth_user_id uuid := auth.uid();
  v_is_anonymous boolean := coalesce((auth.jwt()->>'is_anonymous')::boolean, false);
  v_count integer;
begin
  if v_auth_user_id is null or v_is_anonymous is not true then
    raise exception 'Primo student access denied' using errcode = '42501';
  end if;
  select count(*) into v_count
  from public.student_auth_links as sal
  join public.students as stu
    on stu.id = sal.student_id and stu.owner_user_id = sal.owner_user_id and stu.archived_at is null
  join public.classes as cls
    on cls.id = sal.class_id and cls.owner_user_id = sal.owner_user_id and cls.archived_at is null
  join public.class_memberships as cm
    on cm.class_id = sal.class_id and cm.student_id = sal.student_id and cm.owner_user_id = sal.owner_user_id
  join public.class_product_access as cpa
    on cpa.class_id = sal.class_id and cpa.owner_user_id = sal.owner_user_id and cpa.product_key = 'primo-volo'
  where sal.auth_user_id = v_auth_user_id
    and sal.revoked_at is null
    and sal.class_id is not null
    and exists (
      select 1 from public.product_entitlements as pe
      where pe.owner_user_id = sal.owner_user_id and pe.product_key = 'primo-volo'
        and pe.status = 'active' and pe.starts_at <= pg_catalog.now() and pe.expires_at > pg_catalog.now()
    );
  if v_count <> 1 then
    raise exception 'Primo student access denied' using errcode = '42501';
  end if;
  return query
  select stu.id, sal.owner_user_id, stu.display_name
  from public.student_auth_links as sal
  join public.students as stu
    on stu.id = sal.student_id and stu.owner_user_id = sal.owner_user_id and stu.archived_at is null
  join public.classes as cls
    on cls.id = sal.class_id and cls.owner_user_id = sal.owner_user_id and cls.archived_at is null
  join public.class_memberships as cm
    on cm.class_id = sal.class_id and cm.student_id = sal.student_id and cm.owner_user_id = sal.owner_user_id
  join public.class_product_access as cpa
    on cpa.class_id = sal.class_id and cpa.owner_user_id = sal.owner_user_id and cpa.product_key = 'primo-volo'
  where sal.auth_user_id = v_auth_user_id and sal.revoked_at is null and sal.class_id is not null
    and exists (
      select 1 from public.product_entitlements as pe
      where pe.owner_user_id = sal.owner_user_id and pe.product_key = 'primo-volo'
        and pe.status = 'active' and pe.starts_at <= pg_catalog.now() and pe.expires_at > pg_catalog.now()
    );
end;
$function$;

create or replace function private.resolve_primo_student_profile(
  p_student_id uuid,
  p_owner_user_id uuid,
  p_display_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_profile_id uuid;
  v_conflict_student_id uuid;
  v_now timestamptz := pg_catalog.clock_timestamp();
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    p_owner_user_id::text || ':' || p_student_id::text || ':primo-volo', 0
  ));

  select lp.id into v_profile_id
  from public.learner_profiles as lp
  where lp.student_id = p_student_id and lp.owner_user_id = p_owner_user_id
    and lp.product_key = 'primo-volo' and lp.deleted_at is null
  order by lp.id limit 1 for update;
  if found then
    if exists (
      select 1 from public.learner_profiles as canonical_lp
      where canonical_lp.owner_user_id = p_owner_user_id and canonical_lp.product_key = 'primo-volo'
        and canonical_lp.local_profile_id = p_student_id::text and canonical_lp.id <> v_profile_id
    ) then
      raise exception 'Primo profile reconciliation required' using errcode = '23505';
    end if;
    update public.learner_profiles as target_lp
    set local_profile_id = p_student_id::text, display_name = p_display_name, updated_at = v_now
    where target_lp.id = v_profile_id;
    return v_profile_id;
  end if;

  select lp.id, lp.student_id into v_profile_id, v_conflict_student_id
  from public.learner_profiles as lp
  where lp.owner_user_id = p_owner_user_id and lp.product_key = 'primo-volo'
    and lp.local_profile_id = p_student_id::text and lp.deleted_at is null
  order by lp.id limit 1 for update;
  if found then
    if v_conflict_student_id is not null and v_conflict_student_id <> p_student_id then
      raise exception 'Primo profile belongs to another student' using errcode = '23505';
    end if;
    update public.learner_profiles as target_lp
    set student_id = p_student_id, display_name = p_display_name, updated_at = v_now
    where target_lp.id = v_profile_id;
    return v_profile_id;
  end if;

  select lp.id, lp.student_id into v_profile_id, v_conflict_student_id
  from public.learner_profiles as lp
  where lp.owner_user_id = p_owner_user_id and lp.product_key = 'primo-volo'
    and lp.deleted_at is not null
    and (lp.student_id = p_student_id or lp.local_profile_id = p_student_id::text)
  order by (lp.student_id = p_student_id) desc, lp.updated_at desc, lp.id
  limit 1 for update;
  if found then
    if v_conflict_student_id is not null and v_conflict_student_id <> p_student_id then
      raise exception 'Primo profile belongs to another student' using errcode = '23505';
    end if;
    update public.learner_profiles as target_lp
    set student_id = p_student_id, local_profile_id = p_student_id::text,
        display_name = p_display_name, deleted_at = null, updated_at = v_now
    where target_lp.id = v_profile_id;
    return v_profile_id;
  end if;

  begin
    insert into public.learner_profiles as inserted_lp (
      owner_user_id, local_profile_id, display_name, product_key, student_id, updated_at, deleted_at
    ) values (
      p_owner_user_id, p_student_id::text, p_display_name, 'primo-volo', p_student_id, v_now, null
    ) returning inserted_lp.id into v_profile_id;
  exception when unique_violation then
    select lp.id into v_profile_id
    from public.learner_profiles as lp
    where lp.owner_user_id = p_owner_user_id and lp.product_key = 'primo-volo'
      and lp.student_id = p_student_id and lp.deleted_at is null
      and lp.local_profile_id = p_student_id::text
    order by lp.id limit 1 for update;
    if not found then raise; end if;
  end;
  return v_profile_id;
end;
$function$;

create or replace function public.get_primo_student_state(p_store_key text)
returns table (
  store_key text,
  state_exists boolean,
  data jsonb,
  client_updated_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_store_key text := private.primo_assert_store_key(p_store_key);
  v_context record;
begin
  select ctx.* into strict v_context from private.resolve_primo_student_context() as ctx;
  return query
  select v_store_key, (state_row.id is not null), state_row.data,
         state_row.client_updated_at, state_row.updated_at
  from (select 1) as singleton
  left join lateral (
    select candidate_profile.*
    from public.learner_profiles as candidate_profile
    where candidate_profile.owner_user_id = v_context.resolved_owner_user_id
      and candidate_profile.product_key = 'primo-volo'
      and candidate_profile.deleted_at is null
      and (
        candidate_profile.student_id = v_context.resolved_student_id
        or (
          candidate_profile.student_id is null
          and candidate_profile.local_profile_id = v_context.resolved_student_id::text
        )
      )
    order by (candidate_profile.student_id = v_context.resolved_student_id) desc,
             candidate_profile.id
    limit 1
  ) as profile_row on true
  left join public.learning_state as state_row
    on state_row.learner_profile_id = profile_row.id
   and state_row.product_key = 'primo-volo'
   and state_row.store_key = v_store_key;
end;
$function$;

create or replace function public.save_primo_student_state(
  p_store_key text,
  p_data jsonb,
  p_base_updated_at timestamptz,
  p_write_id uuid
)
returns table (
  store_key text,
  write_id uuid,
  write_applied boolean,
  conflict boolean,
  already_current boolean,
  data jsonb,
  client_updated_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_store_key text := private.primo_assert_store_key(p_store_key);
  v_context record;
  v_profile_id uuid;
  v_canonical_data jsonb;
  v_state_row public.learning_state%rowtype;
  v_new_timestamp timestamptz;
begin
  if p_write_id is null then
    raise exception 'Primo write_id is required' using errcode = '22023';
  end if;
  select ctx.* into strict v_context from private.resolve_primo_student_context() as ctx;
  v_canonical_data := private.primo_sanitize_state(v_store_key, p_data);
  v_profile_id := private.resolve_primo_student_profile(
    v_context.resolved_student_id, v_context.resolved_owner_user_id, v_context.resolved_display_name
  );

  select state_row.* into v_state_row
  from public.learning_state as state_row
  where state_row.learner_profile_id = v_profile_id
    and state_row.product_key = 'primo-volo'
    and state_row.store_key = v_store_key
  for update;

  if not found then
    if p_base_updated_at is not null then
      return query select v_store_key, p_write_id, false, true, false,
                          null::jsonb, null::timestamptz, null::timestamptz;
      return;
    end if;
    v_new_timestamp := pg_catalog.clock_timestamp();
    begin
      insert into public.learning_state as inserted_state (
        learner_profile_id, product_key, store_key, data, client_updated_at, updated_at
      ) values (
        v_profile_id, 'primo-volo', v_store_key, v_canonical_data, v_new_timestamp, v_new_timestamp
      ) returning inserted_state.* into v_state_row;
    exception when unique_violation then
      select state_row.* into strict v_state_row
      from public.learning_state as state_row
      where state_row.learner_profile_id = v_profile_id
        and state_row.product_key = 'primo-volo' and state_row.store_key = v_store_key
      for update;
      if v_state_row.data = v_canonical_data then
        return query select v_store_key, p_write_id, false, false, true,
                            v_state_row.data, v_state_row.client_updated_at, v_state_row.updated_at;
      else
        return query select v_store_key, p_write_id, false, true, false,
                            v_state_row.data, v_state_row.client_updated_at, v_state_row.updated_at;
      end if;
      return;
    end;
    return query select v_store_key, p_write_id, true, false, false,
                        v_state_row.data, v_state_row.client_updated_at, v_state_row.updated_at;
    return;
  end if;

  if p_base_updated_at is distinct from v_state_row.updated_at then
    if v_state_row.data = v_canonical_data then
      return query select v_store_key, p_write_id, false, false, true,
                          v_state_row.data, v_state_row.client_updated_at, v_state_row.updated_at;
    else
      return query select v_store_key, p_write_id, false, true, false,
                          v_state_row.data, v_state_row.client_updated_at, v_state_row.updated_at;
    end if;
    return;
  end if;

  v_new_timestamp := greatest(
    pg_catalog.clock_timestamp(), v_state_row.updated_at + interval '1 microsecond'
  );
  update public.learning_state as target_state
  set data = v_canonical_data,
      client_updated_at = v_new_timestamp,
      updated_at = v_new_timestamp
  where target_state.id = v_state_row.id
  returning target_state.* into v_state_row;
  return query select v_store_key, p_write_id, true, false, false,
                      v_state_row.data, v_state_row.client_updated_at, v_state_row.updated_at;
end;
$function$;

alter function private.primo_assert_store_key(text) owner to postgres;
alter function private.primo_assert_object_keys(jsonb,text[],text) owner to postgres;
alter function private.primo_int(jsonb,text,bigint) owner to postgres;
alter function private.primo_iso_timestamp(jsonb,text) owner to postgres;
alter function private.primo_plain_text(jsonb,text,integer,boolean) owner to postgres;
alter function private.primo_topic_id(jsonb,text) owner to postgres;
alter function private.primo_activity_id(jsonb,text) owner to postgres;
alter function private.primo_normalize_practice_mode(jsonb,text) owner to postgres;
alter function private.primo_score_aggregate(jsonb,text) owner to postgres;
alter function private.primo_sanitize_progress(jsonb) owner to postgres;
alter function private.primo_sanitize_practice(jsonb) owner to postgres;
alter function private.primo_sanitize_check_result(jsonb,text) owner to postgres;
alter function private.primo_sanitize_check_item(jsonb,text) owner to postgres;
alter function private.primo_sanitize_evidence_array(jsonb,text,integer,boolean) owner to postgres;
alter function private.primo_sanitize_score_summary(jsonb,text) owner to postgres;
alter function private.primo_sanitize_check_attempt(jsonb,text) owner to postgres;
alter function private.primo_sanitize_starting_checks(jsonb) owner to postgres;
alter function private.primo_sanitize_journey(jsonb) owner to postgres;
alter function private.primo_sanitize_state(text,jsonb) owner to postgres;
alter function private.resolve_primo_student_context() owner to postgres;
alter function private.resolve_primo_student_profile(uuid,uuid,text) owner to postgres;
alter function public.get_primo_student_state(text) owner to postgres;
alter function public.save_primo_student_state(text,jsonb,timestamptz,uuid) owner to postgres;

revoke all on function private.primo_assert_store_key(text) from public, anon, authenticated;
revoke all on function private.primo_assert_object_keys(jsonb,text[],text) from public, anon, authenticated;
revoke all on function private.primo_int(jsonb,text,bigint) from public, anon, authenticated;
revoke all on function private.primo_iso_timestamp(jsonb,text) from public, anon, authenticated;
revoke all on function private.primo_plain_text(jsonb,text,integer,boolean) from public, anon, authenticated;
revoke all on function private.primo_topic_id(jsonb,text) from public, anon, authenticated;
revoke all on function private.primo_activity_id(jsonb,text) from public, anon, authenticated;
revoke all on function private.primo_normalize_practice_mode(jsonb,text) from public, anon, authenticated;
revoke all on function private.primo_score_aggregate(jsonb,text) from public, anon, authenticated;
revoke all on function private.primo_sanitize_progress(jsonb) from public, anon, authenticated;
revoke all on function private.primo_sanitize_practice(jsonb) from public, anon, authenticated;
revoke all on function private.primo_sanitize_check_result(jsonb,text) from public, anon, authenticated;
revoke all on function private.primo_sanitize_check_item(jsonb,text) from public, anon, authenticated;
revoke all on function private.primo_sanitize_evidence_array(jsonb,text,integer,boolean) from public, anon, authenticated;
revoke all on function private.primo_sanitize_score_summary(jsonb,text) from public, anon, authenticated;
revoke all on function private.primo_sanitize_check_attempt(jsonb,text) from public, anon, authenticated;
revoke all on function private.primo_sanitize_starting_checks(jsonb) from public, anon, authenticated;
revoke all on function private.primo_sanitize_journey(jsonb) from public, anon, authenticated;
revoke all on function private.primo_sanitize_state(text,jsonb) from public, anon, authenticated;
revoke all on function private.resolve_primo_student_context() from public, anon, authenticated;
revoke all on function private.resolve_primo_student_profile(uuid,uuid,text) from public, anon, authenticated;
revoke all on function public.get_primo_student_state(text) from public, anon, authenticated;
revoke all on function public.save_primo_student_state(text,jsonb,timestamptz,uuid) from public, anon, authenticated;
revoke all on function public.get_primo_student_state(text) from service_role;
revoke all on function public.save_primo_student_state(text,jsonb,timestamptz,uuid) from service_role;
grant execute on function public.get_primo_student_state(text) to authenticated;
grant execute on function public.save_primo_student_state(text,jsonb,timestamptz,uuid) to authenticated;

-- Production default function privileges grant service_role on new public
-- functions, so the explicit revokes above are required for these student-only
-- interfaces.

commit;
