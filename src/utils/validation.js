import { CONFIG } from '../core/state.js';

export function normalizeOptionalNumber(value) {
  if (value === undefined || value === null || String(value).trim() === '') return undefined;
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? NaN : numberValue;
}

export function isValidUserInfo(userInfo) {
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

export function parseAndValidateInput(refs) {
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
