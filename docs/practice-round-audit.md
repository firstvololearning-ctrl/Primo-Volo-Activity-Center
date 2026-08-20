# Practice Round Coverage Audit

## Instructional rule

A practice round should use:

**random order → guaranteed target coverage → finite endpoint**

Completing a round means that every eligible target was presented at
least once. It does **not** mean mastery, proficiency, or that every
first response was correct.

## Implemented in this pass

The following activities now use coverage-first rounds:

- Scegli · Choose
- Ascolta · Listen
- Abbina · Match
- Memoria · Memory
- Completa · Complete
- Scrivi · Write

For Scegli, Ascolta, Completa, and Scrivi, every vocabulary target is
drawn once from a shuffled deck before the round ends.

For Abbina and Memoria, the activity still uses manageable boards of up
to six items, but later boards draw from the remaining targets instead
of reshuffling the full vocabulary again. For example, a 14-item topic
runs as 6 → 6 → 2 → Round Complete.

A new round reshuffles the full set. The first item of a new round is
also prevented from immediately repeating the item that ended the
previous round when more than one target is available.

## Audit of the remaining language-use activities

### Parole in azione · Words in Action — needs the same coverage rule

Current target selection is still random in several branches, including
the general vocabulary path and special topic paths such as Greetings,
Seasons, Places, and Daily Routines.

Carrier-phrase variation and optional expansion-detail variation may
remain random because those are supports/variations rather than the
primary vocabulary target. The primary target should move to the shared
coverage-round system.

### Assembla · Assemble — needs the same coverage rule

The current target noun/item is randomly selected from the compatible
vocabulary pool. It can therefore repeat before all compatible targets
have been represented.

Recommendation: use the shared coverage-round system over the compatible
target pool, with its own `assemble-sentences` round.

### Conversiamo · Conversation — needs the same coverage rule

Weather/Classroom conversation practice currently chooses its picture /
target randomly from the topic vocabulary. It can repeat indefinitely.

Recommendation: use the shared coverage-round system while keeping the
student's Choose/Write response-mode switch intact.

### Presentiamoci! · Introductions — already finite; no change needed

Presentiamoci already progresses by question index through its fixed
question set, displays `Domanda X di Y`, reaches a completion screen,
and offers a play-again action. It already has the finite coverage
behavior we want.

## Next refactor

Move the primary targets in Parole in azione, Assembla, and Conversiamo
onto `window.PrimoVoloPracticeRounds`. Do not convert random distractor
order or optional language-expansion variation into fixed sequences;
the coverage guarantee is for instructional targets.
