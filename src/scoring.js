import { categoryItems, groupItems, isAnswer } from './questionnaire.js';

export function scoreGroup(group, answers, mode = 'short') {
  const rows = group.categories.flatMap(category => {
    const items = categoryItems(category, mode);
    // Score only complete categories against the selected form, never the full bank by accident.
    if (!items.every(item => isAnswer(answers[item.id]))) return [];
    const directMean = items.reduce((sum, item) =>
      sum + (item.reverse ? 6 - answers[item.id] : answers[item.id]), 0) / items.length;
    const traits = (group.sharedTraits ?? []).filter(trait => trait.categoryIds.includes(category.id));
    if (!traits.every(trait => trait.items.every(item => isAnswer(answers[item.id])))) return [];
    const traitMeans = traits.map(trait => trait.items.reduce((sum, item) =>
      sum + (item.reverse ? 6 - answers[item.id] : answers[item.id]), 0) / trait.items.length);
    const sharedMean = traitMeans.length ? traitMeans.reduce((sum, value) => sum + value, 0) / traitMeans.length : 3;
    // Editorial supporting signal: average overlaps, never accumulate bonuses per link.
    // At most 10/100 points; neutral/low direct evidence cannot be promoted by traits.
    const bonus = directMean > 3 ? Math.min(5 - directMean, Math.max(0, sharedMean - 3) * 0.2) : 0;
    const mean = directMean + bonus;
    return [{ category, mean, directMean, sharedMean, bonusPoints: bonus * 25,
      percent: Math.round((mean - 1) * 25) }];
  }).sort((left, right) => right.mean - left.mean);

  const groupMean = rows.reduce((sum, row) => sum + row.mean, 0) / (rows.length || 1);
  // A low or uniform profile cannot meaningfully identify three leading gifts.
  const answeredItems = groupItems(group, mode);
  // A uniformly one-sided response to both wordings cannot support a ranking.
  // This flags a pattern, not dishonesty or lack of gifts.
  const oneSided = answeredItems.some(item => item.reverse) &&
    answeredItems.every(item => isAnswer(answers[item.id])) &&
    (answeredItems.every(item => answers[item.id] >= 4) ||
     answeredItems.every(item => answers[item.id] <= 2));
  const inconclusive = oneSided || rows.length === 0 || rows[0].mean <= 3 ||
    rows.every(row => Math.abs(row.directMean - rows[0].directMean) < 1e-9);
  const cutoff = rows[Math.min(2, rows.length - 1)]?.mean;
  // Include everyone tied for third, rather than using JSON order to choose a winner.
  const top = inconclusive ? [] : rows.filter(row => row.mean >= cutoff - 1e-9);
  return {
    rows, top, groupMean, inconclusive, oneSided,
    tied: top.length > 3,
    close: rows.length > 3 && rows[2].mean - rows[3].mean > 1e-9 && rows[2].mean - rows[3].mean < 0.34,
  };
}
