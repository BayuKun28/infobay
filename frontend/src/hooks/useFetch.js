import { useState, useEffect, useCallback } from 'react';

/**
 * Generic custom hook for async data fetching
 * @param {Function} fetchFn Async function returning data
 * @param {Array} deps Dependencies array
 * @param {any} initialData Initial state data
 */
export function useFetch(fetchFn, deps = [], initialData = null) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    let isMounted = true;
    execute().catch((err) => {
      if (isMounted) {
        console.warn('useFetch warning:', err?.message || err);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [execute]);

  return {
    data,
    loading,
    error,
    refetch: execute,
    setData,
  };
}
