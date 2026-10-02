export const useRedirectData = () => {
  const REDIRECT_DATA_PREFIX = "next-redirect-data:";

  // Set data + TTL
  const setRedirectData = (path: string, data: Record<string, unknown>) => {
    if (typeof window === "undefined") return;
    const key = `${REDIRECT_DATA_PREFIX}/checkoutemail`;
    sessionStorage.setItem(key, JSON.stringify(data));
    sessionStorage.setItem(`${key}:expires`, (Date.now() + 60 * 60 * 1000).toString());
  };

  // Read data for current path, respecting TTL
  const getRedirectData = <T = Record<string, unknown>>(): T | null => {
    if (typeof window === "undefined") return null;
    const key = `${REDIRECT_DATA_PREFIX}/checkoutemail`;
    const expires = sessionStorage.getItem(`${key}:expires`);
    if (expires && Date.now() > parseInt(expires, 10)) {
      sessionStorage.removeItem(key);
      sessionStorage.removeItem(`${key}:expires`);
      return null;
    }
    const data = sessionStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : null;
  };

  const clearRedirectData = () => {
    if (typeof window === "undefined") return;
    const key = `${REDIRECT_DATA_PREFIX}/checkoutemail`;
    sessionStorage.removeItem(key);
    sessionStorage.removeItem(`${key}:expires`);
  };

  // Convenience helper for router.push
  const pushWithData = (path: string, data: Record<string, unknown>) => {
    setRedirectData(path, data);
    return path; // pass this to router.push
  };

  return {
    setRedirectData,
    getRedirectData,
    clearRedirectData,
    pushWithData,
  };
};
