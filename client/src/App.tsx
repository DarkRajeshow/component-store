import { Toaster } from 'sonner';
import { JSX } from 'react';
import AppRouter from './router/AppRouter';

function App(): JSX.Element {
  return (
    <main>
      <Toaster duration={1500} position="bottom-right" richColors theme='light' />
      <AppRouter />
    </main>
  );
}

export default App;