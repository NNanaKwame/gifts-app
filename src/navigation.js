import { orderedItems, isAnswer } from './questionnaire.js';

export function currentItems(questionnaire, state) {
  return orderedItems(questionnaire.groups[state.group], state.modes[state.group], state.seed + state.group * 101);
}

export function pageSize(questionnaire, state) {
  // Older sessions retain their existing page boundaries.
  return state.pageSize ?? questionnaire.ux.chunkSize;
}

export function sectionProgress(questionnaire, state) {
  const items = currentItems(questionnaire, state);
  const answered = items.filter(item => isAnswer(state.answers[item.id])).length;
  return items.length ? Math.round(answered / items.length * 100) : 0;
}

export function setQuestionView(questionnaire, state, size) {
  if (![1, questionnaire.ux.chunkSize].includes(size)) return false;
  const start = state.page * pageSize(questionnaire, state);
  const missing = pageItems(questionnaire, state).findIndex(item => !isAnswer(state.answers[item.id]));
  const anchor = start + Math.max(0, missing);
  state.pageSize = size;
  state.page = Math.floor(anchor / size);
  return true;
}

export function pageItems(questionnaire, state) {
  const size = pageSize(questionnaire, state);
  return currentItems(questionnaire, state).slice(state.page * size, (state.page + 1) * size);
}

export function advance(questionnaire, state) {
  if (!pageItems(questionnaire, state).every(item => isAnswer(state.answers[item.id]))) return false;
  const pages = Math.ceil(currentItems(questionnaire, state).length / pageSize(questionnaire, state));
  if (state.page < pages - 1) state.page++;
  else {
    // Do not trust page position as proof that earlier pages are complete.
    const missing = currentItems(questionnaire, state).findIndex(item => !isAnswer(state.answers[item.id]));
    if (missing !== -1) state.page = Math.floor(missing / pageSize(questionnaire, state));
    else {
      if (!state.completed.includes(state.group)) state.completed.push(state.group);
      state.screen = state.group === 2 ? 'results' : 'checkpoint';
    }
  }
  return true;
}

export function beginGroup(questionnaire, state, group, mode = state.modes[group]) {
  if (group > 0 && !state.completed.includes(0)) return false;
  state.group = group;
  state.modes[group] = mode;
  const items = currentItems(questionnaire, state);
  const missing = items.findIndex(item => !isAnswer(state.answers[item.id]));
  if (missing !== -1) state.completed = state.completed.filter(index => index !== group);
  state.page = missing === -1 ? 0 : Math.floor(missing / pageSize(questionnaire, state));
  state.screen = 'questions';
  return true;
}

export function showInitialResults(questionnaire, state) {
  if (state.modes[state.group] !== 'full') return false;
  const initial = orderedItems(questionnaire.groups[state.group], 'short', state.seed + state.group * 101);
  if (!initial.every(item => isAnswer(state.answers[item.id]))) return false;
  state.modes[state.group] = 'short';
  if (!state.completed.includes(state.group)) state.completed.push(state.group);
  state.page = 0;
  state.screen = state.group === 2 ? 'results' : 'checkpoint';
  return true;
}
