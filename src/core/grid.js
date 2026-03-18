import { state, CONFIG } from './state.js';

export function getUserLocale() {
  return navigator.language || 'en-US';
}

export function getMonthLabelForIndex(monthNumber) {
  if (!state.userInfo) return '';
  const birthDate = new Date(Number(state.userInfo.userYear), Number(state.userInfo.userMonth) - 1, 1);
  const monthDate = new Date(birthDate.getFullYear(), birthDate.getMonth() + (monthNumber - 1), 1);

  return monthDate.toLocaleString(getUserLocale(), {
    month: 'long',
    year: 'numeric',
  });
}

function createMonthNode(monthNumber) {
  const month = document.createElement('div');
  month.className = 'month';
  if (monthNumber % 120 === 0) {
    month.classList.add('month--decade');
  }
  month.style.animationDelay = `${monthNumber * CONFIG.MONTH_ANIMATION_DELAY_STEP}s`;
  const monthDateLabel = getMonthLabelForIndex(monthNumber);
  month.setAttribute('title', monthDateLabel);
  month.setAttribute('aria-label', monthDateLabel);
  return month;
}

export function getMonthsUsed() {
  if (!state.userInfo) return 0;
  const birthDate = new Date(Number(state.userInfo.userYear), Number(state.userInfo.userMonth) - 1, 1);
  const now = new Date();
  const roughMonthsUsed = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
  return Math.max(0, roughMonthsUsed);
}

export function buildGrid(container, onComplete) {
  if (!state.userInfo || !container) return;

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const totalMonths = getUserLifeInMonths();
  state.userLifeMonths = totalMonths;
  const monthsUsed = getMonthsUsed();

  const chunkSize = 150;
  let currentMonth = 0;

  function processChunk() {
    const fragment = document.createDocumentFragment();
    const endMonth = Math.min(currentMonth + chunkSize, totalMonths);
    
    for (let monthIndex = currentMonth; monthIndex < endMonth; monthIndex += 1) {
      const node = createMonthNode(monthIndex + 1);
      if (monthIndex < monthsUsed) {
        node.classList.add(CONFIG.PASSED_MONTH_CLASS);
      } else if (monthIndex === monthsUsed) {
        node.classList.add('month--current');
      }
      fragment.appendChild(node);
    }

    container.appendChild(fragment);
    currentMonth = endMonth;

    if (currentMonth < totalMonths) {
      requestAnimationFrame(processChunk);
    } else {
      if (onComplete) onComplete();
    }
  }

  requestAnimationFrame(processChunk);
}

function getUserLifeInMonths() {
  if (!state.userInfo) return CONFIG.DEFAULT_LIFE_MONTHS;
  const userYears = Number(state.userInfo.userLength);
  if (Number.isInteger(userYears) && userYears > 0) {
    return userYears * 12;
  }
  return CONFIG.DEFAULT_LIFE_MONTHS;
}
