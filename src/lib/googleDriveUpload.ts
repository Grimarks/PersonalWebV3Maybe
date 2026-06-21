/**
 * Upload foto langsung dari device ke Google Drive (folder portfolio),
 * memakai Google Identity Services (OAuth) + Drive API v3 di sisi browser.
 *
 * Alur singkat:
 * 1. Admin klik "Hubungkan Google Drive" sekali → muncul popup login Google
 *    → admin approve akses "lihat & kelola file yang dibuat lewat app ini".
 * 2. Access token disimpan di memori (session) selama tab masih terbuka.
 * 3. Setiap upload foto, file dikirim langsung ke folder Drive yang sudah
 *    ditentukan (HOBBY_DRIVE_FOLDER_URL), lalu otomatis di-set permission
 *    "anyone with link can view" supaya bisa tampil di website publik.
 * 4. Link Drive hasil upload dikembalikan, lalu disimpan ke field terkait
 *    di Firestore oleh komponen pemanggil (sama seperti alur paste-link manual).
 *
 * PENTING (setup sekali oleh Darrell di Google Cloud Console — gratis):
 * 1. Buka https://console.cloud.google.com/ → buat project baru (atau pakai yang ada).
 * 2. Aktifkan "Google Drive API" (APIs & Services > Library > cari "Google Drive API" > Enable).
 * 3. APIs & Services > Credentials > Create Credentials > OAuth client ID.
 *    - Application type: Web application.
 *    - Authorized JavaScript origins: isi dengan URL situs (mis. http://localhost:8080
 *      untuk dev, dan URL Vercel production kamu).
 * 4. Copy "Client ID" yang dihasilkan, isi ke file .env sebagai VITE_GOOGLE_CLIENT_ID.
 * 5. OAuth consent screen: isi info dasar app (nama app, email), set ke "External",
 *    tambahkan akun Google kamu sendiri sebagai "Test user" (cukup untuk dipakai sendiri).
 *
 * Tidak perlu Service Account, tidak ada biaya — pakai kuota Drive akun Google kamu sendiri.
 */

import { extractDriveFolderId } from "./gdrive";

declare global {
  interface Window {
    google?: any;
  }
}

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

let tokenClient: any = null;
let accessToken: string | null = null;
let accessTokenExpiry = 0;

function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existing = document.getElementById("google-identity-services");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Gagal memuat Google Identity Services")));
      return;
    }
    const script = document.createElement("script");
    script.id = "google-identity-services";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal memuat Google Identity Services"));
    document.head.appendChild(script);
  });
}

export function isGoogleDriveConfigured(): boolean {
  return Boolean(GOOGLE_CLIENT_ID);
}

export function isDriveConnected(): boolean {
  return Boolean(accessToken && Date.now() < accessTokenExpiry);
}

/**
 * Memicu popup login Google (kalau belum login / token sudah expired).
 * Harus dipanggil dari dalam event handler klik user (browser membatasi
 * popup yang dipicu otomatis tanpa interaksi user).
 */
export async function connectGoogleDrive(): Promise<void> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      "VITE_GOOGLE_CLIENT_ID belum diisi di file .env. Lihat panduan setup di src/lib/googleDriveUpload.ts."
    );
  }

  await loadGisScript();

  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      tokenClient = window.google!.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: DRIVE_SCOPE,
        callback: () => {}, // di-override per pemanggilan di bawah
      });
    }

    tokenClient.callback = (response: any) => {
      if (response.error) {
        reject(new Error(response.error_description || "Gagal menghubungkan ke Google Drive."));
        return;
      }
      accessToken = response.access_token;
      // expires_in dalam detik, kasih buffer 60 detik
      accessTokenExpiry = Date.now() + (response.expires_in - 60) * 1000;
      resolve();
    };

    tokenClient.requestAccessToken({ prompt: isDriveConnected() ? "" : "consent" });
  });
}

export function disconnectGoogleDrive() {
  if (accessToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(accessToken, () => {});
  }
  accessToken = null;
  accessTokenExpiry = 0;
}

interface UploadResult {
  fileId: string;
  driveLink: string;
}

/**
 * Upload satu file ke folder Drive target, lalu set permission publik (view-only),
 * dan kembalikan link share-nya.
 */
export async function uploadFileToDrive(
  file: File,
  folderUrl: string,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  if (!isDriveConnected()) {
    throw new Error("Belum terhubung ke Google Drive. Klik 'Hubungkan Google Drive' dulu.");
  }

  const folderId = extractDriveFolderId(folderUrl);

  const metadata = {
    name: file.name,
    ...(folderId ? { parents: [folderId] } : {}),
  };

  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", file);

  const uploadResponse = await new Promise<{ id: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id"
    );
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload gagal (status ${xhr.status}): ${xhr.responseText}`));
      }
    };
    xhr.onerror = () => reject(new Error("Upload gagal karena masalah jaringan."));
    xhr.send(form);
  });

  const fileId = uploadResponse.id;

  // Set permission supaya "anyone with the link" bisa melihat (view-only)
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role: "reader", type: "anyone" }),
  });

  return {
    fileId,
    driveLink: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
  };
}
