// Extra utilities related to local storage and cookies.

/**
 * Checks if local storage is available.
 *
 * @returns {boolean}
 */
export function isLocalStorageAvailable(): boolean {
  try {
    return !!globalThis.localStorage;
  } catch (e) {
    // Security Error may happen:
    // https://www.chromium.org/for-testers/bug-reporting-guidelines/uncaught-securityerror-failed-to-read-the-localstorage-property-from-window-access-is-denied-for-this-document/
    //
    if (e instanceof DOMException && e.name == 'SecurityError') return false;
    throw e;
  }
}
