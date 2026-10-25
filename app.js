import { createAnswerPause } from './src/answer-pause.js';
import { validateQuestionnaire, isAnswer } from './src/questionnaire.js';
import { freshState, readProgress, saveProgress } from './src/storage.js';
import { advance, beginGroup, pageItems, sectionProgress, setQuestionView, showInitialResults } from './src/navigation.js';
import { renderApp, recoveryView } from './src/views.js';
import { resultSummary, buildReportHtml, createCard, downloadBlob, shareCard } from './src/export.js';

const app = document.getElementById('app');
let questionnaire;
let state;
let home = false;
let storageOk = true;
let recovery = null;
let cardBlob = null;
let cardUrl = null;
let renderId = 0;
let answerTimer;
let pendingAnswer = null;
const answerPause = createAnswerPause();

async function prepareCard(id) {
  cardBlob = null;
  if (cardUrl) URL.revokeObjectURL(cardUrl);
  cardUrl = null;
  if (!document.getElementById('gift-card-preview')) return;
  try {
    const blob = await createCard(resultSummary(questionnaire, state));
    if (id !== renderId) return;
    cardBlob = blob;
    cardUrl = URL.createObjectURL(blob);
    const preview = document.getElementById('gift-card-preview');
    preview.src = cardUrl;
    preview.alt = resultSummary(questionnaire, state).gifts.map(gift => gift.name).join(', ') || 'No clear leading areas yet. Above all, love.';
    preview.hidden = false;
    app.querySelectorAll('[data-action="share-card"], [data-action="download-card"]').forEach(button => button.disabled = false);
    document.getElementById('export-status').textContent = 'Your card is ready. The full report includes all completed sections; review it before sharing.';
  } catch {
    if (id === renderId) document.getElementById('export-status').textContent = 'Image export is unavailable. You can still download the text report or print to PDF.';
  }
}

// Browser printing normally omits the contents of collapsed reading panels.
let printDetails = [];
window.addEventListener('beforeprint', () => {
  printDetails = [...app.querySelectorAll('details:not([open])')];
  printDetails.forEach(detail => detail.open = true);
});
window.addEventListener('afterprint', () => {
  printDetails.forEach(detail => detail.open = false);
  printDetails = [];
});

function storage() {
  // Access itself may throw when a browser disables storage.
  try { return window.localStorage; } catch { return null; }
}

function save() {
  storageOk = saveProgress(storage(), state);
}

function render(notice = '', revealQuestion = false) {
  clearTimeout(answerTimer);
  pendingAnswer = null;
  app.innerHTML = renderApp(questionnaire, state, { home, storageOk, notice });
  if (revealQuestion) revealNextQuestion();
  else {
    document.querySelector('h1')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  prepareCard(++renderId);
}

function navigate(changes = {}, revealQuestion = false) {
  Object.assign(state, changes);
  home = false;
  save();
  render('', revealQuestion);
}

function downloadPrevious() {
  const url = URL.createObjectURL(new Blob([recovery], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'spiritual-gifts-previous-answers.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.getElementById('recovery-status').textContent = 'Download requested. Check your downloads before starting again.';
}

function revealNextQuestion() {
  const next = [...app.querySelectorAll('fieldset.question')].find(fieldset =>
    !fieldset.querySelector('input:checked'));
  if (!next) return;
  // Focus the question text, not the fieldset: mobile browsers may otherwise
  // scroll a descendant radio into view. Use one explicit scroll destination.
  const heading = next.querySelector('legend');
  heading?.focus({ preventScroll: true });
  const headerHeight = app.querySelector('.reflection-progress')?.getBoundingClientRect().height ?? 0;
  const top = Math.max(0, window.scrollY + next.getBoundingClientRect().top - headerHeight - 16);
  window.scrollTo({ top, behavior: 'instant' });
}

function continueAfterAnswer() {
  if (pageItems(questionnaire, state).every(item => isAnswer(state.answers[item.id]))) {
    if (advance(questionnaire, state)) navigate({}, state.screen === 'questions');
  } else revealNextQuestion();
}

function showAnswerPause(input) {
  answerPause.acknowledge(state.group);
  const dialog = document.createElement('dialog');
  dialog.className = 'answer-pause';
  dialog.setAttribute('aria-labelledby', 'answer-pause-title');
  dialog.setAttribute('aria-describedby', 'answer-pause-description');
  dialog.innerHTML = '<h2 id="answer-pause-title">Take a moment to reflect</h2><p id="answer-pause-description">You’ve chosen the same response several times in a row. That may fit your experience. Before moving on, read this statement again and think of a real example.</p><p>You don’t need to change your answer. Your responses are saved as they are.</p><div class="actions"><button class="button" id="pause-review" autofocus>Review this answer</button><button class="button primary" id="pause-keep">Keep my answer and continue</button></div>';
  if (!storageOk) dialog.querySelector('#answer-pause-description').nextElementSibling.textContent = 'You don’t need to change your answer. Your responses are kept in this tab, but browser storage is unavailable.';
  document.body.append(dialog);
  let keep = false;
  dialog.querySelector('#pause-review').addEventListener('click', () => dialog.close());
  dialog.querySelector('#pause-keep').addEventListener('click', () => { keep = true; dialog.close(); });
  dialog.addEventListener('close', () => {
    dialog.remove();
    if (keep) continueAfterAnswer();
    else {
      input.focus({ preventScroll: true });
      const question = input.closest('fieldset');
      const offset = app.querySelector('.reflection-progress')?.getBoundingClientRect().height ?? 0;
      window.scrollTo({ top: Math.max(0, window.scrollY + question.getBoundingClientRect().top - offset - 16), behavior: 'instant' });
      document.getElementById('next-help').textContent = pageItems(questionnaire, state).every(item => isAnswer(state.answers[item.id]))
        ? 'Review your response, then choose Continue when you are ready.'
        : 'Review your response, then answer the remaining statements in this group.';
    }
  }, { once: true });
  dialog.showModal();
}

app.addEventListener('change', event => {
  const input = event.target.closest('input[type="radio"]');
  if (!input || state.screen !== 'questions' || home) return;
  const value = Number(input.value);
  if (!isAnswer(value) || !pageItems(questionnaire, state).some(item => item.id === input.name)) return;
  const wasAnswered = isAnswer(state.answers[input.name]) && pendingAnswer !== input.name;
  const shouldPause = answerPause.record(state.group, input.name, value, !wasAnswered);
  clearTimeout(answerTimer);
  state.answers[input.name] = value;
  save();
  input.closest('fieldset').classList.add('answered');
  const percent = sectionProgress(questionnaire, state);
  const progress = document.getElementById('progress');
  progress.value = percent;
  progress.textContent = `${percent}% complete`;
  progress.setAttribute('aria-valuetext', `${percent}% complete`);
  document.getElementById('progress-text').textContent = `${percent}% complete`;
  const ready = pageItems(questionnaire, state).every(item => isAnswer(state.answers[item.id]));
  document.getElementById('next').disabled = !ready;
  document.getElementById('next-help').textContent = ready
    ? 'Ready when you are.'
    : 'Your next unanswered statement will move into view.';
  const status = document.getElementById('save-status');
  const statusText = storageOk ? 'Progress saved in this browser' : 'Progress could not be saved. Keep this tab open; your answers may be lost when you leave.';
  if (status.textContent !== statusText) status.textContent = statusText;
  status.className = `${storageOk ? 'save-status' : 'notice warning'} no-print`;
  // Leave corrections in place so reviewing a saved answer never throws the user forward.
  if (wasAnswered) { pendingAnswer = null; return; }
  pendingAnswer = input.name;
  answerTimer = setTimeout(() => {
    pendingAnswer = null;
    if (shouldPause) showAnswerPause(input);
    else continueAfterAnswer();
  }, 450);

});

app.addEventListener('submit', event => event.preventDefault());
app.addEventListener('click', async event => {
  const target = event.target.closest('[data-action]');
  if (!target || target.disabled) return;
  event.preventDefault();
  clearTimeout(answerTimer);
  pendingAnswer = null;
  const action = target.dataset.action;
  if (action === 'download-old') return downloadPrevious();
  if (action === 'accept-update') {
    if (!window.confirm('Start the updated reflection? Current-version saved data will be replaced. Download your previous answers first if you want to keep them.')) return;
    recovery = null;
    state = freshState(questionnaire);
    answerPause.reset();
    return navigate();
  }
  if (!state) return;
  if (action === 'home' || action === 'pause') {
    save();
    home = true;
    return render(action === 'pause' ? (storageOk ? 'Your place is saved. Continue whenever you are ready.' : 'Your place is kept in this tab only. Browser storage is unavailable.') : '');
  }
  if (action === 'resume') {
    home = false;
    if (state.screen === 'welcome') state.screen = 'intro';
    return navigate();
  }
  if (action === 'start') return navigate({ screen: 'intro', group: 0, page: 0 });
  if (action === 'begin') {
    beginGroup(questionnaire, state, state.group);
    return navigate();
  }
  if ((action === 'view-focus' || action === 'view-group') && state.screen === 'questions') {
    setQuestionView(questionnaire, state, action === 'view-focus' ? 1 : questionnaire.ux.chunkSize);
    return navigate();
  }
  if (action === 'next' && state.screen === 'questions') {
    if (advance(questionnaire, state)) navigate();
    return;
  }
  if (action === 'back' && state.page > 0) return navigate({ page: state.page - 1 });
  if (action === 'initial-results') {
    if (showInitialResults(questionnaire, state)) navigate();
    return;
  }
  if (['download-card', 'share-card', 'download-report'].includes(action)) {
    if (!state.completed.includes(0)) return;
    const status = document.getElementById('export-status');
    try {
      if (action === 'download-report') {
        downloadBlob(new Blob([buildReportHtml(questionnaire, state)], { type: 'text/html;charset=utf-8' }), 'my-gifts-report.html');
        status.textContent = 'Report download requested. It includes all completed sections, including character reflections if completed.';
      } else if (cardBlob) {
        target.disabled = true;
        const blob = cardBlob;
        const outcome = action === 'share-card' ? await shareCard(resultSummary(questionnaire, state), blob) : 'download';
        if (outcome === 'download') downloadBlob(blob, 'my-gifts-reflection.png');
        status.textContent = outcome === 'cancelled' ? 'Sharing cancelled. Your card is still available.'
          : outcome === 'shared' ? 'Card sent to your device’s share destination.' : 'PNG download requested. You can attach it to a message or post.';
      }
    } catch {
      status.textContent = 'Export could not finish. Please try again, or use Print report / save PDF.';
    } finally { target.disabled = false; }
    return;
  }
  if (action === 'results') return navigate({ screen: 'results' });
  if (action === 'print') {
    const url = URL.createObjectURL(new Blob([buildReportHtml(questionnaire, state)], { type: 'text/html;charset=utf-8' }));
    const reportWindow = window.open(url, '_blank');
    if (reportWindow) reportWindow.opener = null;
    else downloadBlob(new Blob([buildReportHtml(questionnaire, state)], { type: 'text/html;charset=utf-8' }), 'my-gifts-report.html');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    document.getElementById('export-status').textContent = 'Open the report and choose Print report / save PDF. If a new tab was blocked, check your downloads.';
    return;
  }
  if (action === 'restart') {
    if (window.confirm('Start over? This will replace the answers for your current reflection.')) {
      state = freshState(questionnaire);
    answerPause.reset();
      navigate();
    }
    return;
  }
  const match = /^(group|deepen|review)-(\d)$/.exec(action);
  if (match) {
    const index = Number(match[2]);
    if (!questionnaire.groups[index] || (index > 0 && !state.completed.includes(0))) return;
    if (match[1] === 'group') return navigate({ group: index, page: 0, screen: 'intro' });
    if (match[1] === 'deepen') beginGroup(questionnaire, state, index, 'full');
    else {
      beginGroup(questionnaire, state, index);
      state.page = 0;
    }
    navigate();
  }
});

async function initialize() {
  try {
    const response = await fetch('questions.json');
    if (!response.ok) throw new Error('Questions could not be loaded');
    questionnaire = validateQuestionnaire(await response.json());
    const saved = readProgress(storage(), questionnaire);
    storageOk = !saved.unavailable;
    if (saved.recovery) {
      recovery = saved.recovery;
      app.innerHTML = recoveryView();
      document.querySelector('h1')?.focus();
      return;
    }
    state = saved.state || freshState(questionnaire);
    // Probe storage before promising that a new session will be saved.
    save();
    render();
  } catch (error) {
    console.error('Unable to start the reflection:', error);
    app.innerHTML = '<main id="main" class="standalone"><h1>We couldn’t load the reflection.</h1><p>Check your connection and try again. Your saved answers have not been removed.</p><button class="button primary" id="retry">Try again</button></main>';
    document.getElementById('retry').addEventListener('click', initialize);
  }
}
initialize();
