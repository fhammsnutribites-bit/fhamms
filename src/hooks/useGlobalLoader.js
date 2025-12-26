import { useAuth } from '../context/AuthContext.jsx';

/**
 * Custom hook to manage global API loading state
 * Usage: const { apiLoading, withLoader } = useGlobalLoader();
 * 
 * Example:
 * const handleFetch = withLoader(async () => {
 *   const data = await someApi.call();
 *   return data;
 * }, 'fetchOrderKey');
 */
export const useGlobalLoader = () => {
  const { apiLoading, apiLoadingKey, setApiLoading, clearApiLoading } = useAuth();

  /**
   * Wrapper function to automatically manage loading state around an async operation
   * @param {Function} asyncFn - Async function to execute
   * @param {String} key - Unique key to identify this loading operation (optional)
   * @returns {Function} Wrapped function
   */
  const withLoader = (asyncFn, key = 'default') => {
    return async (...args) => {
      try {
        setApiLoading(key);
        const result = await asyncFn(...args);
        return result;
      } catch (err) {
        console.error(`Error in ${key}:`, err);
        throw err;
      } finally {
        clearApiLoading();
      }
    };
  };

  return {
    apiLoading,
    apiLoadingKey,
    setApiLoading,
    clearApiLoading,
    withLoader
  };
};

export default useGlobalLoader;
