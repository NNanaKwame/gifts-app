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
