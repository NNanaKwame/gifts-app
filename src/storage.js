import { groupItems, isAnswer, MODES } from './questionnaire.js';
import { pageSize } from './navigation.js';

export const STORAGE_KEY = 'gifts_progress_v3';
export const LEGACY_KEY = 'gifts_progress_v2';
const SCREENS = ['welcome', 'intro', 'questions', 'checkpoint', 'results'];

export function freshState(questionnaire) {
  return {
    version: questionnaire.questionnaireVersion,
    seed: Math.floor(Math.random() * 1e9),
    answers: {}, screen: 'welcome', group: 0, page: 0, pageSize: 1,
    modes: questionnaire.groups.map(() => 'short'), completed: [],
  };
}

export function validateState(state, questionnaire) {
  if (!state || state.version !== questionnaire.questionnaireVersion ||
      !Number.isInteger(state.seed) || state.seed < 0 || state.seed >= 1e9 ||
      !SCREENS.includes(state.screen) ||
      !Number.isInteger(state.group) || state.group < 0 || state.group >= questionnaire.groups.length ||
      !Number.isInteger(state.page) || state.page < 0 ||
      (state.pageSize !== undefined && ![1, questionnaire.ux.chunkSize].includes(state.pageSize)) ||
      !Array.isArray(state.modes) || state.modes.length !== questionnaire.groups.length ||
      !state.modes.every(mode => MODES.includes(mode)) ||
      !Array.isArray(state.completed) || new Set(state.completed).size !== state.completed.length ||
      !state.completed.every(index => Number.isInteger(index) && index >= 0 && index < questionnaire.groups.length) ||
      !state.answers || typeof state.answers !== 'object' || Array.isArray(state.answers)) return false;

  const ids = new Set(questionnaire.groups.flatMap(group => groupItems(group, 'full').map(item => item.id)));
  if (!Object.entries(state.answers).every(([id, answer]) => ids.has(id) && isAnswer(answer))) return false;
  const pages = Math.ceil(groupItems(questionnaire.groups[state.group], state.modes[state.group]).length / pageSize(questionnaire, state));
  if (state.page >= pages) return false;
  if (!state.completed.every(index => groupItems(questionnaire.groups[index], state.modes[index])
    .every(item => isAnswer(state.answers[item.id])))) return false;
  if ((state.group > 0 || state.screen === 'results') && !state.completed.includes(0)) return false;
  if (state.screen === 'checkpoint' && !state.completed.includes(state.group)) return false;
  return true;
}

export function readProgress(storage, questionnaire) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) {
      let state;
      try { state = JSON.parse(raw); } catch { return { recovery: raw }; }
      return validateState(state, questionnaire) ? { state } : { recovery: raw };
    }
    const legacy = storage.getItem(LEGACY_KEY);
    return legacy ? { recovery: legacy } : {};
  } catch {
    return { unavailable: true };
  }
}

export function saveProgress(storage, state) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
