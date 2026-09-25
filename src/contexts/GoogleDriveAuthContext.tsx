import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

// Scope paling sempit yang Google sediakan: app HANYA bisa akses file
// yang dia sendiri buat/upload lewat app ini. Tidak bisa baca/edit/hapus
// file lain di Drive milik admin.
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const TOKEN_STORAGE_KEY = "darrell-site-gdrive-token";
const GIS_SCRIPT_ID = "google-identity-services";
const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

interface StoredToken {
  accessToken: string;
  expiresAt: number; // epoch ms
}

interface GoogleDriveAuthContextType {
  isConnected: boolean;
  isReady: boolean; // GIS script sudah dimuat
  loadFailed: boolean; // GIS script gagal dimuat (mis. diblokir adblocker)
  connecting: boolean;
  connect: () => void;
  disconnect: () => void;
  getAccessToken: () => string | null;
}

const GoogleDriveAuthContext = createContext<GoogleDriveAuthContextType>({
  isConnected: false,
  isReady: false,
  loadFailed: false,
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
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token));
  } catch {
    // storage tidak tersedia; token tetap hidup di state selama tab terbuka
  }
}

function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // abaikan
  }
}

/**
 * Memuat script Google Identity Services hanya saat dibutuhkan (admin panel),
 * supaya pengunjung halaman publik tidak ikut mengunduhnya.
 */
function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    let script = document.getElementById(GIS_SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = GIS_SCRIPT_ID;
      script.src = GIS_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("Gagal memuat Google Identity Services")));
  });
}

export function GoogleDriveAuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [token, setToken] = useState<StoredToken | null>(() => readStoredToken());

  useEffect(() => {
    let cancelled = false;
    loadGisScript()
      .then(() => !cancelled && setIsReady(true))
      .catch(() => !cancelled && setLoadFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  // Tandai otomatis sebagai terputus begitu token kedaluwarsa,
  // supaya status "Drive Terhubung" tidak menyesatkan.
  useEffect(() => {
    if (!token) return;
    const msLeft = token.expiresAt - Date.now();
    if (msLeft <= 0) {
      clearStoredToken();
      setToken(null);
      return;
    }
    const timer = setTimeout(() => {
      clearStoredToken();
      setToken(null);
    }, msLeft);
    return () => clearTimeout(timer);
  }, [token]);

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
      callback: (response) => {
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
      // Dipanggil kalau popup ditutup / diblokir — tanpa ini status "Menghubungkan..." macet.
      error_callback: (error) => {
        console.warn("Google OAuth popup:", error.type);
        setConnecting(false);
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
    const current = token && Date.now() < token.expiresAt ? token : readStoredToken();
    if (!current) {
      setToken(null);
      return null;
    }
    return current.accessToken;
  }, [token]);

  return (
    <GoogleDriveAuthContext.Provider
      value={{
        isConnected: !!token,
        isReady,
        loadFailed,
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
