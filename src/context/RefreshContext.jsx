import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const RefreshContext = createContext(null);

export function RefreshProvider({ children }) {
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const value = useMemo(() => ({ version, refresh }), [version, refresh]);

  return <RefreshContext.Provider value={value}>{children}</RefreshContext.Provider>;
}

export function useRefresh() {
  const ctx = useContext(RefreshContext);
  if (!ctx) {
    throw new Error('useRefresh must be used within RefreshProvider');
  }
  return ctx;
}
