import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resultSummary, buildReport, createCard, shareCard, shareText } from '../src/export.js';
import { readingFor, sermonsFor } from '../src/learning.js';
import { freshState } from '../src/storage.js';
import { groupItems } from '../src/questionnaire.js';
import { renderApp } from '../src/views.js';
const q = JSON.parse(readFileSync(new URL('../questions.json', import.meta.url)));
function completed() {
 const s = freshState(q); s.completed = [0]; s.screen = 'results';
 s.answers = Object.fromEntries(groupItems(q.groups[0]).map(i => [i.id, 2]));
 q.groups[0].categories.slice(0,4).forEach(c => c.shortItemIds.forEach(id => s.answers[id] = 5));
 return s;
}
test('card retains ties, stage, scripture and love without raw answers or scores', () => {
 const s = completed(); const summary = resultSummary(q,s);
 assert.equal(summary.gifts.length,4); assert.equal(summary.tied,true);
 assert.match(shareText(summary), /Gifts reflection/); assert.match(shareText(summary), /1 Corinthians 13:13/);
 assert.ok(!JSON.stringify(summary).includes('wisdom_2')); assert.ok(!JSON.stringify(summary).includes('percent'));
 assert.throws(() => resultSummary(q, freshState(q)));
 for (const id of Object.keys(s.answers)) s.answers[id]=3;
 assert.equal(resultSummary(q,s).gifts.length,0);
 assert.match(resultSummary(q,s).note,/do not yet/);
});
test('report includes completed optional sections, reading links and no raw answers', () => {
 const s=completed();s.completed.push(2);
 Object.assign(s.answers,Object.fromEntries(groupItems(q.groups[2]).map(i=>[i.id,4])));
 const report=buildReport(q,s);
 assert.ok(report.includes(q.groups[2].title.toUpperCase()));
 assert.ok(!report.includes(q.groups[1].title.toUpperCase()));
 assert.match(report,/READ AND REFLECT/);assert.match(report,/biblegateway.com/);
 assert.ok(!report.includes('wisdom_2'));
});
test('every core gift has a contextual reading and results expose export controls', () => {
 q.groups[0].categories.forEach(c=> { const r=readingFor(c);assert.ok(r.foundation && r.further && r.question); });
 const html=renderApp(q,completed());
 for (const text of ['Explore your gifts in Scripture','Save card as PNG','Share gifts card','Download full report','gift-card-preview']) assert.ok(html.includes(text));
});
test('card expands for long tied profiles and never draws beyond its canvas', async () => {
 const drawn=[];let canvas;
 const context={measureText:t=>({width:t.length*23}),fillRect(){},strokeRect(){},fillText(t,x,y){drawn.push({t,y});}};
 const summary={...resultSummary(q,completed()),gifts:q.groups[0].categories.map(c=>({name:c.name,scripture:c.scripture}))};
 const blob=await createCard(summary,()=>canvas={getContext:()=>context,toBlob:callback=>callback(new Blob(['png'],{type:'image/png'}))});
 assert.equal(blob.type,'image/png');assert.ok(canvas.height>1080);
 assert.ok(drawn.every(line=>line.y<canvas.height-34));
});
test('share uses native files, handles cancellation and falls back without claiming success', async () => {
 const summary=resultSummary(q,completed());const blob=new Blob(['png'],{type:'image/png'});
 assert.equal(await shareCard(summary,blob,{}),'download');
 assert.equal(await shareCard(summary,blob,{canShare:()=>true,share:async payload=>assert.equal(payload.files[0].type,'image/png')}),'shared');
 assert.equal(await shareCard(summary,blob,{canShare:()=>true,share:async()=>{throw Object.assign(new Error(),{name:'AbortError'});}}),'cancelled');
 assert.equal(await shareCard(summary,blob,{canShare:()=>true,share:async()=>{throw new Error();}}),'download');
});
test('sermon records require source review and valid YouTube IDs', () => {
 const record={giftIds:['faith'],approved:true,videoId:'abcdefghijk',title:'Example',teacher:'Teacher',channel:'Channel',sourceUrl:'https://example.org/sermon',checkedOn:'2026-10-24',reviewNote:'Passage reviewed'};
 assert.equal(sermonsFor('faith',[record]).length,1);
 for(const patch of [{approved:false},{videoId:'bad'},{sourceUrl:'javascript:alert(1)'},{reviewNote:''}]) assert.equal(sermonsFor('faith',[{...record,...patch}]).length,0);
});

test('every core area has a source-checked sermon with a real catalog record', () => {
 for(const c of q.groups[0].categories) {
  const videos=sermonsFor(c.id); assert.ok(videos.length>0,c.id);
  assert.ok(videos.every(v=>['enduringword.com', 'daghewardmills.org', 'media.koinoniaglobal.org'].includes(new URL(v.sourceUrl).hostname)));
 }
});

test('African videos match their relevant gifts without broad score associations', () => {
 assert.ok(sermonsFor('helps').some(v => v.teacher === 'Dag Heward-Mills'));
 assert.ok(sermonsFor('discerning').some(v => v.teacher === 'Joshua Selman'));
 assert.ok(!sermonsFor('giving').some(v => ['Dag Heward-Mills', 'Joshua Selman'].includes(v.teacher)));
});

test('results disclose African perspectives and library access without inventing a Chris video', () => {
 const html = renderApp(q, completed());
 assert.ok(html.includes('More African teaching resources'));
 for (const name of ['Joshua Selman', 'Dag Heward-Mills', 'Pastor Chris Oyakhilome']) assert.ok(html.includes(name));
 assert.ok(html.includes('https://pcdl.co/'));
 assert.ok(html.includes('paid subscription'));
 assert.ok(html.includes('not a selected gift-specific sermon'));
});
