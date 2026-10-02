import { useState } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/**
 * Drop-in replacement for `useMedia` from `react-use`.
 * Matches a CSS media-query string and returns a boolean.
 * SSR-safe: returns `defaultState` (false) until mounted.
 *
 * Resolves in a layout effect (not a passive effect) so the correct value is
 * committed before the browser paints. Components that branch their entire
 * layout on this (e.g. OGProductcard switching between "Card"/"Mobile" shapes)
 * would otherwise paint the wrong shape first and then reflow once the
 * passive effect ran, causing a visible layout shift on mobile.
 */
export function useMedia(query: string, defaultState = false): boolean {
  const [matches, setMatches] = useState(defaultState);

  useIsomorphicLayoutEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
