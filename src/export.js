import { scoreGroup } from './scoring.js';
import { readingFor, passageUrl } from './learning.js';

export function resultSummary(questionnaire, state) {
  if (!state.completed.includes(0)) throw new Error('Complete the gifts reflection first.');
  const score = scoreGroup(questionnaire.groups[0], state.answers, state.modes[0]);
  return {
    title: 'My gifts reflection',
    stage: 'Gifts reflection',
    gifts: score.top.map(row => ({ name: row.category.name, scripture: row.category.scripture })),
    tied: score.tied,
    note: score.inconclusive ? 'My answers do not yet show clear leading areas.'
      : score.tied ? 'Includes all areas tied at third place.' : 'Areas to explore through prayer, Scripture and service.',
    love: 'Above all, love. — 1 Corinthians 13:13',
  };
}

export function shareText(summary) {
  return [summary.title, summary.stage, ...summary.gifts.map(gift => `${gift.name} (${gift.scripture})`), summary.note,
    summary.love, 'A reflection, not a declaration of my gifts.'].join('\n');
}

export function buildReport(questionnaire, state) {
  const lines = [shareText(resultSummary(questionnaire, state)), '', questionnaire.results.disclaimer];
  for (const index of [...state.completed].sort((a, b) => a - b)) {
    const group = questionnaire.groups[index];
    const score = scoreGroup(group, state.answers, state.modes[index]);
    const rows = index === 2 ? group.categories.map(c => score.rows.find(r => r.category.id === c.id)).filter(Boolean) : score.rows;
    lines.push('', group.title.toUpperCase(), index === 0 ? 'Gifts reflection' : state.modes[index] === 'short' ? 'Initial reflection' : 'Deeper reflection');
    for (const row of rows) {
      lines.push(`${row.category.name}: ${row.percent}/100`, row.category.description, passageUrl(row.category.scripture));
      if (group.sharedTraits) lines.push(`Direct responses: ${((row.directMean - 1) * 25).toFixed(1)}; shared contribution: +${row.bonusPoints.toFixed(1)} points.`);
    }
    if (index === 0) {
      lines.push('', 'READ AND REFLECT');
      for (const row of score.top) {
        const reading = readingFor(row.category);
        lines.push(row.category.name, passageUrl(reading.foundation), passageUrl(reading.further), reading.question);
      }
    }
  }
  lines.push('', 'Scores describe responses, not certainty, spiritual rank or maturity. Shared-trait mappings and weights are editorial choices, not a biblical formula.',
    '', 'ABOVE ALL, LOVE', questionnaire.results.love.body,
    ...questionnaire.results.love.quotes.map(q => `“${q.text}” — ${q.reference} (${q.translation})`),
    '', 'NEXT STEPS', ...questionnaire.results.nextSteps);
  return lines.join('\n\n');
}

// Draw locally: no third-party images, fonts, personal answers or network requests.
export function createCard(summary, createCanvas = () => document.createElement('canvas')) {
  const canvas = createCanvas();
  canvas.width = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Image export is unavailable in this browser.');
  const wrap = (text, size, width = 920) => {
    ctx.font = `${size}px sans-serif`;
    const lines = []; let line = '';
    for (const word of text.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > width) { lines.push(line); line = word; }
      else line = next;
    }
    if (line) lines.push(line);
    return lines;
  };
  const rows = summary.gifts.map(gift => ({ name: wrap(gift.name, 42), reference: wrap(gift.scripture, 25) }));
  const note = wrap(summary.note, 28);
  canvas.height = Math.max(1080, 580 + rows.reduce((sum, row) => sum + row.name.length * 54 + row.reference.length * 34 + 36, 0) + note.length * 38);
  ctx.fillStyle = '#173c32'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#c9b484'; ctx.lineWidth = 2; ctx.strokeRect(34, 34, canvas.width - 68, canvas.height - 68);
  let y = 108;
  const line = (text, size, color = '#f5f4eb', gap = size * 1.35) => {
    ctx.font = `${size}px sans-serif`; ctx.fillStyle = color; ctx.fillText(text, 80, y); y += gap;
  };
  line('SPIRITUAL GIFTS DISCOVERY', 25, '#c9b484', 75);
  line(summary.title, 58, '#f5f4eb', 65);
  line(summary.stage, 25, '#bdd4c8', 72);
  for (const row of rows) {
    row.name.forEach(text => line(text, 42, '#f5f4eb', 54));
    row.reference.forEach(text => line(text, 25, '#bdd4c8', 34)); y += 36;
  }
  note.forEach(text => line(text, 28, '#bdd4c8', 38));
  y = Math.max(y + 50, canvas.height - 190);
  line('Above all, love.', 44, '#c9b484', 50);
  line('1 Corinthians 13:13 · John 13:34', 25, '#bdd4c8', 48);
  line('A reflection, not a declaration of my gifts.', 24);
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not create the image.')), 'image/png'));
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export async function shareCard(summary, blob, platform = navigator) {
  try {
    if (typeof File === 'undefined') return 'download';
    const file = new File([blob], 'my-gifts-reflection.png', { type: 'image/png' });
    if (platform.share && platform.canShare?.({ files: [file] })) {
      await platform.share({ files: [file], title: summary.title, text: shareText(summary) });
      return 'shared';
    }
  } catch (error) {
    if (error.name === 'AbortError') return 'cancelled';
    // Unsupported file sharing or a browser restriction still permits local export.
  }
  return 'download';
}
