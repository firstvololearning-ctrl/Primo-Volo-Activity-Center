# Primo Volo Italian Learning Hub — Codex Instructions

## Purpose

This is an actively developed educational product for novice Italian learners.

Preserve instructional intent, existing functionality, learner data,
practice tracking, progress data, and visual consistency.

Prefer small, reviewable changes over broad rewrites.

## Git Safety

- NEVER use `git add .`
- NEVER use `git add -A`
- NEVER stage unrelated files.
- NEVER commit unless the user explicitly says to commit or save.
- NEVER push unless the user explicitly says to push.
- NEVER force-push.
- NEVER run destructive Git commands unless explicitly instructed.
- NEVER use `git reset`, `git clean`, `git restore`, or `git checkout --`
  to discard work unless the user explicitly approves it.
- Assume the working tree may contain unfinished user work.
- Preserve all pre-existing modified and untracked files.
- Before any task, inspect `git status`.
- Before any commit, show the exact staged filenames.

## Existing Dirty Worktree

The repository commonly contains intentional local work and generated assets.

Do not touch, stage, delete, reorganize, or clean unrelated modified or
untracked files merely because they appear in `git status`.

In particular, treat these as protected unless a task explicitly concerns them:

- css/style.css when already modified
- .pdfvenv/
- cultural-resources generated ZIP/PDF assets
- images/conversations/
- untracked images/food/ assets
- images/meals/
- images/printable-games/
- worksheet draft/test PDFs
- printable draft/assets PDFs
- scripts that are unrelated to the current task

Never assume an untracked file is disposable.

## Old / Draft / Backup Assets

Do not use or modify files or folders identified as old, backup, archive,
draft, test, or generated unless the user explicitly asks for them.

## Implementation Workflow

For coding tasks:

1. Run `git status --short`.
2. Read the relevant existing code before changing anything.
3. Identify the smallest set of files needed.
4. Preserve unrelated local changes.
5. Implement the smallest safe change.
6. Run appropriate validation.
7. Show the changed-file list and diff summary.
8. Open the local preview when visual review is appropriate.
9. Stop for user approval.

Do not automatically commit or push.

## Validation

For changed JavaScript files, run:

    node --check <changed-file>

For repository changes, run:

    git diff --check

Before proposing a commit, run:

    git status --short
    git diff --stat

When staging is explicitly approved, stage only named files.

## Primo Volo Student Flow

The learner-facing home flow is:

optional student selection
→ choose a topic
→ choose an activity
→ practice
→ receive practice/progress feedback
→ work toward Italy Journey city rewards

Student selection is optional and is NOT a numbered instructional step.

The numbered learner flow begins with:

1. Choose a topic
2. Choose an activity

## Practice Tracking

Practice and mastery/accuracy are not the same thing.

Preserve this distinction.

`js/progress/flight-path.js` tracks whether activities have been practiced.

Practiced status is now shown directly on the activity cards with a check.

Do NOT recreate the separate visual Practice Path strip unless explicitly
requested.

The underlying practice-tracking logic must remain functional because it is
also used by Italy Journey exploration logic.

## Progress / Accuracy

`recordAttempt()` and the Progress Report track response attempts and accuracy.

Do not merge accuracy/mastery tracking with simple practiced/not-practiced
tracking.

## Italy Journey

`js/progress/volo-city-map.js` owns the current Italy Journey and city reward
system.

Preserve existing exploration and unlock rules unless the user explicitly
requests a change.

Current conceptual rule:

- topics become explored based on practiced available activities
- cities unlock as learners explore additional topics

Do not reset or silently migrate learner Journey progress.

The older Passport files may remain in the repository. Do not remove them
merely because the current homepage uses the city-map system.

## Student Profiles and Storage

Student profiles are optional.

Preserve local-first behavior.

Treat these as important persisted data:

- student profiles
- current student
- progress
- practice data
- starting checks
- Italy Journey data

Do not rename storage keys or change storage formats without explicitly
planning migration behavior.

Do not alter Supabase schemas or cloud-sync behavior unless the task
specifically requires it.

## UI / UX

Student-facing interfaces should be understandable to a child without
requiring teacher explanation.

Prefer:

- clear hierarchy
- obvious next actions
- feedback placed near the action it describes
- compact progress feedback
- restrained visual design
- responsive layouts

Avoid:

- duplicate progress displays
- redundant instructional strips
- unnecessary dashboards
- teacher-facing explanations dominating learner actions
- broad visual redesigns when a localized fix is sufficient

For visual changes:

1. implement locally
2. validate
3. open local preview
4. wait for visual approval
5. commit/push only if explicitly requested

## Educational Logic

Do not change instructional sequencing, scoring, practice definitions,
progress definitions, learning targets, or support rules merely to simplify
code.

If a requested technical change would alter instructional behavior, explain
that before implementing it.

## Coding Style

Prefer:

- existing project conventions
- readable code
- explicit names
- small focused changes
- minimal dependencies
- comments for instructional or business rules

Avoid unnecessary abstractions, mass formatting, and broad architectural
rewrites.

## When Uncertain

If multiple implementations would materially affect:

- instructional behavior
- learner experience
- stored data
- progress logic
- architecture

stop and present the options before choosing.

For minor implementation details that do not affect those areas, choose the
simplest safe solution.

## Definition of Done

A task is complete when:

- the requested behavior works
- unrelated behavior remains intact
- relevant syntax/tests pass
- `git diff --check` passes
- changed files are clearly identified
- unrelated files remain untouched
- the user can review the result

A completed task is NOT automatically approved for commit or push.
