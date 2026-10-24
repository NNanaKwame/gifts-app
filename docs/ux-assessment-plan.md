# Assessment depth and UX follow-up

Update: the current core uses 63 initial / 80 deeper statements with bounded shared-trait support. See [shared-traits.md](shared-traits.md). Earlier form sizes and scoring descriptions below document the prior design.

## What we can claim

The 51-statement form has three questions per core category. Moving a single
answer by one point changes that category's mean by 1/3, or 8.33 points on the
0–100 response scale. A close third/fourth ranking can therefore change with one
answer. The first result is explicitly preliminary. The original 121-statement
bank is also unvalidated; its length is not evidence of accuracy.

Content relevance, understandable questions, consistency, and appropriate
interpretation need separate evaluation. See [Boateng et al., 2018, scale
development and validation](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2018.00149/full).
This research informs questionnaire evaluation, not a claim that spiritual gifts
can be scientifically established by a survey.

## Implemented in this pass

- New sessions default to one statement at a time, with a small-group option.
  Existing sessions retain their old page boundaries until the user switches.
- Visible progress is a percentage of answered items in the selected section,
  including accessible progress text. It is not a confidence percentage.
- Page counts and question numbering are removed. Length remains available in
  collapsed “What to expect” disclosures rather than repeated prompts.
- Progress and Pause remain available while scrolling; optional sections do not
  crowd the phone question view.
- Every option has a text label. Selecting an answer does not jump forward.
  Users explicitly Continue and can change their answer or go Back.
- Layout changes preserve answers, percentage, and the first unanswered item in
  the current group. The preference is saved without invalidating existing data.
- Initial results say preliminary and invite deeper reflection, with a stronger
  explanation for tied, close, or inconclusive profiles. No scoring thresholds
  or question meanings changed in this UX pass.
- Deeper reflection covers all areas, preserves prior answers, and has its own
  progress denominator. Users can return to initial results and keep extra answers.
- The Scripture references and the love reminder are retained.

One-at-a-time is a design hypothesis to test, consistent with the
[NHS service manual's initial form-design guidance](https://service-manual.nhs.uk/content/how-to-write-good-questions-for-forms/get-the-questions-into-order).
It can reduce visible material but requires more navigation, which is why group
view remains available. Percentage progress may feel calmer; it does not shorten
the underlying work or guarantee lower fatigue.

## Next experiments, before changing question counts again

1. Ask a pastoral reviewer to check whether each category's questions represent
   distinct aspects of its Scripture-based definition. Remove repetition; do not
   add statements merely to reach a target count.
2. Have a small group explain what each statement means to them. Note confusion,
   questions about unfamiliar language, and lack of ministry opportunities.
3. Compare initial and full profiles for consenting participants, including ties,
   third/fourth changes, and categories that rise from outside the initial leaders.
   Agreement with the full form is consistency, not proof that either is correct.
4. Compare one-at-a-time and group view for completion, voluntary stopping,
   perceived effort, and answer changes. Measure actual time before adding an ETA.
5. Consider a balanced intermediate form (for example, four or five carefully
   reviewed prompts per category) only if it adds useful coverage. The exact
   count should follow review and testing, not an assumption about validity.
6. Evaluate targeted follow-ups only after that. Asking solely about initial top
   categories can reinforce early mistakes. Retain coverage of other categories,
   disclose the additional stage, and avoid invented confidence percentages.

No analytics or collection of spiritual responses has been added. A pilot needs
informed consent and an agreed feedback process. Community feedback and serving
over time remain part of discernment; results never confer office or authority.
