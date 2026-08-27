import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { AuthGate } from './auth';
import './styles.css';

const App = lazy(() => import('./App'));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthGate>
      <Suspense fallback={<div className="auth-screen"><div className="auth-loading">Cargando espacio de trabajo...</div></div>}>
        <App />
      </Suspense>
    </AuthGate>
  </React.StrictMode>,
);
