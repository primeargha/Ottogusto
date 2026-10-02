import { useEffect, useLayoutEffect } from "react";

// useLayoutEffect warns when it runs during SSR (it never actually runs there,
// but the warning fires on the server render pass) — fall back to useEffect there.
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
