export const CONFIG = {
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

const rawState = {
  isSubmitting: false,
  userInfo: null,
  userLifeMonths: CONFIG.DEFAULT_LIFE_MONTHS,
};

const listeners = [];

export function subscribeToState(listener) {
  listeners.push(listener);
}

export const state = new Proxy(rawState, {
  set(target, property, value) {
    target[property] = value;
    listeners.forEach(listener => listener(property, value));
    return true;
  }
});
