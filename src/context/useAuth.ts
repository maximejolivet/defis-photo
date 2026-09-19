import { useContext } from 'react';
import { AuthContext } from './authState';

// Le contexte vaut null hors d'un <AuthProvider> : on échoue tout de suite avec un
// message clair, ce qui permet aux appelants de compter sur un objet non nul.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans un <AuthProvider>');
  return context;
};
