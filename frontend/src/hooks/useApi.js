/**
 * useApi.js — Generic async hook for any API call.
 * Returns { data, loading, error, execute, reset }.
 * Used as the foundation for all page-level data fetching.
 */

import { useState, useCallback } from "react";

/**
 * @template T
 * @param {(...args: any[]) => Promise<T>} [apiFn] Optional API function to bind immediately
 * @returns {{ data: T | null, loading: boolean, error: string | null, execute: (...args: any[]) => Promise<T | null>, reset: () => void }}
 */
export function useApi(apiFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      const fn = apiFn ?? args.shift();
      if (typeof fn !== "function") {
        console.error("useApi.execute: No API function provided");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fn(...args);
        setData(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFn]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

export default useApi;
