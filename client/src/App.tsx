import { Toaster } from 'sonner';
import { JSX } from 'react';
import AppRouter from './router/AppRouter';
import { useAuth } from './hooks';

function App(): JSX.Element {
  const { user } = useAuth();

  return (
    <main>
      <Toaster duration={1500} position="bottom-right" richColors theme={user?.preferences?.theme || 'light'} />
      <AppRouter />
    </main>
  );
}

export default App;