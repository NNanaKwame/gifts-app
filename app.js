const KEY = 'gifts_progress_v2', PER = 5, app = document.getElementById('app');
let Q, S, ORD = {};
const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)) } catch (e) { } };
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) } catch (e) { return null } };
const fresh = () => ({ v: Q.questionnaireVersion, seed: Math.floor(Math.random() * 1e9), ans: {}, screen: 'welcome', g: 0, p: 0, done: [] });
const rng = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 };
function order(gi) {
  if (ORD[gi]) return ORD[gi];
  const r = rng(S.seed + gi * 101);
  const a = Q.groups[gi].categories.flatMap(c => c.items.map(i => ({ ...i, cat: c.id })));
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  for (let i = 1; i < a.length; i++)if (a[i].cat === a[i - 1].cat) {
    for (let j = i + 1; j < a.length; j++)if (a[j].cat !== a[i - 1].cat) { [a[i], a[j]] = [a[j], a[i]]; break }
  }
  return ORD[gi] = a;
}
function score(gi) {
  const rows = Q.groups[gi].categories.map(c => {
    const v = c.items.filter(i => S.ans[i.id]).map(i => i.reverse ? 6 - S.ans[i.id] : S.ans[i.id]);
    if (v.length < c.items.length * Q.scoring.perCategory.minAnsweredFraction) return null;
    const m = v.reduce((a, b) => a + b, 0) / v.length;
    return { c, m, pct: Math.round((m - 1) / 4 * 100) };
  }).filter(Boolean);
  const own = rows.reduce((a, r) => a + r.m, 0) / (rows.length || 1);
  rows.forEach(r => r.rel = r.m - own);
  return { rows, own };
}
const card = r => `<div class="res"><header><h3>${r.c.name}</h3><span class="pct">${r.pct}%</span></header>
<div class="meter"><i style="width:${r.pct}%"></i></div><p class="small">${r.c.description}</p><span class="tag">${r.c.scripture}</span></div>`;
function gifts(gi) {
  const { rows, own } = score(gi), top = [...rows].sort((a, b) => b.rel - a.rel || b.pct - a.pct).slice(0, Q.groups[gi].topN);
  const all = [...rows].sort((a, b) => b.pct - a.pct);
  return `<h2>${Q.groups[gi].title}</h2>` +
    (own >= Q.scoring.highAgreementNotice.whenGroupMeanAtLeast ? `<p class="note">${Q.scoring.highAgreementNotice.text}</p>` : '') +
    top.map(card).join('') +
    `<details><summary>See all scores</summary>${all.map(r => `<div class="row"><span>${r.c.name}</span><b>${r.pct}%</b></div>`).join('')}</details>`;
}
function quals(gi) {
  const { rows } = score(gi), B = Q.scoring.qualityProfile.bands, lab = p => B.find(b => p >= b.min).label;
  return `<h2>${Q.groups[gi].title}</h2>` + rows.map(r => `<div class="res"><header><h3>${r.c.name}</h3><span class="tag">${lab(r.pct)}</span></header>
<div class="meter"><i style="width:${r.pct}%"></i></div><p class="small" style="margin:0">${r.c.description}</p></div>`).join('');
}
const dock = h => `<div class="dock">${h}</div>`;
const go = (o) => { Object.assign(S, o); save(); render(); scrollTo(0, 0) };
function render() {
  const g = Q.groups[S.g], started = Object.keys(S.ans).length > 0;
  if (S.screen === 'welcome') {
    app.innerHTML = `<h1>${Q.formMetadata.title}</h1><p>${Q.formMetadata.introText}</p>
    <p class="mute small">Part 1 takes about ${Q.groups[0].estimatedMinutes} minutes. You can stop and come back any time. Your answers stay on this phone.</p>` +
      dock(started ? `<button class="btn p" data-a="resume">Continue where I stopped</button><button class="link" data-a="restart">Start over</button>` : `<button class="btn p" data-a="start">Start</button>`);
  } else if (S.screen === 'intro') {
    app.innerHTML = `<p class="mute small">Part ${g.order} of 3</p><h1>${g.title}</h1><h3 class="mute" style="margin-bottom:1em">${g.subtitle}</h3><p>${g.intro}</p>
    <p class="mute small">${g.questionCount} statements, about ${g.estimatedMinutes} minutes.</p>` + dock(`<button class="btn p" data-a="begin">Begin</button>`);
  } else if (S.screen === 'q') {
    const o = order(S.g), pages = Math.ceil(o.length / PER), items = o.slice(S.p * PER, S.p * PER + PER), n = o.filter(i => S.ans[i.id]).length;
    app.innerHTML = `<div class="top"><b>Part ${g.order} of 3: ${g.title}</b><div class="bar"><i style="width:${n / o.length * 100}%"></i></div></div>` +
      items.map(i => `<section class="q${S.ans[i.id] ? ' done' : ''}" data-id="${i.id}"><p>${i.text}</p>
    <div class="scale" role="radiogroup" aria-label="${i.text}">${[1, 2, 3, 4, 5].map(v => `<button role="radio" aria-checked="${S.ans[i.id] === v}" data-v="${v}" aria-label="${Q.scale.labels[v]}">${v}</button>`).join('')}</div>
    <div class="ends"><span>${Q.scale.labels[1]}</span><span>${Q.scale.labels[5]}</span></div></section>`).join('') +
      dock(`<button class="btn p" id="next" data-a="next" ${items.every(i => S.ans[i.id]) ? '' : 'disabled'}>${S.p < pages - 1 ? 'Next' : 'Finish this part'}</button>${S.p > 0 ? '<button class="link" data-a="back">Back</button>' : ''}`);
  } else if (S.screen === 'check') {
    const first = S.g === 0;
    app.innerHTML = `<h1>Your top gifts so far</h1><p class="mute">These are the gifts that stand out most for you. Pray about them and talk with a leader.</p>${gifts(S.g)}` +
      dock(first ? `<button class="btn p" data-a="g2">Continue to ministry gifts</button><button class="btn" data-a="g3">Skip to Christian qualities</button><button class="link" data-a="final">Stop here and save my results</button>`
        : `<button class="btn p" data-a="g3">Continue to Christian qualities</button><button class="link" data-a="final">Stop here and save my results</button>`);
  } else {
    const d = gi => S.done.includes(gi), more = [1, 2].filter(gi => !d(gi));
    app.innerHTML = `<h1>${Q.formMetadata.completionMessage.heading}</h1><p>${Q.formMetadata.completionMessage.body}</p>` +
      [0, 1].filter(d).map(gifts).join('') + (d(2) ? quals(2) : '') +
      (more.length ? `<div class="note">You can still finish the rest whenever you like.</div>` + more.map(gi => `<button class="btn" data-a="g${gi + 1}">Do: ${Q.groups[gi].title}</button>`).join('') : '') +
      `<h3>Next steps</h3><ul class="steps">${Q.results.nextSteps.map(s => `<li>${s}</li>`).join('')}</ul><p class="mute small">${Q.results.disclaimer}</p>` +
      dock(`<button class="btn p" onclick="print()">Print or save as PDF</button><button class="link" data-a="restart">Start over</button>`);
  }
}
function finishPart() {
  if (!S.done.includes(S.g)) S.done.push(S.g);
  go(S.g === 2 ? { screen: 'final' } : { screen: 'check' });
}
app.addEventListener('click', e => {
  const pill = e.target.closest('.scale button');
  if (pill) {
    const sec = pill.closest('.q'), id = sec.dataset.id, v = +pill.dataset.v;
    S.ans[id] = v; save(); navigator.vibrate && navigator.vibrate(12);
    sec.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', +b.dataset.v === v));
    sec.classList.add('done');
    const o = order(S.g); document.querySelector('.bar i').style.width = o.filter(i => S.ans[i.id]).length / o.length * 100 + '%';
    const items = o.slice(S.p * PER, S.p * PER + PER);
    document.getElementById('next').disabled = !items.every(i => S.ans[i.id]);
    const nx = [...document.querySelectorAll('.q:not(.done)')][0];
    if (nx) setTimeout(() => nx.scrollIntoView({ block: 'center', behavior: calm ? 'auto' : 'smooth' }), 180);
    return;
  }
  const a = e.target.dataset.a; if (!a) return;
  const pages = Math.ceil(order(S.g).length / PER);
  ({
    start: () => go({ screen: 'intro', g: 0, p: 0 }),
    resume: () => go({}),
    restart: () => { if (confirm('Start over? Your saved answers will be deleted.')) { ORD = {}; S = fresh(); save(); render() } },
    begin: () => go({ screen: 'q', p: 0 }),
    next: () => S.p < pages - 1 ? go({ p: S.p + 1 }) : finishPart(),
    back: () => go({ p: S.p - 1 }),
    g2: () => go({ screen: 'intro', g: 1, p: 0 }),
    g3: () => go({ screen: 'intro', g: 2, p: 0 }),
    final: () => go({ screen: 'final' })
  }[a] || (() => { }))();
});
fetch('questions.json').then(r => r.json()).then(j => {
  Q = j; const s = load();
  if (s && s.v === Q.questionnaireVersion) S = s;
  else { S = fresh(); if (s && Object.keys(s.ans || {}).length) alert('The questions were updated, so we need to start fresh.') }
  render();
}).catch(() => { app.innerHTML = '<p class="load">Could not load the questions. Check your connection and refresh.</p>' });
