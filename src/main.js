const CONFIG = {
  DEFAULT_LIFE_MONTHS: 90 * 12,
  MAX_LIFE_YEARS: 200,
  MIN_BIRTH_YEAR: 1900,
  MONTH_ANIMATION_DELAY_STEP: 0.002,
  HELP_PANEL_ACTIVE_CLASS: 'translate-y-0',
  HELP_PANEL_CLOSED_CLASS: 'translate-y-full',
  HIDDEN_CLASS: 'hidden',
  VALIDATION_MESSAGE_CLASS: 'text-[#ff6b6b] min-h-4 hidden mt-1',
};

const state = {
  isSubmitting: false,
  userInfo: null,
  userLifeMonths: CONFIG.DEFAULT_LIFE_MONTHS,
};

const refs = {
  userinfo: document.querySelector('.userinfo'),
  showinfo: document.querySelector('.showinfo'),
  userinfoName: document.querySelector('.userinfo__name'),
  userinfoBirth: document.querySelector('.userinfo__birth'),
  nameInput: document.getElementById('userName'),
  monthInput: document.getElementById('userMonth'),
  yearInput: document.getElementById('userYear'),
  lifeInput: document.getElementById('userLength'),
  submit: document.getElementById('submit'),
  reset: document.getElementById('reset'),
  form: document.getElementById('userInfoForm'),
  timeLeft: document.getElementById('timeleft'),
  helpToggle: document.querySelector('.showinfo__toggle'),
  helpPanel: document.querySelector('.showinfo__explanation'),
  closeHelp: document.querySelector('.showinfo__close'),
  validationMessage: null,
};

function init() {
  attachValidationMessage();
  initStoredView();
  bindFormEvents();
  bindHelpEvents();
}

function attachValidationMessage() {
  if (!refs.form) return;
  const validationMessage = document.createElement('p');
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
  showShowInfoView();
  renderUserInfo();
}

function readStoredUserInfo() {
  const rawUserInfo = localStorage.getItem('userInfo');
  if (!rawUserInfo) return null;

  let parsedUserInfo;
  try {
    parsedUserInfo = JSON.parse(rawUserInfo);
  } catch (error) {
    localStorage.removeItem('userInfo');
    return null;
  }

  const validation = isValidUserInfo(parsedUserInfo);
  if (!validation.isValid) {
    localStorage.removeItem('userInfo');
    return null;
  }

  return parsedUserInfo;
}

function bindFormEvents() {
  refs.submit?.addEventListener('click', onSubmit);
  refs.reset?.addEventListener('click', onReset);
}

function onSubmit(event) {
  event.preventDefault();
  if (state.isSubmitting) return;
  setSubmitting(true);

  const parsedInput = parseAndValidateInput();
  if (!parsedInput.isValid) {
    showValidationErrors(parsedInput.errors);
    setSubmitting(false);
    return;
  }

  localStorage.setItem('userInfo', JSON.stringify(parsedInput.userInfo));
  state.userInfo = parsedInput.userInfo;
  hideValidationErrors();
  showShowInfoView();
  renderUserInfo();
  setSubmitting(false);
}

function onReset(event) {
  event.preventDefault();
  localStorage.removeItem('userInfo');
  state.userInfo = null;
  state.userLifeMonths = CONFIG.DEFAULT_LIFE_MONTHS;
  clearGrid();
  closeHelpPanel();
  hideValidationErrors();
  showFormView();
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

  if (!userInfo.userName) {
    errors.push('Name is required.');
  }

  if (!Number.isInteger(userInfo.userMonth) || userInfo.userMonth < 1 || userInfo.userMonth > 12) {
    errors.push('Birth month must be between 1 and 12.');
  }

  if (!Number.isInteger(userInfo.userYear) || userInfo.userYear < CONFIG.MIN_BIRTH_YEAR || userInfo.userYear > now.getFullYear()) {
    errors.push('Birth year must be between 1900 and this year.');
  }

  if (userInfo.userLength !== undefined) {
    if (!Number.isInteger(userInfo.userLength) || userInfo.userLength < 1 || userInfo.userLength > CONFIG.MAX_LIFE_YEARS) {
      errors.push('Expected lifespan must be 1 to 200 years.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function renderUserInfo() {
  if (!state.userInfo) return;

  refs.userinfoName.textContent = `Hi ${state.userInfo.userName}`;
  refs.userinfoBirth.textContent = `You were born ${formatBirthDate(state.userInfo)}`;
  buildGrid();
}

function formatBirthDate(userInfo) {
  const birthDate = new Date(Number(userInfo.userYear), Number(userInfo.userMonth) - 1, 1);
  return birthDate.toLocaleString('en-US', {
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
  month.className = 'month aspect-square text-center overflow-hidden border border-slate-700/40 bg-slate-800 transition-all duration-300 hover:scale-110 hover:border-slate-400 hover:bg-slate-700';
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
    month.classList.remove('bg-slate-800', 'border-slate-700/40', 'hover:bg-slate-700');
    month.classList.add('bg-emerald-400', 'border-emerald-200/70');
  }
}

function getMonthsUsed() {
  const birthDate = new Date(Number(state.userInfo.userYear), Number(state.userInfo.userMonth) - 1, 1);
  const now = new Date();
  const roughMonthsUsed = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
  return Math.max(0, roughMonthsUsed);
}

function bindHelpEvents() {
  if (!refs.helpPanel || !refs.helpToggle || !refs.closeHelp) return;

  const togglePanel = () => {
    const isOpen = refs.helpPanel.classList.contains(CONFIG.HELP_PANEL_ACTIVE_CLASS);
    refs.helpPanel.classList.toggle(CONFIG.HELP_PANEL_ACTIVE_CLASS, !isOpen);
    refs.helpPanel.classList.toggle(CONFIG.HELP_PANEL_CLOSED_CLASS, isOpen);
  };

  refs.helpToggle.addEventListener('click', togglePanel);
  refs.closeHelp.addEventListener('click', togglePanel);
}

function closeHelpPanel() {
  if (!refs.helpPanel) return;
  refs.helpPanel.classList.remove(CONFIG.HELP_PANEL_ACTIVE_CLASS);
  refs.helpPanel.classList.add(CONFIG.HELP_PANEL_CLOSED_CLASS);
}

function showFormView() {
  refs.userinfo?.classList.remove(CONFIG.HIDDEN_CLASS);
  refs.showinfo?.classList.add(CONFIG.HIDDEN_CLASS);
  hideValidationErrors();
}

function showShowInfoView() {
  refs.userinfo?.classList.add(CONFIG.HIDDEN_CLASS);
  refs.showinfo?.classList.remove(CONFIG.HIDDEN_CLASS);
}

function clearGrid() {
  if (!refs.timeLeft) return;
  while (refs.timeLeft.firstChild) {
    refs.timeLeft.removeChild(refs.timeLeft.firstChild);
  }
}

function showValidationErrors(errors) {
  if (!refs.validationMessage) return;
  refs.validationMessage.textContent = errors.join(' ');
  refs.validationMessage.classList.remove(CONFIG.HIDDEN_CLASS);
}

function hideValidationErrors() {
  if (!refs.validationMessage) return;
  refs.validationMessage.textContent = '';
  refs.validationMessage.classList.add(CONFIG.HIDDEN_CLASS);
}

function getMonthLabelForIndex(monthNumber) {
  const birthDate = new Date(Number(state.userInfo.userYear), Number(state.userInfo.userMonth) - 1, 1);
  const monthDate = new Date(birthDate.getFullYear(), birthDate.getMonth() + (monthNumber - 1), 1);

  return monthDate.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

init();
