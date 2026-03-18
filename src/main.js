import { state, subscribeToState, CONFIG } from './core/state.js';
import { getStorageItem, setStorageItem, removeStorageItem } from './utils/storage.js';
import { isValidUserInfo, parseAndValidateInput } from './utils/validation.js';
import { buildGrid, getMonthsUsed } from './core/grid.js';
import { initTheme } from './utils/theme.js';

const refs = {
  userinfo: document.querySelector('.userinfo'),
  showinfo: document.querySelector('.showinfo'),
  formPanel: document.querySelector('.panel--form'),
  resultsPanel: document.querySelector('.panel--results'),
  userinfoName: document.querySelector('.userinfo__name'),
  userinfoBirth: document.querySelector('.userinfo__birth'),
  timeSummary: document.getElementById('timeSummary'),
  timelineReflection: document.getElementById('timelineReflection'),
  monthsPassed: document.getElementById('monthsPassed'),
  monthsRemaining: document.getElementById('monthsRemaining'),
  monthsTotal: document.getElementById('monthsTotal'),
  resultsHint: document.getElementById('resultsHint'),
  dismissHint: document.getElementById('dismissHint'),
  nameInput: document.getElementById('userName'),
  monthInput: document.getElementById('userMonth'),
  yearInput: document.getElementById('userYear'),
  lifeInput: document.getElementById('userLength'),
  submit: document.getElementById('submit'),
  reset: document.getElementById('reset'),
  form: document.getElementById('userInfoForm'),
  timeLeft: document.getElementById('timeleft'),
  validationMessage: null,
};

function init() {
  attachValidationMessage();
  setupStateReactivity();
  initTheme();
  initStoredView();
  bindFormEvents();
  requestAnimationFrame(() => {
    refs.formPanel?.classList.add('panel--active');
  });
}

function setupStateReactivity() {
  subscribeToState((property, value) => {
    if (property === 'isSubmitting') {
      if (refs.submit) refs.submit.disabled = value;
    }
    if (property === 'userInfo') {
      if (value) {
        renderUserInfo();
      } else {
        clearGrid();
        hideValidationErrors();
        showFormView();
      }
    }
  });
}

function attachValidationMessage() {
  if (!refs.form) return;
  const validationMessage = document.createElement('p');
  validationMessage.id = 'formValidationMessage';
  validationMessage.className = CONFIG.VALIDATION_MESSAGE_CLASS;
  validationMessage.setAttribute('aria-live', 'polite');
  refs.form.appendChild(validationMessage);
  refs.validationMessage = validationMessage;
}

function initStoredView() {
  const storedUserInfo = readStoredUserInfo();
  if (!storedUserInfo) {
    hideValidationErrors();
    showFormView();
    clearGrid();
    return;
  }

  state.userInfo = storedUserInfo; // Triggers reactivity
  showResultsView();
}

function readStoredUserInfo() {
  const rawUserInfo = getStorageItem(CONFIG.USER_INFO_STORAGE_KEY);
  if (!rawUserInfo) return null;

  let parsedUserInfo;
  try {
    parsedUserInfo = JSON.parse(rawUserInfo);
  } catch (error) {
    removeStorageItem(CONFIG.USER_INFO_STORAGE_KEY);
    return null;
  }

  const validation = isValidUserInfo(parsedUserInfo);
  if (!validation.isValid) {
    removeStorageItem(CONFIG.USER_INFO_STORAGE_KEY);
    return null;
  }

  return parsedUserInfo;
}

function bindFormEvents() {
  refs.form?.addEventListener('submit', onSubmit);
  refs.reset?.addEventListener('click', onReset);
  refs.dismissHint?.addEventListener('click', dismissResultsHint);
}

function onSubmit(event) {
  event.preventDefault();
  if (state.isSubmitting) return;
  state.isSubmitting = true;

  const parsedInput = parseAndValidateInput(refs);
  if (!parsedInput.isValid) {
    showValidationErrors(parsedInput.errors, parsedInput.fieldErrors);
    state.isSubmitting = false;
    return;
  }

  const wasSaved = setStorageItem(CONFIG.USER_INFO_STORAGE_KEY, JSON.stringify(parsedInput.userInfo));
  state.userInfo = parsedInput.userInfo; // Triggers render
  hideValidationErrors();
  showResultsView();
  
  if (!wasSaved) {
    showValidationErrors(['Your browser blocked saved progress. This view will reset when you close the page.']);
  }
  state.isSubmitting = false;
}

function onReset(event) {
  event.preventDefault();
  removeStorageItem(CONFIG.USER_INFO_STORAGE_KEY);
  state.userLifeMonths = CONFIG.DEFAULT_LIFE_MONTHS;
  state.userInfo = null; // Triggers reset render
  refs.form?.reset();
}

function renderUserInfo() {
  if (!state.userInfo) return;

  refs.userinfoName.textContent = state.userInfo.userName;
  refs.userinfoBirth.textContent = `Born ${formatBirthDate(state.userInfo)}`;
  
  // buildGrid handles its own chunking now
  buildGrid(refs.timeLeft, () => {
    // Only render summary once grid is complete or alongside it
    renderSummary();
  });
}

function formatBirthDate(userInfo) {
  const birthDate = new Date(Number(userInfo.userYear), Number(userInfo.userMonth) - 1, 1);
  return birthDate.toLocaleString(navigator.language || 'en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function renderSummary() {
  if (!refs.timeSummary || !state.userInfo) return;
  const monthsUsed = Math.min(getMonthsUsed(), state.userLifeMonths);
  const monthsRemaining = Math.max(0, state.userLifeMonths - monthsUsed);
  refs.timeSummary.textContent = `${monthsUsed} months have passed. ${monthsRemaining} months remain in this timeline.`;
  if (refs.timelineReflection) refs.timelineReflection.textContent = getReflectionMessage(monthsUsed, monthsRemaining);
  if (refs.monthsPassed) refs.monthsPassed.textContent = formatMonthCount(monthsUsed);
  if (refs.monthsRemaining) refs.monthsRemaining.textContent = formatMonthCount(monthsRemaining);
  if (refs.monthsTotal) refs.monthsTotal.textContent = formatMonthCount(state.userLifeMonths);
}

function formatMonthCount(months) {
  return `${months} mo`;
}

function getReflectionMessage(monthsUsed, monthsRemaining) {
  const progress = state.userLifeMonths ? monthsUsed / state.userLifeMonths : 0;

  if (monthsUsed <= 12) {
    return 'The first squares fill faster than they feel.';
  }

  if (progress < 0.33) {
    return 'There is still a long stretch ahead. Spend it deliberately.';
  }

  if (progress < 0.66) {
    return 'You are in the middle of the grid now. The pattern is becoming visible.';
  }

  if (monthsRemaining <= 120) {
    return 'The empty squares are fewer now. Make the remaining ones count.';
  }

  return 'The grid is finite, but this month is still open.';
}

function showFormView() {
  refs.resultsPanel?.classList.remove('panel--active');
  refs.userinfo?.classList.remove(CONFIG.HIDDEN_CLASS);
  refs.showinfo?.classList.add(CONFIG.HIDDEN_CLASS);
  hideValidationErrors();
  requestAnimationFrame(() => {
    refs.formPanel?.classList.add('panel--active');
  });
}

function showResultsView() {
  refs.formPanel?.classList.remove('panel--active');
  refs.userinfo?.classList.add(CONFIG.HIDDEN_CLASS);
  refs.showinfo?.classList.remove(CONFIG.HIDDEN_CLASS);
  if (!isResultsHintDismissed()) {
    refs.resultsHint?.classList.remove(CONFIG.HIDDEN_CLASS);
  }
  requestAnimationFrame(() => {
    refs.resultsPanel?.classList.add('panel--active');
  });
}

function clearGrid() {
  if (!refs.timeLeft) return;
  while (refs.timeLeft.firstChild) {
    refs.timeLeft.removeChild(refs.timeLeft.firstChild);
  }
}

function showValidationErrors(errors, fieldErrors = {}) {
  if (!refs.validationMessage) return;
  clearFieldErrors();
  refs.validationMessage.textContent = errors.join(' ');
  refs.validationMessage.classList.remove(CONFIG.HIDDEN_CLASS);
  refs.validationMessage.setAttribute('role', 'alert');

  const fieldMap = {
    userName: refs.nameInput,
    userMonth: refs.monthInput,
    userYear: refs.yearInput,
    userLength: refs.lifeInput,
  };

  const firstErrorField = Object.keys(fieldErrors)[0];
  Object.entries(fieldErrors).forEach(([key, message]) => {
    const field = fieldMap[key];
    if (!field) return;
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', refs.validationMessage.id);
    field.dataset.error = message;
  });

  fieldMap[firstErrorField]?.focus();
}

function hideValidationErrors() {
  if (!refs.validationMessage) return;
  clearFieldErrors();
  refs.validationMessage.textContent = '';
  refs.validationMessage.classList.add(CONFIG.HIDDEN_CLASS);
  refs.validationMessage.removeAttribute('role');
}

function dismissResultsHint() {
  setStorageItem(CONFIG.RESULTS_HINT_STORAGE_KEY, 'true');
  refs.resultsHint?.classList.add(CONFIG.HIDDEN_CLASS);
}

function isResultsHintDismissed() {
  return getStorageItem(CONFIG.RESULTS_HINT_STORAGE_KEY) === 'true';
}

function clearFieldErrors() {
  [refs.nameInput, refs.monthInput, refs.yearInput, refs.lifeInput].forEach((field) => {
    if (!field) return;
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
    delete field.dataset.error;
  });
}

init();
