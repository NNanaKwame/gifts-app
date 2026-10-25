import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateQuestionnaire, groupItems, orderedItems } from '../src/questionnaire.js';
import { scoreGroup } from '../src/scoring.js';
import { freshState, validateState, readProgress, saveProgress, STORAGE_KEY, LEGACY_KEY } from '../src/storage.js';
import { advance, beginGroup, currentItems, pageItems, pageSize, sectionProgress, setQuestionView, showInitialResults } from '../src/navigation.js';
import { renderApp } from '../src/views.js';
const questionnaire = JSON.parse(readFileSync(new URL('../questions.json', import.meta.url)));
const fill = (group, mode, value = 4) => Object.fromEntries(groupItems(group, mode).map(item => [item.id, value]));
const memory = () => {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
};

test('content has valid references, unique IDs, 68 initial and 68 core core statements', () => {
  assert.equal(validateQuestionnaire(questionnaire), questionnaire);
  assert.deepEqual(questionnaire.groups.map(group => groupItems(group).length), [68, 24, 9]);
  assert.equal(questionnaire.groups.flatMap(group => groupItems(group, 'full')).length, 152);
});
test('core scoring requires all four direct answers', () => {
  const group = questionnaire.groups[0];
  const answers = fill(group, 'short');
  assert.equal(scoreGroup(group, answers).rows.length, 17);
  assert.equal(scoreGroup(group, answers, 'full').rows.length, 17);
  delete answers[group.categories[0].shortItemIds[0]];
  assert.equal(scoreGroup(group, answers).rows.length, 16);
});
test('reverse scoring and category means are correct', () => {
  const group = { categories: [{ id: 'test', items: [{ id: 'a' }, { id: 'b', reverse: true }], shortItemIds: ['a', 'b'] }] };
  assert.equal(scoreGroup(group, { a: 5, b: 1 }).rows[0].percent, 100);
  assert.equal(scoreGroup(group, { a: 1, b: 5 }).rows[0].percent, 0);
  assert.equal(scoreGroup(group, { a: 5, b: 5 }).rows[0].percent, 50);
  assert.equal(scoreGroup(group, { a: '5', b: 1 }).rows.length, 0);
});
test('uniform profiles do not fabricate top gifts, including all agree and all unsure', () => {
  for (const value of [1, 3, 5]) {
    const score = scoreGroup(questionnaire.groups[0], fill(questionnaire.groups[0], 'short', value));
    assert.equal(score.inconclusive, true);
    assert.deepEqual(score.top, []);
  }
});
test('ties at third show all tied areas, not arbitrary winners', () => {
  const group = questionnaire.groups[0];
  const answers = fill(group, 'short', 2);
  group.categories.slice(0, 4).forEach((category, index) => category.shortItemIds.forEach(id => answers[id] = index < 2 ? 5 : 4));
  const score = scoreGroup(group, answers);
  assert.equal(score.top.length, 4);
  assert.equal(score.tied, true);
});
test('seeded ordering is stable, complete and does not mutate source', () => {
  const group = questionnaire.groups[0];
  const original = JSON.stringify(group);
  const first = orderedItems(group, 'short', 123);
  assert.deepEqual(first, orderedItems(group, 'short', 123));
  assert.notDeepEqual(first, orderedItems(group, 'short', 124));
  assert.equal(new Set(first.map(item => item.id)).size, 68);
  assert.equal(JSON.stringify(group), original);
});
test('incomplete pages cannot advance; all core pages lead to results and valid persisted state', () => {
  const state = freshState(questionnaire);
  state.pageSize = 5;
  assert.equal(beginGroup(questionnaire, state, 1), false);
  beginGroup(questionnaire, state, 0);
  assert.equal(advance(questionnaire, state), false);
  let pages = 0;
  while (state.screen === 'questions') {
    pageItems(questionnaire, state).forEach(item => state.answers[item.id] = 4);
    advance(questionnaire, state);
    assert.equal(validateState(state, questionnaire), true);
    pages++;
  }
  assert.equal(pages, 14);
  assert.equal(state.screen, 'checkpoint');
  assert.deepEqual(state.completed, [0]);
  beginGroup(questionnaire, state, 2);
  while (state.screen === 'questions') {
    pageItems(questionnaire, state).forEach(item => state.answers[item.id] = 4);
    advance(questionnaire, state);
  }
  assert.equal(state.screen, 'results');
  assert.deepEqual(state.completed, [0, 2]);
  assert.equal(beginGroup(questionnaire, state, 1), true);
});
test('last page does not hide missing answers on earlier pages', () => {
  const state = freshState(questionnaire);
  state.screen = 'questions';
  state.pageSize = 5;
  state.page = 13;
  pageItems(questionnaire, state).forEach(item => state.answers[item.id] = 4);
  advance(questionnaire, state);
  assert.equal(state.page, 0);
  assert.deepEqual(state.completed, []);
});
test('invalid saved state is rejected, recovery leaves saved data untouched', () => {
  const state = freshState(questionnaire);
  assert.equal(validateState(state, questionnaire), true);
  for (const patch of [{ group: 8 }, { page: -1 }, { page: 100 }, { answers: { wisdom_2: 6 } }, { answers: { unknown: 4 } }, { completed: [0] }, { screen: 'nonsense' }, { modes: ['bad'] }, { version: 'old' }, { screen: 'results' }]) {
    assert.equal(validateState({ ...state, ...patch }, questionnaire), false);
  }
  const store = memory();
  store.setItem(STORAGE_KEY, '{broken');
  assert.equal(readProgress(store, questionnaire).recovery, '{broken');
  assert.equal(store.getItem(STORAGE_KEY), '{broken');
});
test('legacy sessions are preserved; storage failure is surfaced', () => {
  const store = memory();
  store.setItem(LEGACY_KEY, '{"v":"old","ans":{"wisdom_2":4}}');
  assert.ok(readProgress(store, questionnaire).recovery);
  assert.equal(saveProgress(store, freshState(questionnaire)), true);
  assert.ok(store.getItem(LEGACY_KEY));
  assert.ok(readProgress(store, questionnaire).state);
  assert.equal(readProgress(null, questionnaire).unavailable, true);
  assert.equal(saveProgress(null, freshState(questionnaire)), false);
});
test('gift results include love, Jesus and Paul quotes, passage links and optional paths', () => {
  const state = freshState(questionnaire);
  state.answers = fill(questionnaire.groups[0], 'short', 2);
  questionnaire.groups[0].categories.slice(0, 3).forEach(category => category.shortItemIds.forEach(id => state.answers[id] = 5));
  state.completed = [0];
  state.screen = 'checkpoint';
  const html = renderApp(questionnaire, state);
  assert.ok(html.indexOf('results-grid') < html.indexOf('Above all, love'));
  assert.match(html, /Love one another\./);
  assert.match(html, /But the greatest of these is love\./);
  assert.match(html, /John 13:34/);
  assert.match(html, /1 Corinthians 13:13/);
  assert.match(html, /data-action="group-1"/);
  state.screen = 'results';
  assert.match(renderApp(questionnaire, state), /Above all, love/);
});
test('question text is escaped in HTML; controls use native radio semantics', () => {
  const data = structuredClone(questionnaire);
  data.groups[0].categories[0].items.forEach(item => item.text = '<script>alert("test")</script>');
  const state = freshState(data);
  state.pageSize = 5;
  state.screen = 'questions';
  const pages = Math.ceil(groupItems(data.groups[0]).length / 5);
  const html = Array.from({ length: pages }, (_, page) => renderApp(data, { ...state, page })).join('');
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.match(html, /<fieldset/);
  assert.match(html, /type="radio"/);
});

test('character reflections retain category order instead of ranking character', () => {
  const state = freshState(questionnaire);
  state.answers = { ...fill(questionnaire.groups[0], 'short'), ...fill(questionnaire.groups[2], 'short', 2) };
  questionnaire.groups[2].categories[2].shortItemIds.forEach(id => state.answers[id] = 5);
  state.completed = [0, 2];
  state.screen = 'results';
  const html = renderApp(questionnaire, state);
  assert.ok(html.indexOf('<strong>Faithfulness</strong>') < html.indexOf('<strong>Rooted in Scripture</strong>'));
  assert.ok(!html.includes('Room to grow'));
});
test('home exposes completed results during an unfinished optional section', () => {
  const state = freshState(questionnaire);
  state.answers = fill(questionnaire.groups[0], 'short');
  state.completed = [0];
  beginGroup(questionnaire, state, 1);
  assert.match(renderApp(questionnaire, state, { home: true }), /View completed results/);
});
test('final report includes all completed sections and omits completed optional invitations', () => {
  const state = freshState(questionnaire);
  state.answers = Object.assign({}, ...questionnaire.groups.map(group => fill(group, 'short')));
  state.completed = [0, 1, 2];
  state.screen = 'results';
  const html = renderApp(questionnaire, state);
  for (const group of questionnaire.groups) assert.ok(html.includes(`<h2>${group.title}</h2>`));
  assert.ok(!html.includes('Continue only if'));
});

test('focus view completes the core with honest section progress from zero to 100', () => {
  const state = freshState(questionnaire);
  beginGroup(questionnaire, state, 0);
  assert.equal(pageSize(questionnaire, state), 1);
  assert.equal(sectionProgress(questionnaire, state), 0);
  let steps = 0;
  while (state.screen === 'questions') {
    const items = pageItems(questionnaire, state);
    assert.equal(items.length, 1);
    assert.ok(sectionProgress(questionnaire, state) < 100);
    state.answers[items[0].id] = 4;
    advance(questionnaire, state);
    assert.equal(validateState(state, questionnaire), true);
    steps++;
  }
  assert.equal(steps, 68);
  assert.equal(sectionProgress(questionnaire, state), 100);
});
test('view changes preserve answers and anchor the first unanswered item', () => {
  const state = freshState(questionnaire);
  state.seed = 42;
  state.pageSize = 5;
  state.page = 2;
  const batch = pageItems(questionnaire, state);
  state.answers[batch[0].id] = 4;
  state.answers[batch[1].id] = 5;
  const before = { ...state.answers };
  const progress = sectionProgress(questionnaire, state);
  assert.equal(setQuestionView(questionnaire, state, 1), true);
  assert.equal(state.page, 12);
  assert.equal(pageItems(questionnaire, state)[0].id, batch[2].id);
  assert.equal(setQuestionView(questionnaire, state, 5), true);
  assert.equal(state.page, 2);
  assert.deepEqual(state.answers, before);
  assert.equal(sectionProgress(questionnaire, state), progress);
  assert.equal(setQuestionView(questionnaire, state, 2), false);
});
test('legacy page boundaries survive reload; invalid view preferences are rejected', () => {
  const state = freshState(questionnaire);
  delete state.pageSize;
  state.screen = 'questions';
  state.page = 3;
  assert.equal(pageSize(questionnaire, state), 5);
  const store = memory();
  saveProgress(store, state);
  assert.deepEqual(pageItems(questionnaire, readProgress(store, questionnaire).state), pageItems(questionnaire, state));
  for (const size of [0, 2, '1', null, -1]) assert.equal(validateState({ ...state, pageSize: size }, questionnaire), false);
});
test('question screen shows percentages without question numbers, totals or page counts', () => {
  const state = freshState(questionnaire);
  state.screen = 'questions';
  state.answers[currentItems(questionnaire, state)[0].id] = 4;
  const html = renderApp(questionnaire, state);
  assert.match(html, /1% complete/);
  assert.match(html, /max="100"/);
  assert.match(html, /aria-valuetext="1% complete"/);
  assert.ok(!html.includes('of 51'));
  assert.ok(!html.includes('Page 1'));
  assert.ok(!html.includes('question-number'));
  assert.match(html, /data-action="pause"/);
  assert.match(html, /Ready when you are/);
});
test('new sections and deeper reflection use explicit section-specific percentages', () => {
  const state = freshState(questionnaire);
  state.answers = fill(questionnaire.groups[0], 'short');
  state.completed = [0];
  beginGroup(questionnaire, state, 1);
  assert.equal(sectionProgress(questionnaire, state), 0);
  beginGroup(questionnaire, state, 0, 'full');
  assert.equal(sectionProgress(questionnaire, state), 100);
});
test('core results have no redundant deeper assessment offer', () => {
  const state = freshState(questionnaire);
  state.answers = fill(questionnaire.groups[0], 'short');
  state.completed = [0];
  state.screen = 'checkpoint';
  const html = renderApp(questionnaire, state);
  assert.match(html, /Gifts reflection/);

  assert.ok(!html.includes('Continue with deeper reflection'));
  assert.match(html, /Above all, love/);
});

test('deeper reflection can return to initial results without losing additional answers', () => {
  const state = freshState(questionnaire);
  state.answers = fill(questionnaire.groups[0], 'short');
  state.completed = [0];
  beginGroup(questionnaire, state, 0, 'full');
  const extra = pageItems(questionnaire, state)[0];
  state.answers[extra.id] = 5;
  assert.equal(showInitialResults(questionnaire, state), true);
  assert.equal(state.screen, 'checkpoint');
  assert.equal(state.modes[0], 'short');
  assert.equal(state.answers[extra.id], 5);
  assert.equal(validateState(state, questionnaire), true);
  beginGroup(questionnaire, state, 0, 'full');
  assert.equal(state.answers[extra.id], 5);
  assert.equal(validateState(state, questionnaire), true);
  const empty = freshState(questionnaire);
  empty.modes[0] = 'full';
  assert.equal(showInitialResults(questionnaire, empty), false);
});

test('content validation rejects wrong counts, duplicate IDs and unknown selections', () => {
  for (const mutate of [
    q => q.groups[0].categories[0].shortItemIds.pop(),
    q => q.groups[0].categories[1].items[0].id = q.groups[0].categories[0].items[0].id,
    q => q.groups[0].categories[0].fullItemIds.push('unknown'),
  ]) {
    const data = structuredClone(questionnaire);
    mutate(data);
    assert.throws(() => validateQuestionnaire(data));
  }
});
test('previous questionnaire sessions are offered recovery without changing saved data', () => {
  const store = memory();
  const old = JSON.stringify({ ...freshState(questionnaire), version: '2026-10-24.1' });
  store.setItem(STORAGE_KEY, old);
  assert.equal(readProgress(store, questionnaire).recovery, old);
  assert.equal(store.getItem(STORAGE_KEY), old);
});


test('four direct items per core area use equal weights and no shared bonus', () => {
 const g = questionnaire.groups[0];
 assert.equal(g.sharedTraits, undefined);
 for (const c of g.categories) {
  assert.equal(c.items.length, 4);
  assert.ok(c.items.every(i => !i.reverse && i.orig));
 }
 const answers = fill(g, 'short', 2);
 const selected = g.categories.filter(c => ['teaching','helps','mercy'].includes(c.id));
 selected.forEach(c => c.items.forEach(i => answers[i.id] = 5));
 const result = scoreGroup(g, answers);
 assert.deepEqual(new Set(result.top.map(r => r.category.id)), new Set(selected.map(c => c.id)));
 assert.ok(result.rows.every(r => r.mean === r.directMean && r.bonusPoints === 0));
 const c = g.categories[0];
 c.items.forEach((i,n) => answers[i.id] = n+1);
 assert.equal(scoreGroup(g,answers).rows.find(r => r.category.id===c.id).mean, 2.5);
});
