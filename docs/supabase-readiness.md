# Primo Volo Supabase Readiness

Primo Volo remains **local-first**. This pass adds no Supabase account,
network request, key, authentication flow, or cloud write.

Learner-data features now share one storage boundary:

`window.PrimoVoloStorage`

The provider behind it is still browser `localStorage`.

## Registered data domains

- Student profiles — `primoVoloStudentsV1` — future cloud candidate.
- Current-student selection — `primoVoloCurrentStudentV1` — device preference; do not cloud-sync.
- Scored Progress — `primoVoloActivityCenterProgress[:student:<id>]` — future cloud candidate.
- Practice Path — `primoVoloFlightPathPractice[:student:<id>]` — future cloud candidate.
- Italy Journey — `primoVoloCityJourneyV1[:student:<id>]` — future cloud candidate.
- Legacy Passport migration data — `primoVoloPassportAchievements[:student:<id>]` — legacy only.

Existing `student.id` values remain the durable app-side learner IDs.
Display names may change without changing learner identity.

## Later cloud-sync model

The current app expects synchronous reads, while Supabase is asynchronous.
A future bridge should therefore keep the browser store as a local cache:

1. authenticate;
2. load permitted learner data from Supabase;
3. hydrate the local cache;
4. let the existing app continue synchronous reads;
5. listen for `primo-volo-storage-change`;
6. sync changes in the background;
7. enforce Row Level Security.

Useful development checks:

```js
PrimoVoloStorage.getStatus()
PrimoVoloStorage.audit()
PrimoVoloStorage.exportSnapshot()
```

`exportSnapshot()` is inspection/migration support only and uploads nothing.

The shared First Volo authentication/account design should be established
once and then reused across products. Never put a Supabase service-role
key in public browser code.
