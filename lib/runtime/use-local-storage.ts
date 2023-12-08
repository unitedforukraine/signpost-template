// This module implements an SSR-safe version of
// [useLocalStorage](https://usehooks-ts.com/react-hook/use-local-storage).
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useLocalStorage as useLocalStorageFromUseHooks } from 'usehooks-ts';

import { isLocalStorageAvailable } from './local-storage';

type SetValue<T> = Dispatch<SetStateAction<T>>;

/** See https://usehooks-ts.com/react-hook/use-local-storage.
 *
 * This function wraps the usehooks-ts' version to make it work
 * with SSR without producing hydration errors.
 */
export default function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, SetValue<T>] {
  // In this function, we always default to immediately returning the initial
  // value and potentially causing a rerender client-side once local storage is
  // available. Callers do not have a choice to opt-in for a client-side only
  // render. This is an explicit design-choice to make this function safer.

  // We use an intermediary state value to provide the same stable
  // value in SSR and on the first client-side render. It's the same method as
  // described in React's documentation:
  // https://nextjs.org/docs/messages/react-hydration-error#possible-ways-to-fix-it
  const [cacheValue, setCacheValue] = useState<T>(initialValue);
  const [localStorageValue, setLocalStorageValue] = useLocalStorageFromUseHooks(
    key,
    initialValue
  );
  // Use the cached value only if local storage is not available.
  const setValue = isLocalStorageAvailable()
    ? setLocalStorageValue
    : setCacheValue;

  useEffect(() => {
    setCacheValue(localStorageValue);
  }, [localStorageValue]);

  return [cacheValue, setValue];
}
