# Verification — 2026-10-24

## Automated

`npm test` and direct execution with `node tests/assessment.test.js` pass.
The suite contains 23 checks covering selected-form counts, complete-category
scoring, reverse scoring, uniform responses, ties, seeded ordering, progression,
optional sections, deeper-form carryover, incomplete earlier pages, malformed
storage, legacy recovery, storage failure, HTML escaping, love quotations,
character ordering, and access to completed results.

`node --check app.js` and `git diff --check` pass.

## Browser walkthrough

Used the Codex in-app browser against the local static server with synthetic
answers. Verified:

- Welcome → introduction → all 11 core pages → checkpoint.
- Native radio selection using the keyboard.
- Pause → resume → reload retains selected answers and question order.
- A completed neutral-response profile is inconclusive, not an arbitrary top three.
- Revised core answers produce Wisdom, Teaching, and Mercy as three leading areas.
- Love reminder appears directly after the result cards, with John 13:34 and
  1 Corinthians 13:13 quotations and passage links.
- Optional ministry (24 statements) and character (9 statements) flows finish and
  appear together in final results.
- Desktop at 1440px has a sidebar and three result columns.
- Narrow viewports at 390px and 320px remain within viewport width; mobile uses a
  single result column and compact journey indicator.
- Dark theme was visually inspected.

## Limits

Print CSS and the print action are implemented; native print/PDF output was not
visually inspected. Light theme, physical mobile devices, other browsers, and a
screen reader were not separately tested. Storage failure and malformed-data
recovery were checked with tests, not by changing browser storage settings.
The test suite cannot establish theological agreement or assessment validity.

## UX follow-up verification

Additional checks cover the one-at-a-time default, legacy page compatibility,
view-switch anchoring, section percentages, preliminary result wording, and
returning from deeper reflection without losing additional answers.

Browser verification of this follow-up covered:
- Default focus view, text-only answer labels, and live percentage updates.
- Switching to group view and back retains selected answers and progress.
- Reopening the browser page restores focus view, its current item, and 4% progress.
- A full core run in group view reaches preliminary results and retains the love reminder.
- Starting deeper reflection includes prior answers (42%); an additional answer
  remains selected after returning to initial results and reopening deeper reflection (43%).
- Desktop and 390px mobile focus layouts; the phone view has no horizontal overflow.
- No browser error/warning logs during the final walkthrough.

The local preview server briefly stopped during testing; restarting it restored
the saved session. This was a preview infrastructure interruption, not an app
storage reset. Automated tests and the browser walkthrough both finished.

## Shared-trait update (2026-10-24)

27 automated tests pass, including 63/80 core limits, normalized shared contributions, a 10-point ceiling, direct-evidence gating, unchanged optional scoring, incomplete trait answers, ties, uniform profiles, percentage progress, carryover and previous-version recovery. The earlier browser percentage examples above describe the previous questionnaire version.

## Reading and sharing update (24 October 2026)

34 automated tests pass (27 assessment and 7 export/learning tests). New checks cover tie preservation, inconclusive cards, omission of answers and character data from share cards, completed-only reports, every core area's reading and sermon mapping, long-card bounds, native share/cancellation/download fallback, and catalog source requirements.

Browser checks used an isolated temporary fixture with sample results and memory-only storage; existing saved answers were not changed. Verified gift reading panels, official video links and loaded thumbnails for expanded Wisdom and Mercy panels, a generated 1080px PNG download, and a text report download. Inspected the downloaded PNG visually. At a mobile viewport, the export controls and preview fit without horizontal overflow. Native phone share destinations and print-to-PDF dialog output were not exercised; sharing branches were tested with injected platform doubles. Sermon source verification limits are recorded in `sermon-curation.md`.

## Mobile answer-scroll fix

Replaced fieldset focus and competing page-top/scrollIntoView calls with legend focus
and one explicit scroll destination below the measured sticky progress bar.
Verified at 390 × 844 in the desktop browser: automatic single-question advance and
within-group advance keep the next question text and choices visible. Physical
mobile Safari/Chrome were not available for this check. Existing 37 tests, syntax
check, and whitespace checks pass. No questionnaire version or answers changed.

## Core revision — 25 October 2026

68 direct prompts, equal weights, no shared bonuses or deeper core offer. Version 2026-10-25.1 uses existing recovery for older answers. 34 checks pass (25 assessment, 9 export/learning), including equal means, distinct sample profiles, ties, uniform answers, progress, recovery and exports. Obsolete bonus tests were replaced. Syntax and diff checks pass. No new browser walkthrough or pastoral/user pilot was performed. These checks establish software behavior, not assessment validity.

## Repeated-answer reminder

A session-only reminder interrupts auto-advance after six consecutive identical
new answers. It appears at most once per section per page session; corrections
do not count as extra answers. Review returns focus to the selected response;
keep continues the existing navigation. Native dialog provides modal keyboard
focus and Escape dismissal. The reminder neither changes answers nor contributes
to scoring. Storage failure copy avoids promising persistence. Two new unit checks
cover thresholds, acknowledgement, section changes, corrections and resets. All
36 checks pass. Browser/physical-phone verification of the new dialog remains due.

## Reminder browser verification — 25 October 2026

Used a separate localhost origin on port 4175 so the user's saved demo session
was untouched. Desktop single-question flow: five equal responses advance;
the sixth opens the dialog. Review returns to the selected question, a correction
can be made, and Continue works. Six further equal answers do not nag again.
Reload retains progress and starts a fresh session-only reminder history.

At 390 × 844 the dialog text and both buttons fit. Keep advances to the next
unanswered question. Small-group flow triggers the reminder across group
boundaries; Escape closes it and returns to review. No error/warning console
entries were reported. Fixed the post-review helper to mention remaining group
statements when Continue is disabled. All 36 automated checks, syntax and diff
checks pass. Physical iOS/Android testing is still outstanding. Screenshot:
/tmp/gifts-pause-mobile.png. Nothing deployed.

## Certificate and report exports — 25 October 2026

PNG now uses a cream/gold double border and centred certificate-of-reflection
layout. It retains ties, inconclusive notes, Scripture and love, and explicitly
avoids certifying gifts or ordination. Detailed download is self-contained HTML
with completed-only score tables, reading links, love and next steps. Print action
opens the same report; its own print button invokes the browser's PDF/print flow.
No external images/fonts are needed by either export.

38 automated checks pass, including canvas bounds for all tied gifts, HTML
escaping and completed-only reports, and unified resource thumbnail URLs.
Browser inspected certificate and report at desktop width, and unified resources
at 390 × 844. First new love video thumbnail loaded visibly. Temporary fixtures
used synthetic results and did not touch saved user answers; they were removed.
The final native print dialog and physical-phone sharing were not exercised.
Screenshots: /tmp/gifts-certificate-preview.png, /tmp/gifts-report-preview.png,
/tmp/gifts-resources-mobile.png. Changes remain local.
