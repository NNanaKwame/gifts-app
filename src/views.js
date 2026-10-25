import { groupItems, isAnswer } from './questionnaire.js';
import { currentItems, pageItems, pageSize, sectionProgress } from './navigation.js';
import { scoreGroup } from './scoring.js';
import { readingFor, sermonsFor } from './learning.js';

export const escapeHtml = value => String(value).replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
);
const e = escapeHtml;
const button = (action, label, primary = false, extra = '') =>
  `<button class="button${primary ? ' primary' : ''}" data-action="${action}" ${extra}>${label}</button>`;
const actions = content => `<div class="actions no-print">${content}</div>`;
const passage = reference => `https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=NIV`;
const scripture = reference => `<a href="${passage(reference)}" target="_blank" rel="noopener noreferrer">${e(reference)}<span class="sr-only"> (opens in a new tab)</span></a>`;

function loveReminder(questionnaire) {
  const love = questionnaire.results.love;
  return `<section class="love-panel" aria-label="Above all, love"><p class="eyebrow">The heart of every gift</p>
    <h2>${e(love.heading)}</h2><p>${e(love.body)}</p>
    <div class="quotes">${love.quotes.map(quote => `<blockquote><p>“${e(quote.text)}”</p><cite>${quote.speaker ? `${e(quote.speaker)} · ` : ''}${scripture(quote.reference)} (${e(quote.translation)})</cite></blockquote>`).join('')}</div>
    <p class="small">Let love guide your next step: who could you encourage or serve this week?</p></section>`;
}

function giftCard(row) {
  const category = row.category;
  return `<article class="result-card"><p class="eyebrow">An area to explore</p><h3>${e(category.name)}</h3>
    <p>${e(category.description)}</p><p class="scripture">${scripture(category.scripture)}</p>
    <details><summary>How this connects to Scripture</summary><p class="small">${e(category.basis)}. ${e(category.interpretationNote)}</p></details></article>`;
}

function learningSection(group, score) {
  const categories = score.top.length ? score.top.map(row => row.category) : group.categories;
  return `<section class="learning-section"><p class="eyebrow">Keep growing in the Word</p><h2>Explore your gifts in Scripture</h2>
    <p>${score.top.length ? 'Start with the areas highlighted in your reflection. Read each passage in context, then talk it through with someone in your church.' : 'You do not need a clear top three to begin learning. Explore any area below with your church community.'}</p>
    <p class="small muted">Teaching perspectives include Ghanaian and Nigerian ministries alongside David Guzik / Enduring Word (Calvary Chapel). These selections represent charismatic or continuationist perspectives; Baptists differ on some interpretations. Sources, titles and topic relevance were checked on the dates shown below, not every spoken claim. Read Scripture first and discuss teaching with your church. Inclusion does not imply universal agreement or endorsement of every teaching.</p><p>For every gift: ${scripture('1 Corinthians 12:4–27')} · ${scripture('1 Corinthians 13')} · ${scripture('1 Peter 4:10–11')}</p>
    <div class="reading-grid">${categories.map(category => {
      const reading = readingFor(category);
      return `<details class="reading-card"><summary>${e(category.name)}</summary><p>${e(category.description)}</p>
        <ol><li>Read the foundation: ${scripture(reading.foundation)}</li><li>Explore further: ${scripture(reading.further)}</li></ol>
        <p><strong>Reflect:</strong> ${e(reading.question)}</p><p class="small muted">${e(category.interpretationNote)}</p>
        </details>`;
    }).join('')}</div>
    <h3>Teachings on love, service and gifts</h3><p>Start with love, then explore how to serve your church. Gift-specific and broader teachings are gathered together below.</p><div class="resource-library">${sermonsFor(null).map(video => `<article><a class="sermon-card" href="https://www.youtube.com/watch?v=${e(video.videoId)}" target="_blank" rel="noopener noreferrer"><img src="https://i.ytimg.com/vi/${e(video.videoId)}/hqdefault.jpg" alt="YouTube thumbnail for ${e(video.title)}" width="480" height="360" loading="lazy" referrerpolicy="no-referrer"><strong>${e(video.title)}</strong><span>${e(video.teacher)} · ${e(video.channel)}</span><span class="small">Watch on YouTube (opens in a new tab)</span></a><p class="small">${e(video.reviewNote)} <a href="${e(video.sourceUrl)}" target="_blank" rel="noopener noreferrer">Ministry source</a> · Link checked ${e(video.checkedOn)}</p></article>`).join('')}</div><p class="small"><a href="https://pcdl.co/" target="_blank" rel="noopener noreferrer">Pastor Chris Oyakhilome — official Digital Library</a>. A general library, not a selected gift-specific sermon; some content requires an account or paid subscription. A verified gift-specific YouTube link is not yet available.</p></section>`;
}

function exportSection() {
  return `<section class="export-section no-print" aria-label="Save and share"><div><p class="eyebrow">Carry your reflection with you</p><h2>Save your certificate or report</h2>
    <p>The certificate-style reflection includes your leading areas, Scripture references and the reminder to love. Ties stay included. Your answers and optional character reflections are not on the card.</p>
    <p class="small">Preview what you are sharing below. You choose the destination in your device’s share menu. If image sharing is unavailable, save the PNG and attach it yourself.</p>
    ${actions(button('download-card', 'Save certificate as PNG', true, 'disabled') + button('share-card', 'Share certificate', false, 'disabled') + button('download-report', 'Download full report (.html)') + button('print', 'Print report / save PDF'))}
    <p id="export-status" role="status" aria-live="polite">Preparing your card…</p></div><img id="gift-card-preview" class="gift-card-preview" alt="Preview of your gifts reflection card" hidden></section>`;
}

function groupResults(questionnaire, state, index) {
  const group = questionnaire.groups[index];
  const score = scoreGroup(group, state.answers, state.modes[index]);
  const character = index === 2;
  const displayedRows = character
    ? group.categories.map(category => score.rows.find(row => row.category.id === category.id)).filter(Boolean)
    : score.rows;
  return `<section class="result-section"><p class="eyebrow">${state.modes[index] === 'short' && groupItems(group, 'full').length > groupItems(group, 'short').length ? 'Initial reflection · preliminary' : index === 0 ? 'Gifts reflection' : 'Deeper reflection'}</p>
    <h2>${e(group.title)}</h2>
    ${!character && state.modes[index] === 'short' && groupItems(group, 'full').length > groupItems(group, 'short').length ? `<p class="notice">These are first indications from a brief reflection. A few answers can change the order. Explore further before settling on a top three, and weigh your experience with Scripture and people who know you.</p>` : ''}
    ${character ? '<p>Consider these habits in prayer. Your answers describe your current self-reflection, not your standing before God.</p>' : `
      ${score.inconclusive ? '<div class="notice">Your answers do not show a clear top three. That does not mean you have no gifts. Consider more experience in serving and feedback from people who know you.</div>' : `<p>${index === 0 ? 'Your leading areas to explore' : 'Ways of serving to explore'}${score.tied ? ' include a tie at the third position, so all tied areas are shown.' : '. These are possibilities to reflect on, not a declaration of your gifts.'}</p>`}
      ${score.oneSided ? '<p class="notice">Your responses lean the same way across statements about both experience and difficulty. Review the wording and think of specific examples before relying on a ranking. This is not a judgment of your faith.</p>' : ''}
      ${score.close && !score.inconclusive ? '<p class="notice">Other scores are close to your third result. Small differences should not decide how you serve.</p>' : ''}
      ${score.groupMean >= questionnaire.scoring.highAgreementNotice.whenGroupMeanAtLeast ? `<p class="notice">${e(questionnaire.scoring.highAgreementNotice.text)}</p>` : ''}
      <div class="results-grid">${score.top.map(giftCard).join('')}</div>
      ${loveReminder(questionnaire)}
    `}
    <details class="all-scores" ${character ? 'open' : ''}><summary>${character ? 'Your reflections' : 'See all response scores'}</summary>
      <p class="small muted">Scores summarize how you answered these statements. They are not a probability of having a gift, a spiritual ranking, or a measure of maturity.</p>
      ${displayedRows.map(row => `<div class="score-row"><div><strong>${e(row.category.name)}</strong><span class="small">${scripture(row.category.scripture)}</span></div><span>${row.percent}<span class="small"> / 100</span></span></div>`).join('')}
    </details>
    ${state.modes[index] === 'short' && groupItems(group, 'full').length > groupItems(group, 'short').length ? `<div class="deeper no-print"><h3>${character ? 'Make room for reflection' : score.inconclusive || score.tied || score.close ? 'Your results deserve a closer look' : 'Explore before settling on three'}</h3><p>${character ? 'Take more time to consider your habits.' : 'The deeper reflection considers more experiences across every area, including those that did not stand out initially.'} Your existing answers carry over and count toward the deeper reflection’s progress. You can pause or return to your initial results at any time.</p><p class="small muted">${character ? 'This remains a reflection on your habits, not a measure of spiritual maturity.' : 'More answers can change the order; they do not prove which gifts you have.'}</p>${button(`deepen-${index}`, 'Continue with deeper reflection', !character)}<details><summary>What to expect</summary><p class="small">${groupItems(group, 'full').filter(item => !isAnswer(state.answers[item.id])).length} additional statements in this section. Progress will use the full section, including answers you already gave.</p></details></div>` : ''}
    ${index === 0 ? learningSection(group, score) : ''}
    ${actions(button(`review-${index}`, 'Review my answers'))}
  </section>`;
}

function welcome(questionnaire, state) {
  const started = Object.keys(state.answers).length > 0 || state.screen !== 'welcome';
  return `<div class="welcome"><p class="eyebrow">Many gifts. One body.</p><h1 tabindex="-1">Discover ways<br>you can serve.</h1>
    <p class="lead">${e(questionnaire.formMetadata.introText)}</p>
    <div class="welcome-facts"><div><strong>Reflect</strong><span>one step at a time</span></div><div><strong>Discover</strong><span>ways to serve</span></div><div><strong>Your pace</strong><span>pause and return</span></div></div>
    ${actions(button(started ? 'resume' : 'start', started ? 'Continue my reflection' : 'Begin my reflection', true) + (state.completed.includes(0) ? button('results', 'View completed results') : '') + (started ? button('restart', 'Start over') : ''))}
    <p class="small muted">Answers are saved only in this browser when storage is available. Clearing browser data removes them. No account is needed.</p>
    <section class="foundation"><h2>Rooted in Scripture. Guided by love.</h2><p>We begin with ${scripture('1 Corinthians 12')} and ${scripture('Romans 12:3–8')}. Gifts are given for the good of others, and every gift must be exercised in love.</p>
    <p class="small">This is a reflection guide, not a biblical test or a validated diagnostic tool. Christians differ on some gifts and ministry roles; read the passages and discuss your results with your church.</p></section>
    <div class="optional-preview"><h3>A gentle beginning</h3><p>Complete the gifts reflection at your own pace. Your first results are a starting point for discernment. Additional reflections on service and character are optional.</p><details><summary>What to expect</summary><p class="small">The initial reflection has ${groupItems(questionnaire.groups[0]).length} statements across ${questionnaire.groups[0].categories.length} areas. Each area has four equally weighted statements. Optional service and character reflections are separate. There is no time limit.</p></details></div></div>`;
}

function intro(questionnaire, state) {
  const group = questionnaire.groups[state.group];
  return `<p class="eyebrow">${state.group === 0 ? 'Your first reflection' : 'Optional reflection'}</p><h1 tabindex="-1">${e(group.title)}</h1><p class="lead">${e(group.intro)}</p>
    <div class="notice"><strong>There is no right answer to aim for.</strong><p>Think about your actual experience, not what you feel you ought to answer. Choose “Not sure” when you do not know or have not had the opportunity. This is not a test of your faith.</p></div>
    <p>Take one statement at a time, or switch to a small group of statements. You can go back, change an answer, or pause whenever you need to.</p><details><summary>What to expect</summary><p class="small">${groupItems(group, state.modes[state.group]).length} statements in this section. The percentage shows your progress through this section only; optional sections have their own progress.</p></details>
    ${actions(button('begin', 'Begin this section', true) + button('home', 'Return to welcome'))}`;
}

function questions(questionnaire, state) {
  const group = questionnaire.groups[state.group];
  const items = currentItems(questionnaire, state);
  const page = pageItems(questionnaire, state);
  const size = pageSize(questionnaire, state);
  const focus = size === 1;
  const progress = sectionProgress(questionnaire, state);
  const pages = Math.ceil(items.length / size);
  const ready = page.every(item => isAnswer(state.answers[item.id]));
  return `<div class="question-heading"><p class="eyebrow">${e(group.title)} · ${state.group === 0 ? 'Gifts reflection' : state.modes[state.group] === 'short' ? 'Initial reflection' : 'Deeper reflection'}</p>
    <h1 tabindex="-1">Take a moment to reflect.</h1></div>
    <div class="reflection-progress"><div class="progress-caption"><span id="progress-text" role="status">${progress}% complete</span><span class="small muted">This section</span>${button('pause', 'Pause')}</div>
    <progress id="progress" value="${progress}" max="100" aria-label="This section" aria-valuetext="${progress}% complete">${progress}% complete</progress></div>
    <div class="view-options no-print" role="group" aria-label="Question layout"><span class="small muted">View</span>${button('view-focus', 'One at a time', false, `aria-pressed="${focus}"`)}${button('view-group', 'Small group', false, `aria-pressed="${!focus}"`)}</div>
    <form id="questions-form" class="${focus ? 'focus-view' : 'group-view'}">${page.map(item => `<fieldset class="question ${isAnswer(state.answers[item.id]) ? 'answered' : ''}"><legend tabindex="-1">${e(item.text)}</legend>
      <div class="scale">${[1, 2, 3, 4, 5].map(value => `<label><input type="radio" name="${e(item.id)}" value="${value}" ${state.answers[item.id] === value ? 'checked' : ''}><span class="choice"><span>${e(questionnaire.scale.labels[value])}</span></span></label>`).join('')}</div></fieldset>`).join('')}</form>
    <div class="question-controls"><p id="next-help" class="small muted">${ready ? 'Ready when you are.' : focus ? 'Choose a response to move automatically to the next statement. Use Back to review.' : 'Answer to bring the next statement into view. The next group opens automatically.'}</p>
    ${actions((state.page > 0 ? button('back', 'Back') : '') + button('next', state.page < pages - 1 ? 'Continue' : 'See my reflection', true, `id="next" aria-describedby="next-help" ${ready ? '' : 'disabled'}`))}</div>
    <p class="small muted reassurance">It’s okay to choose “Not sure.” This is a reflection, not a test of your faith.</p>
    ${state.modes[state.group] === 'full' && groupItems(group, 'short').every(item => isAnswer(state.answers[item.id])) ? `<div class="return-initial no-print">${button('initial-results', 'Back to initial results')}<p class="small muted">Your extra answers stay saved when browser storage is available.</p></div>` : ''}`;
}

function optionalActions(questionnaire, state) {
  if ([1, 2].every(index => state.completed.includes(index))) return '';
  return `<section class="optional-preview no-print"><h2>Continue only if you’d like</h2><p>Your first reflection is complete. These sections are optional.</p>
    ${[1, 2].filter(index => !state.completed.includes(index)).map(index => button(`group-${index}`, e(questionnaire.groups[index].title))).join('')}
    </section>`;
}

function results(questionnaire, state) {
  const checkpoint = state.screen === 'checkpoint';
  const indices = checkpoint ? [state.group] : state.completed.slice().sort();
  return `<p class="eyebrow">A starting point for prayer and service</p><h1 tabindex="-1">${checkpoint ? 'Your reflection so far' : 'Your reflection results'}</h1>
    <p class="lead">${e(questionnaire.results.disclaimer)}</p>
    ${indices.map(index => groupResults(questionnaire, state, index)).join('')}
    <section class="next-steps"><h2>Put reflection into practice</h2><ol>${questionnaire.results.nextSteps.map(step => `<li>${e(step)}</li>`).join('')}</ol></section>
    ${state.completed.includes(0) ? exportSection() : ''}
    ${optionalActions(questionnaire, state)}
    ${actions((checkpoint ? button('results', 'Finish here · view my results', true) : '') + button('home', 'Return to welcome') + button('restart', 'Start over'))}
    <p class="small muted">Short Scripture quotations: New International Version (NIV). Scripture links open the passage in context.</p>`;
}

export function renderApp(questionnaire, state, { home = false, storageOk = true, notice = '' } = {}) {
  const content = home || state.screen === 'welcome' ? welcome(questionnaire, state)
    : state.screen === 'intro' ? intro(questionnaire, state)
      : state.screen === 'questions' ? questions(questionnaire, state) : results(questionnaire, state);
  return `<header class="site-header"><a href="#" data-action="home" class="brand"><span class="brand-symbol" aria-hidden="true">✦</span>Spiritual Gifts<span class="brand-subtitle">DISCOVERY</span></a><span class="header-note">Given to serve. Called to love.</span></header>
    <div class="app-layout${!home && state.screen === 'questions' ? ' is-question' : ''}"><aside class="sidebar no-print"><p class="eyebrow">Your journey</p><ol class="journey">${questionnaire.groups.map((group, index) => `<li ${!home && state.group === index ? 'aria-current="step"' : ''}><span class="step-number">${state.completed.includes(index) ? '✓' : index + 1}</span><div><strong>${e(group.title)}</strong><small>${state.completed.includes(index) ? 'Completed' : index === 0 ? 'Core reflection' : 'Optional · for later'}</small></div></li>`).join('')}</ol>
      <div class="sidebar-note"><p>Different gifts.<br>The same Spirit.</p>${scripture('1 Corinthians 12:4–7')}</div></aside>
    <main id="main"><div id="save-status" class="${storageOk ? 'save-status' : 'notice warning'} no-print" role="status">${storageOk ? 'Progress stays in this browser' : 'Progress could not be saved. Keep this tab open; your answers may be lost when you leave.'}</div>
    ${notice ? `<p class="notice" role="status">${e(notice)}</p>` : ''}${content}</main></div>
    <footer class="site-footer">For the good of others. To the glory of God. <span>1 Corinthians 12:7 · 1 Peter 4:10–11</span></footer>`;
}

export function recoveryView() {
  return `<main id="main" class="standalone"><p class="eyebrow">Your previous reflection</p><h1 tabindex="-1">Your saved answers are still here.</h1><p>This version has clearer questions and a shorter assessment. Your previous session cannot be safely continued with these changes, or its saved data could not be read.</p><p>Download your previous data before starting again. It will also remain in browser storage until you explicitly start the updated reflection. Older version-2 data is retained separately.</p>${actions(button('download-old', 'Download previous answers', true) + button('accept-update', 'Start the updated reflection'))}<p id="recovery-status" role="status"></p></main>`;
}
