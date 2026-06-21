import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

// Scope paling sempit yang Google sediakan: app HANYA bisa akses file
// yang dia sendiri buat/upload lewat app ini. Tidak bisa baca/edit/hapus
// file lain di Drive milik admin.
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const TOKEN_STORAGE_KEY = "darrell-site-gdrive-token";

interface StoredToken {
  accessToken: string;
  expiresAt: number; // epoch ms
}

interface GoogleDriveAuthContextType {
  isConnected: boolean;
  isReady: boolean; // GIS script sudah dimuat
  connecting: boolean;
  connect: () => void;
  disconnect: () => void;
  getAccessToken: () => string | null;
}

const GoogleDriveAuthContext = createContext<GoogleDriveAuthContextType>({
  isConnected: false,
  isReady: false,
  connecting: false,
  connect: () => {},
  disconnect: () => {},
  getAccessToken: () => null,
});

function readStoredToken(): StoredToken | null {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredToken;
    if (!parsed.accessToken || !parsed.expiresAt) return null;
    if (Date.now() >= parsed.expiresAt) return null; // expired
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredToken(token: StoredToken) {
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token));
}

function clearStoredToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function GoogleDriveAuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [token, setToken] = useState<StoredToken | null>(() => readStoredToken());

  useEffect(() => {
    // Tunggu script Google Identity Services selesai dimuat (dari index.html)
    const checkReady = () => {
      if (window.google?.accounts?.oauth2) {
        setIsReady(true);
        return true;
      }
      return false;
    };

    if (checkReady()) return;

    const interval = setInterval(() => {
      if (checkReady()) clearInterval(interval);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const connect = useCallback(() => {
    if (!window.google?.accounts?.oauth2) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      alert(
        "VITE_GOOGLE_CLIENT_ID belum di-set. Lihat SETUP_GUIDE.md untuk cara setup Google Cloud Console."
      );
      return;
    }

    setConnecting(true);

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: (response: { access_token?: string; expires_in?: number; error?: string }) => {
        setConnecting(false);
        if (response.error || !response.access_token) {
          console.error("Google OAuth error:", response.error);
          return;
        }
        const expiresInMs = (response.expires_in || 3500) * 1000;
        const newToken: StoredToken = {
          accessToken: response.access_token,
          expiresAt: Date.now() + expiresInMs - 60_000, // beri buffer 1 menit
        };
        writeStoredToken(newToken);
        setToken(newToken);
      },
    });

    client.requestAccessToken();
  }, []);

  const disconnect = useCallback(() => {
    if (token?.accessToken && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(token.accessToken, () => {});
    }
    clearStoredToken();
    setToken(null);
  }, [token]);

  const getAccessToken = useCallback(() => {
    const current = readStoredToken();
    if (!current) {
      setToken(null);
      return null;
    }
    return current.accessToken;
  }, []);

  return (
    <GoogleDriveAuthContext.Provider
      value={{
        isConnected: !!token,
        isReady,
        connecting,
        connect,
        disconnect,
        getAccessToken,
      }}
    >
      {children}
    </GoogleDriveAuthContext.Provider>
  );
}

export function useGoogleDriveAuth() {
  return useContext(GoogleDriveAuthContext);
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              expires_in?: number;
              error?: string;
            }) => void;
          }) => { requestAccessToken: () => void };
          revoke: (token: string, callback: () => void) => void;
        };
      };
    };
  }
}
