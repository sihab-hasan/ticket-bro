import { useCallback, useState } from "react";

const useApiMutation = (mutationFn, { onSuccess, onError } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const result = await mutationFn(...args);
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
    [mutationFn, onError, onSuccess],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset,
    setData,
  };
};

export default useApiMutation;

