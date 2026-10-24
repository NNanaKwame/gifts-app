# Scripture and content review

Update: the current core uses 63 initial / 80 deeper statements with bounded shared-trait support. See [shared-traits.md](shared-traits.md). Earlier form sizes and scoring descriptions below document the prior design.

## Boundaries

Scripture is the basis for the categories; the questions are editorial reflection
prompts, not quotations, a biblical scoring system, or a diagnosis of spiritual
gifts. Self-reported experiences cannot establish that a miracle, revelation, or
healing occurred. The Holy Spirit distributes gifts for the common good
(1 Corinthians 12:7–11). All believers belong to the body; a low or uncertain
profile is not a verdict on someone’s faith or value (1 Corinthians 12:12–27).

The core follows the gifts/service named in 1 Corinthians 12 and Romans 12:3–8.
Some practical applications overlap (especially leading and administration).
Apostolic questions explore pioneering gospel service, not appointment to the
office of apostle. The knowledge category does not assume that an unlearned fact
or an intuition is necessarily revelation. Prophecy and discernment prompts
include weighing messages, consistent with 1 Corinthians 14:29 and 1 John 4:1.
Christians differ about how these gifts operate today; the app acknowledges that
rather than claiming to resolve the disagreement.

The optional ministry section distinguishes roles named in Ephesians 4:11 from
biblical practices/examples. Hospitality, intercession, music, craftsmanship,
and prayer in spiritual struggles are not represented as additional named gifts
in 1 Corinthians 12 or Romans 12. Luke 10:17–20 replaces reliance on Mark 16:17
for the spiritual-struggles category; its prompts do not diagnose spiritual causes.
Character reflections remain separate from gift identification.

## Love in the results

Both checkpoints and final gift results contain “Above all, love,” including
inconclusive profiles and printed results. The text explains that gifts and
generosity without love gain nothing (1 Corinthians 13:1–3). It correctly places
“the greatest” in the context of faith, hope, and love (1 Corinthians 13:13),
rather than making love a fourth scored gift.

Short quotations (NIV):
- “Love one another.” — Jesus, John 13:34.
- “But the greatest of these is love.” — 1 Corinthians 13:13.

Verified source links:
- [1 Corinthians 12 and Romans 12](https://www.biblegateway.com/passage/?search=1+Corinthians+12%2CRomans+12&version=NIV)
- [1 Corinthians 14](https://www.biblegateway.com/passage/?search=1+Corinthians+14&version=KJV)
- [John 13:34–35 and 1 Corinthians 13](https://www.biblegateway.com/passage/?search=John+13%3A34-35%2C1+Corinthians+13&version=NIV)

## Short-form selection

Three prompts per category cover different aspects of reflection where possible:
actual experience, service practices, and feedback from others. Comparative
wording, arbitrary time windows, risky behavior as evidence of faith, and certainty
about untested impressions were revised. The full bank is retained with clearer
wording; historical wording remains in Git history. The shorter version has not
been established as equivalent to the original bank. Neither version should be
presented as a validated instrument.

## Category map and selected prompts

| Category | Scripture | Short-form IDs | Classification |
| --- | --- | --- | --- |
| Wisdom | 1 Cor 12:8 | wisdom_2, wisdom_5, wisdom_7 | Named in the gift or ministry lists |
| Knowledge | 1 Cor 12:8 | knowledge_3, knowledge_5, knowledge_6 | Named in the gift or ministry lists |
| Faith | 1 Cor 12:9 | faith_1, faith_2, faith_6 | Named in the gift or ministry lists |
| Healings | 1 Cor 12:9, 28 | healings_1, healings_3, healings_6 | Named in the gift or ministry lists |
| Miracles | 1 Cor 12:10, 28 | miracles_2, miracles_3, miracles_6 | Named in the gift or ministry lists |
| Prophecy | 1 Cor 12:10; Rom 12:6; 1 Cor 14:3, 29 | prophecy_3, prophecy_4, prophecy_5 | Named in the gift or ministry lists |
| Discerning of Spirits | 1 Cor 12:10; 1 John 4:1 | discerning_2, discerning_5, discerning_7 | Named in the gift or ministry lists |
| Tongues | 1 Cor 12:10, 28; 1 Cor 14:27–28 | tongues_1, tongues_4, tongues_5 | Named in the gift or ministry lists |
| Interpretation of Tongues | 1 Cor 12:10 | interpretation_1, interpretation_3, interpretation_4 | Named in the gift or ministry lists |
| Service / Helps | 1 Cor 12:28; Rom 12:7 | helps_1, helps_4, helps_6 | Named in the gift or ministry lists |
| Teaching | 1 Cor 12:28; Rom 12:7 | teaching_2, teaching_4, teaching_7 | Named in the gift or ministry lists |
| Encouragement | Rom 12:8 | exhortation_1, exhortation_2, exhortation_4 | Named in the gift or ministry lists |
| Giving | Rom 12:8 | giving_3, giving_4, giving_5 | Named in the gift or ministry lists |
| Leadership | Rom 12:8 | leadership_2, leadership_3, leadership_6 | Named in the gift or ministry lists |
| Administration | 1 Cor 12:28 | administration_1, administration_2, administration_7 | Named in the gift or ministry lists |
| Mercy | Rom 12:8 | mercy_2, mercy_3, mercy_7 | Named in the gift or ministry lists |
| Pioneering gospel service (apostolic) | 1 Cor 12:28 | apostolic_4, apostolic_6, apostolic_7 | Named in the gift or ministry lists |
| Evangelism | Eph 4:11 | evangelism_2, evangelism_3, evangelism_6 | Named in the gift or ministry lists |
| Pastoring / Shepherding | Eph 4:11 | pastoring_2, pastoring_4, pastoring_5 | Named in the gift or ministry lists |
| Missionary / Cross-Cultural | Acts 13:2-3 | missionary_3, missionary_5, missionary_6 | Biblical practice of service |
| Hospitality | 1 Pet 4:9-10 | hospitality_1, hospitality_3, hospitality_8 | Biblical practice of service |
| Intercession | 1 Tim 2:1; Col 4:12 | intercession_2, intercession_3, intercession_7 | Biblical practice of service |
| Worship / Music | Col 3:16; 1 Chr 25:1–7 | worship_2, worship_4, worship_5 | Biblical practice of service |
| Craftsmanship / Creative | Exod 31:1-5 | craftsmanship_2, craftsmanship_3, craftsmanship_6 | Biblical practice of service |
| Prayer in spiritual struggles | Luke 10:17–20 | deliverance_1, deliverance_4, deliverance_5 | Biblical practice of service |
| Faithfulness | 1 Cor 4:2 | faithfulness_1, faithfulness_2, faithfulness_3 | Christian character and practice |
| Humility & Teachability | Rom 12:3 | humility_1, humility_2, humility_3 | Christian character and practice |
| Rooted in Scripture | 1 Thess 5:20-21; Acts 17:11 | scripture_1, scripture_3, scripture_5 | Christian character and practice |

## Interpretation notes

- **Knowledge:** 1 Corinthians 12 names a word or message of knowledge without describing a questionnaire test for it. These prompts explore sharing understanding for others’ good; Christians differ on how this gift operates.
- **Healings:** God gives gifts of healings as He wills (1 Corinthians 12:9–11). An answer to this questionnaire cannot verify a healing or guarantee an outcome.
- **Miracles:** 1 Corinthians 12:10 names the working of miracles. These answers describe reported experiences; they do not verify a miracle or establish its cause.
- **Prophecy:** Messages should build up others and be weighed by the church (1 Corinthians 14:3, 29). A score does not establish that a message comes from God.
- **Discerning of Spirits:** These prompts explore careful discernment; a feeling or suspicion alone does not establish a spiritual cause (1 John 4:1).
- **Leadership:** Romans 12:8 names leading; 1 Corinthians 12:28 names administrations. These related categories may overlap.
- **Administration:** Planning is a practical application of administrations in 1 Corinthians 12:28, not a complete biblical definition of the gift.
- **Pioneering gospel service (apostolic):** 1 Corinthians 12:28 names apostles. These prompts explore pioneering gospel service, not apostolic office or authority. Christians differ on the present-day application of this role.
- **Prayer in spiritual struggles:** Luke 10 describes Jesus’ disciples’ ministry and directs their joy toward salvation (verses 17–20). It does not list a separate deliverance gift. These prompts concern supported prayer, not diagnosing spiritual causes.

## Review still needed

A pastoral/theological reviewer should assess the practical definitions against
the church’s understanding of the passages. A user pilot should evaluate clarity
and fatigue. Code tests check content structure and result behavior; they cannot
prove theological agreement or assessment validity.

## Balanced wording revision — 2026-10-24.3

The core now includes 23 reverse-scored prompts: one of each gift’s three initial
items (also retained in its four deeper items), plus one per shared-trait pair.
Counts remain 63 initial / 80 deeper. Reverse scoring uses 6 minus the response.
The wording concerns difficulty, limited experience or feedback, rather than moral
failure. Disagreement alone is not evidence of a gift; the other direct prompts
and church reflection remain necessary. Limited opportunity can affect answers.

A fully completed form answered entirely Agree/Strongly agree or entirely
Disagree/Strongly disagree across both wordings is inconclusive, with a neutral
review prompt. This is an editorial safeguard, not a validated dishonesty test.
Tests cover mixed agreement patterns, equal reverse counts, keyed evidence that
still identifies distinct leading areas, and bounded shared support. Neither
reverse wording nor these tests establishes assessment validity; pilot for clarity.

The questionnaire version changes because existing answers must not be applied to
reversed wording. The existing recovery/download flow preserves old saved data
until the user chooses to start the updated reflection. Optional sections remain
unchanged. No biblical category or Scripture reference was added or redefined.
