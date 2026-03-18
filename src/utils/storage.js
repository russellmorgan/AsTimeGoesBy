export function getStorageItem(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

export function setStorageItem(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    return false;
  }
}

export function removeStorageItem(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    // Ignore storage removal failures and continue with in-memory state.
  }
}
