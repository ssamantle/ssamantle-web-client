import { useEffect, useState } from "react";
import "./App.css";
import { LoginPage } from "./components/auth/LoginPage";
import GamePage from "./pages/GamePage";
import { joinGame } from "./api/games";
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

  useEffect(() => {
    if (!auth) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  }, [auth]);

  const handleLogin = async (username: string) => {
    const nextAuth = await joinGame(username);
    setAuth(nextAuth);
  };

  if (!auth) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <GamePage username={auth.username} />;
}

export default App;
