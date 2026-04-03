import { useCallback, useEffect, useState } from "react";

const useApiQuery = (
  queryFn,
  { immediate = true, initialData = null, onSuccess, onError } = {},
) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const result = await queryFn(...args);
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        setError(err);
        onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [onError, onSuccess, queryFn],
  );

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  useEffect(() => {
    if (!immediate) {
      setLoading(false);
      return;
    }

    execute().catch(() => {});
  }, [execute, immediate]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
  };
};

export default useApiQuery;

