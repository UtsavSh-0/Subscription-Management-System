"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Stand-in for a data fetch so skeletons are visible during development.
 * Replace with the real query's `isLoading` / `refetch` when the API lands.
 */
export function useSimulatedLoad(ms = 700) {
  const [loading, setLoading] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const run = useCallback(() => {
    setLoading(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setLoading(false), ms);
  }, [ms]);

  useEffect(() => {
    run();
    return () => clearTimeout(timer.current);
  }, [run]);

  return { loading, reload: run };
}
