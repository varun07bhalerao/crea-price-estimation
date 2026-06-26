import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "crea_auth_v1";
const CREDS = { id: "Price_Finder", password: "2026@Crea" };

type AuthCtx = {
  authed: boolean;
  login: (id: string, pw: string) => boolean;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1") {
        setAuthed(true);
      }
    } catch {}
  }, []);

  const login = (id: string, pw: string) => {
    if (id === CREDS.id && pw === CREDS.password) {
      try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
      setAuthed(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setAuthed(false);
  };

  return <Ctx.Provider value={{ authed, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
}
