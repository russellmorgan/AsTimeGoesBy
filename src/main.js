const CONFIG = {
  DEFAULT_LIFE_MONTHS: 90 * 12,
  MAX_LIFE_YEARS: 200,
  MIN_BIRTH_YEAR: 1900,
  MONTH_ANIMATION_DELAY_STEP: 0.0015,
  HIDDEN_CLASS: 'hidden',
  VALIDATION_MESSAGE_CLASS: 'form__validation hidden',
  PASSED_MONTH_CLASS: 'month--passed',
  RESULTS_HINT_STORAGE_KEY: 'resultsHintDismissed',
  USER_INFO_STORAGE_KEY: 'userInfo',
};

const state = {
  isSubmitting: false,
  userInfo: null,
  userLifeMonths: CONFIG.DEFAULT_LIFE_MONTHS,
};

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
  initStoredView();
  bindFormEvents();
  requestAnimationFrame(() => {
    refs.formPanel?.classList.add('panel--active');
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

  state.userInfo = storedUserInfo;
  showResultsView();
  renderUserInfo();
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
  setSubmitting(true);

  const parsedInput = parseAndValidateInput();
  if (!parsedInput.isValid) {
    showValidationErrors(parsedInput.errors, parsedInput.fieldErrors);
    setSubmitting(false);
    return;
  }

  const wasSaved = setStorageItem(CONFIG.USER_INFO_STORAGE_KEY, JSON.stringify(parsedInput.userInfo));
  state.userInfo = parsedInput.userInfo;
  hideValidationErrors();
  showResultsView();
  renderUserInfo();
  if (!wasSaved) {
    showValidationErrors(['Your browser blocked saved progress. This view will reset when you close the page.']);
  }
  setSubmitting(false);
}

function onReset(event) {
  event.preventDefault();
  removeStorageItem(CONFIG.USER_INFO_STORAGE_KEY);
  state.userInfo = null;
  state.userLifeMonths = CONFIG.DEFAULT_LIFE_MONTHS;
  clearGrid();
  hideValidationErrors();
  showFormView();
  refs.form?.reset();
}

function setSubmitting(value) {
  state.isSubmitting = value;
  if (refs.submit) refs.submit.disabled = value;
}

function parseAndValidateInput() {
  const userInfo = {
    userName: refs.nameInput?.value.trim() || '',
    userMonth: Number(refs.monthInput?.value),
    userYear: Number(refs.yearInput?.value),
    userLength: normalizeOptionalNumber(refs.lifeInput?.value),
  };

  const validation = isValidUserInfo(userInfo);
  return {
    userInfo,
    isValid: validation.isValid,
    errors: validation.errors,
    fieldErrors: validation.fieldErrors,
  };
}

function normalizeOptionalNumber(value) {
  if (value === undefined || value === null || String(value).trim() === '') return undefined;
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? NaN : numberValue;
}

function isValidUserInfo(userInfo) {
  const now = new Date();
  const errors = [];
  const fieldErrors = {};

  if (!userInfo.userName) {
    fieldErrors.userName = 'Enter your name.';
  } else if (userInfo.userName.length > 80) {
    fieldErrors.userName = 'Name must be 80 characters or fewer.';
  }

  if (!Number.isInteger(userInfo.userMonth) || userInfo.userMonth < 1 || userInfo.userMonth > 12) {
    fieldErrors.userMonth = 'Birth month must be a number from 1 to 12.';
  }

  if (
    !Number.isInteger(userInfo.userYear)
    || userInfo.userYear < CONFIG.MIN_BIRTH_YEAR
    || userInfo.userYear > now.getFullYear()
  ) {
    fieldErrors.userYear = `Birth year must be between ${CONFIG.MIN_BIRTH_YEAR} and ${now.getFullYear()}.`;
  }

  if (userInfo.userLength !== undefined) {
    if (!Number.isInteger(userInfo.userLength) || userInfo.userLength < 1 || userInfo.userLength > CONFIG.MAX_LIFE_YEARS) {
      fieldErrors.userLength = `Expected lifespan must be between 1 and ${CONFIG.MAX_LIFE_YEARS} years.`;
    }
  }

  if (
    Number.isInteger(userInfo.userMonth)
    && Number.isInteger(userInfo.userYear)
    && userInfo.userYear === now.getFullYear()
    && userInfo.userMonth > now.getMonth() + 1
  ) {
    fieldErrors.userMonth = 'Birth month cannot be in the future.';
  }

  Object.values(fieldErrors).forEach((message) => errors.push(message));

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors,
  };
}

function renderUserInfo() {
  if (!state.userInfo) return;

  refs.userinfoName.textContent = state.userInfo.userName;
  refs.userinfoBirth.textContent = `Born ${formatBirthDate(state.userInfo)}`;
  buildGrid();
  renderSummary();
}

function formatBirthDate(userInfo) {
  const birthDate = new Date(Number(userInfo.userYear), Number(userInfo.userMonth) - 1, 1);
  return birthDate.toLocaleString(getUserLocale(), {
    month: 'long',
    year: 'numeric',
  });
}

function buildGrid() {
  if (!state.userInfo || !refs.timeLeft) return;

  clearGrid();
  const totalMonths = getUserLifeInMonths();
  state.userLifeMonths = totalMonths;

  const fragment = document.createDocumentFragment();
  for (let monthIndex = 0; monthIndex < totalMonths; monthIndex += 1) {
    fragment.appendChild(createMonthNode(monthIndex + 1));
  }

  refs.timeLeft.appendChild(fragment);
  markPassedMonths();
}

function createMonthNode(monthNumber) {
  const month = document.createElement('div');
  month.className = 'month';
  month.style.animationDelay = `${monthNumber * CONFIG.MONTH_ANIMATION_DELAY_STEP}s`;
  const monthDateLabel = getMonthLabelForIndex(monthNumber);
  month.setAttribute('title', monthDateLabel);
  month.setAttribute('aria-label', monthDateLabel);
  return month;
}

function getUserLifeInMonths() {
  const userYears = Number(state.userInfo.userLength);
  if (Number.isInteger(userYears) && userYears > 0) {
    return userYears * 12;
  }
  return CONFIG.DEFAULT_LIFE_MONTHS;
}

function markPassedMonths() {
  const monthsUsed = getMonthsUsed();
  const totalMonths = Math.min(monthsUsed, refs.timeLeft?.children.length || 0);

  for (let index = 0; index < totalMonths; index += 1) {
    const month = refs.timeLeft.children[index];
    month.classList.add(CONFIG.PASSED_MONTH_CLASS);
  }

  if (monthsUsed >= 0 && monthsUsed < (refs.timeLeft?.children.length || 0)) {
    refs.timeLeft.children[monthsUsed]?.classList.add('month--current');
  }
}

function getMonthsUsed() {
  const birthDate = new Date(Number(state.userInfo.userYear), Number(state.userInfo.userMonth) - 1, 1);
  const now = new Date();
  const roughMonthsUsed = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
  return Math.max(0, roughMonthsUsed);
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

function getMonthLabelForIndex(monthNumber) {
  const birthDate = new Date(Number(state.userInfo.userYear), Number(state.userInfo.userMonth) - 1, 1);
  const monthDate = new Date(birthDate.getFullYear(), birthDate.getMonth() + (monthNumber - 1), 1);

  return monthDate.toLocaleString(getUserLocale(), {
    month: 'long',
    year: 'numeric',
  });
}

function clearFieldErrors() {
  [refs.nameInput, refs.monthInput, refs.yearInput, refs.lifeInput].forEach((field) => {
    if (!field) return;
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
    delete field.dataset.error;
  });
}

function getStorageItem(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function setStorageItem(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    return false;
  }
}

function removeStorageItem(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    // Ignore storage removal failures and continue with in-memory state.
  }
}

function getUserLocale() {
  return navigator.language || 'en-US';
}

init();
