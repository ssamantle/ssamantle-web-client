import { useEffect, useState } from "react";
import "./App.css";
import { LoginPage } from "./components/auth/LoginPage";
import GamePage from "./pages/GamePage";
import { joinGame, validateSession } from "./api/games";
import type { AuthState } from "./types/game";

const AUTH_STORAGE_KEY = "ssamantle.auth";

function readStoredAuth(): AuthState | null {
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    if (
      typeof parsed.username !== "string" ||
      !parsed.username.trim() ||
      typeof parsed.sessionId !== "string" ||
      !parsed.sessionId.trim()
    ) {
      return null;
    }

    return {
      username: parsed.username.trim(),
      sessionId: parsed.sessionId.trim(),
    };
  } catch {
    return null;
  }
}

function App() {
  const [auth, setAuth] = useState<AuthState | null>(() => readStoredAuth());
  const [shouldValidateStoredAuth] = useState(() => auth !== null);
  const [isCheckingSession, setIsCheckingSession] = useState(
    () => auth !== null,
  );

  useEffect(() => {
    if (!auth) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  }, [auth]);

  useEffect(() => {
    if (!shouldValidateStoredAuth || !auth) {
      setIsCheckingSession(false);
      return;
    }

    let alive = true;

    const checkSession = async () => {
      try {
        const isValid = await validateSession(auth.sessionId);
        if (!alive) return;

        if (!isValid) {
          setAuth(null);
          return;
        }
      } finally {
        if (alive) {
          setIsCheckingSession(false);
        }
      }
    };

    void checkSession();

    return () => {
      alive = false;
    };
  }, [auth, shouldValidateStoredAuth]);

  const handleLogin = async (username: string) => {
    const nextAuth = await joinGame(username);
    setAuth(nextAuth);
  };

  const handleLogout = () => {
    setAuth(null);
  };

  if (auth && isCheckingSession) {
    return <main className="px-4 py-8">세션 확인 중...</main>;
  }

  if (!auth) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <GamePage
      username={auth.username}
      sessionId={auth.sessionId}
      onLogout={handleLogout}
    />
  );
}

export default App;
