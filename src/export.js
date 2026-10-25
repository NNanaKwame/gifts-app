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
  lines.push('', 'Scores describe responses, not certainty, spiritual rank or maturity. This is a personal reflection, not a biblical formula.',
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
  ctx.fillStyle = '#fffaf0'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#a58649'; ctx.lineWidth = 2; ctx.strokeRect(34, 34, canvas.width - 68, canvas.height - 68);
  ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);
  ctx.textAlign = 'center';
  let y = 108;
  const line = (text, size, color = '#203c34', gap = size * 1.35) => {
    ctx.font = `${size}px sans-serif`; ctx.fillStyle = color; ctx.fillText(text, 540, y); y += gap;
  };
  line('SPIRITUAL GIFTS DISCOVERY', 25, '#967641', 75);
  line('Certificate of Reflection', 54, '#203c34', 65);
  line('A personal reflection on gifts and Christian service', 25, '#53645e', 72);
  for (const row of rows) {
    row.name.forEach(text => line(text, 42, '#203c34', 54));
    row.reference.forEach(text => line(text, 25, '#53645e', 34)); y += 36;
  }
  note.forEach(text => line(text, 28, '#53645e', 38));
  y = Math.max(y + 50, canvas.height - 190);
  line('Above all, love.', 44, '#967641', 50);
  line('1 Corinthians 13:13 · John 13:34', 25, '#53645e', 48);
  line('Personal reflection · not ordination or certification of gifts', 24);
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

// A self-contained report: opens offline and prints without loading the app.
export function buildReportHtml(questionnaire, state) {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const summary = resultSummary(questionnaire, state);
  const sections = [...state.completed].sort((a,b)=>a-b).map(index => {
    const group = questionnaire.groups[index];
    const score = scoreGroup(group, state.answers, state.modes[index]);
    const rows = index === 2 ? group.categories.map(c=>score.rows.find(r=>r.category.id===c.id)).filter(Boolean) : score.rows;
    return '<section><h2>'+escape(group.title)+'</h2><table><thead><tr><th>Area</th><th>Reflection score</th><th>Scripture</th></tr></thead><tbody>'+rows.map(row=>'<tr><td><strong>'+escape(row.category.name)+'</strong><p>'+escape(row.category.description)+'</p></td><td>'+row.percent+'/100</td><td>'+escape(row.category.scripture)+'</td></tr>').join('')+'</tbody></table></section>';
  }).join('');
  return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Spiritual Gifts — Reflection Report</title><style>body{margin:0;background:#edece6;color:#203c34;font:16px/1.6 Georgia,serif}main{max-width:900px;margin:32px auto;padding:48px;background:#fffdf6;border-top:8px solid #967641}header{border-bottom:1px solid #bba477;padding-bottom:24px}h1{font-size:36px;line-height:1.2}h2{margin-top:36px}small,.label{font:12px/1.5 Arial,sans-serif;text-transform:uppercase;letter-spacing:2px}table{border-collapse:collapse;width:100%;font:14px/1.5 Arial,sans-serif}th,td{padding:12px;text-align:left;border-bottom:1px solid #ddd;vertical-align:top}td p{margin:6px 0;color:#53645e}section{margin-top:24px}.love{border-left:4px solid #967641;padding:8px 24px;background:#f7f4e9}a{color:#21594d}@media(max-width:600px){main{margin:0;padding:20px}th,td{padding:6px;font-size:12px}h1{font-size:28px}}@media print{.print-control{display:none}@page{size:A4;margin:16mm}body{background:white}main{margin:0;padding:0;border:0}tr,.love{break-inside:avoid}thead{display:table-header-group}h2{break-after:avoid}}</style><main><button class="print-control" onclick="window.print()">Print report / save PDF</button><header><p class="label">Spiritual Gifts Discovery · Personal reflection</p><h1>Reflection Report</h1><p>Completed sections, Scripture readings and steps for serving.</p></header><section><h2>Leading areas to explore</h2><p>'+escape(summary.note)+'</p><ul>'+summary.gifts.map(g=>'<li><strong>'+escape(g.name)+'</strong> — '+escape(g.scripture)+'</li>').join('')+'</ul><p>'+escape(questionnaire.results.disclaimer)+'</p></section>'+sections+'<section><h2>Read and reflect</h2>'+scoreGroup(questionnaire.groups[0],state.answers,state.modes[0]).top.map(row=>{const r=readingFor(row.category);return '<h3>'+escape(row.category.name)+'</h3><p><a href="'+escape(passageUrl(r.foundation))+'">'+escape(r.foundation)+'</a> · <a href="'+escape(passageUrl(r.further))+'">'+escape(r.further)+'</a></p><p>'+escape(r.question)+'</p>';}).join('')+'</section><section class="love"><h2>Above all, love</h2><p>'+escape(questionnaire.results.love.body)+'</p>'+questionnaire.results.love.quotes.map(q=>'<p>“'+escape(q.text)+'” — '+escape(q.reference)+'</p>').join('')+'</section><section><h2>Next steps</h2><ol>'+questionnaire.results.nextSteps.map(t=>'<li>'+escape(t)+'</li>').join('')+'</ol></section><footer><p>Scores describe responses, not certainty, spiritual rank or maturity. This report includes completed optional sections. Share it thoughtfully.</p><small>Use your browser’s Print menu to save this report as PDF.</small></footer></main></html>';
}
