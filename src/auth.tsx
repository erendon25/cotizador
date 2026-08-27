import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Check, Database, LoaderCircle, LockKeyhole } from 'lucide-react';
import { neon, neonConfigured } from './neon';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface AuthContextValue {
  user: AuthUser;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const REMEMBERED_ACCOUNT_KEY = 'cotiza-remembered-account';
const REMEMBER_CHOICE_KEY = 'cotiza-remember-choice';

function readRememberedAccount(): AuthUser | null {
  try {
    const value = localStorage.getItem(REMEMBERED_ACCOUNT_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function AuthGate({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authError, setAuthError] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [rememberAccount, setRememberAccount] = useState(() => localStorage.getItem(REMEMBER_CHOICE_KEY) !== 'false');
  const remembered = useMemo(readRememberedAccount, []);

  useEffect(() => {
    if (!neon) {
      setLoading(false);
      return;
    }

    neon.auth.getSession().then(({ data, error }) => {
      if (error) setAuthError(error.message ?? 'No se pudo comprobar la sesion.');
      const authenticatedUser = data?.user as AuthUser | undefined;
      if (authenticatedUser) {
        setUser(authenticatedUser);
        if (localStorage.getItem(REMEMBER_CHOICE_KEY) !== 'false') {
          localStorage.setItem(REMEMBERED_ACCOUNT_KEY, JSON.stringify({
            id: authenticatedUser.id,
            name: authenticatedUser.name,
            email: authenticatedUser.email,
            image: authenticatedUser.image,
          }));
        }
      }
      setLoading(false);
    }).catch((error: Error) => {
      setAuthError(error.message);
      setLoading(false);
    });
  }, []);

  const signInWithGoogle = async () => {
    if (!neon) return;
    setSigningIn(true);
    setAuthError('');
    localStorage.setItem(REMEMBER_CHOICE_KEY, String(rememberAccount));
    if (!rememberAccount) localStorage.removeItem(REMEMBERED_ACCOUNT_KEY);

    try {
      const { error } = await neon.auth.signIn.social({
        provider: 'google',
        callbackURL: window.location.origin,
        errorCallbackURL: window.location.origin,
      });
      if (error) {
        setAuthError(error.message ?? 'No se pudo iniciar sesion con Google.');
        setSigningIn(false);
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'No se pudo iniciar sesion con Google.');
      setSigningIn(false);
    }
  };

  const signOut = async () => {
    if (!neon) return;
    const { error } = await neon.auth.signOut();
    if (error) throw new Error(error.message);
    setUser(null);
  };

  if (loading) {
    return <div className="auth-screen"><div className="auth-loading"><LoaderCircle className="spin" size={26} /><span>Comprobando sesion segura...</span></div></div>;
  }

  if (!neonConfigured) {
    return <div className="auth-screen"><section className="setup-card"><Database size={28} /><h1>Falta configurar Neon</h1><p>Define <code>VITE_NEON_DATABASE_URL</code> y reinicia la aplicacion.</p></section></div>;
  }

  if (!user) {
    return (
      <div className="auth-screen">
        <section className="login-panel">
          <div className="login-brand"><div className="brand-mark">C</div><strong>Cotiza</strong></div>
          <div className="login-copy"><span>ACCESO PRIVADO</span><h1>Tu operacion comercial, en un solo lugar.</h1><p>Cotiza proyectos, protege tus margenes y conserva cada decision con trazabilidad.</p></div>
          <div className="login-trust"><LockKeyhole size={16} /><span>Datos aislados por cuenta y almacenados en Neon</span></div>
        </section>
        <section className="login-form-panel">
          <div className="login-form">
            <div className="login-icon">C</div>
            <h2>Inicia sesion</h2>
            <p>{remembered ? `Continua como ${remembered.email} o elige otra cuenta.` : 'Usa tu cuenta de Google para acceder al cotizador.'}</p>
            {remembered ? <div className="remembered-user">{remembered.image ? <img src={remembered.image} alt="" /> : <span>{remembered.name?.slice(0, 2).toUpperCase()}</span>}<div><strong>{remembered.name}</strong><small>{remembered.email}</small></div><Check size={17} /></div> : null}
            <button className="google-button" onClick={signInWithGoogle} disabled={signingIn}>
              {signingIn ? <LoaderCircle className="spin" size={18} /> : <span className="google-g">G</span>}
              {remembered ? 'Continuar con Google' : 'Ingresar con Google'}
            </button>
            <label className="remember-control"><input type="checkbox" checked={rememberAccount} onChange={(event) => setRememberAccount(event.target.checked)} /><span className="check-control">{rememberAccount ? <Check size={14} /> : null}</span><span><strong>Recordar cuenta</strong><small>Guarda solo nombre, correo y foto en este dispositivo.</small></span></label>
            {authError ? <div className="auth-error" role="alert">{authError}</div> : null}
            <div className="login-security"><LockKeyhole size={14} /><span>La contrasena y los tokens no se guardan en esta aplicacion.</span></div>
          </div>
        </section>
      </div>
    );
  }

  return <AuthContext.Provider value={{ user, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth debe usarse dentro de AuthGate.');
  return value;
}
