> Current revision (25 October 2026): the core now has 68 direct questions, four per area, with no shared-trait bonuses or separate deeper core form. See [wording comparison](docs/core-question-review.md). Earlier counts and shared-scoring descriptions below are historical.

# Spiritual Gifts Discovery

A small, buildless web app for reflection on spiritual gifts through Scripture,
prayer, service, and church community. No account, backend, analytics, or runtime
packages are required.

## Run locally

Use Node.js 20+ for tests and Python 3 for the local server:

```sh
npm test
npm start
```

Open http://127.0.0.1:4173. Serve the files over HTTP; opening `index.html` directly
as a file will not load JavaScript modules and questionnaire JSON reliably.

For deployment, serve `index.html`, `styles.css`, `app.js`, `questions.json`, and
`src/` together from a static host. No build step is needed. Do not deploy test or
documentation files as application assets unless you intend to expose them.

## Structure

- `app.js`: browser events, initialization, and screen updates.
- `src/questionnaire.js`: question selection, validation, and seeded ordering.
- `src/navigation.js`: page progression and section completion.
- `src/scoring.js`: selected-form means, ties, and inconclusive profiles.
- `src/storage.js`: versioned browser persistence and recovery validation.
- `src/views.js`: escaped HTML rendering and Scripture/result content.
- `styles.css`: responsive layout, native radio styling, dark mode, and print rules.
- `questions.json`: full question bank, short-form selections, references, and wording.
- `tests/assessment.test.js`: dependency-free regression tests.
- `docs/content-review.md`: biblical scope, editorial choices, and limitations.

## Assessment and scoring

The default sections contain 63, 24, and 9 statements. Only the 63-statement core
is necessary for initial results. The selected 80/60/24 deeper forms are available through
optional deeper reflection; already answered statements carry over. Initial
results are explicitly preliminary, and users can return to them while keeping
additional answers from an unfinished deeper reflection.

Each short-form category uses three explicitly curated question IDs. A category
is scored only when all items in its selected form have valid answers (integers
1–5). Reverse-keyed answers are transformed with `6 - answer`. Scores are the
category mean rescaled to 0–100; they describe answers, not gift certainty.

All categories tied at the third-place cutoff are shown. Uniform profiles or
profiles with no category mean above 3 are inconclusive. A small gap at the
third-place cutoff produces a caution. These are transparent editorial rules,
not validated psychometric thresholds. Character reflections are not assigned
spiritual-maturity bands. Love is never scored and appears alongside gift results.

## Question experience

New sessions show one statement at a time. Users can switch to small groups
without losing answers. Existing saved sessions keep their original group-view
page boundaries; their layout changes only when the user chooses it.

Progress is a percentage for the current section and selected form, not a claim
of assessment confidence. Totals are available under “What to expect.” Answers
never auto-advance; Continue, Back, and Pause keep navigation deliberate.

See `docs/ux-assessment-plan.md` for the rationale and proposed user pilot.

## Persistence and updates

The app stores answers in this browser under `gifts_progress_v3`. A refresh
restores the screen, selected forms, shuffled order, page, and answers. Storage
failures are visible. There is no cross-device synchronization or offline cache.

Old `gifts_progress_v2` sessions are not migrated automatically because wording
and assessment structure changed. Incompatible or malformed sessions offer a
raw JSON download and explicit confirmation before starting the new assessment.
The legacy key remains untouched. A current-version record is replaced only
after confirmation. Downloaded raw data is an archive, not an import format.

Bump `questionnaireVersion` whenever wording, scoring meaning, or selected IDs
change. Bump the storage key only for a storage format change and add explicit
recovery support for the prior key. Keep question IDs stable when preserving their
meaning; do not silently reuse old responses for a substantively different item.

## Before a public release

Have a church content reviewer consider the interpretations documented in
`docs/content-review.md`. Pilot the short form with a small group: record whether
they finish, which statements need explanation, actual completion times, and
whether results help them reflect on serving. Obtain consent before collecting
any feedback or answers. No validity or completion-time claim is made by this app.

Shared core traits contribute a bounded supporting score. See [the Scripture mapping and scoring rationale](docs/shared-traits.md) for the formula, limits and research needs.

## Reading, sermons and sharing

Results include contextual Bible reading guides for all leading core areas (all areas are available for inconclusive profiles). Source-checked YouTube teachings are maintained in `src/learning.js`; see `docs/sermon-curation.md` for sources, theological perspective and verification limits.

The PNG card is generated locally with native canvas, includes all third-place ties, and omits answer-level data, numerical scores and optional character reflections. Preview precedes sharing. Native file sharing opens the device’s destination chooser; unsupported or failed sharing falls back to PNG download, while cancellation does not download anything. Text reports include every completed section, reading links and scoring limitations. Print/PDF expands collapsed details and restores them afterward. No report is uploaded or hosted, and no public personal-results link is generated.
