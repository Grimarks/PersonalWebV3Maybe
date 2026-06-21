/**
 * Google Drive image helper.
 *
 * Karena Firebase Storage berbayar, semua gambar (project & hobi/tulisan)
 * disimpan manual di folder Google Drive berikut, lalu link share-nya
 * di-paste di Admin Panel:
 *
 * https://drive.google.com/drive/folders/1wMpqLeZESrsL8TKUTyAPJ-62vy5zHQQ7
 *
 * Fungsi di file ini mengubah berbagai bentuk link share Google Drive
 * menjadi URL gambar langsung (direct image URL) yang bisa dipakai di <img src="...">.
 *
 * PENTING: file di Google Drive harus di-share dengan akses
 * "Anyone with the link" (Viewer) supaya bisa tampil di website publik.
 */

/**
 * Mengambil folder ID dari link folder Google Drive, contoh:
 * https://drive.google.com/drive/folders/FOLDER_ID?usp=sharing
 */
export function extractDriveFolderId(input: string): string | null {
  if (!input) return null;
  const match = input.trim().match(/\/folders\/([a-zA-Z0-9_-]{10,})/);
  return match ? match[1] : null;
}

/**
 * Mengambil file ID dari berbagai format link Google Drive, contoh:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://drive.google.com/uc?export=view&id=FILE_ID
 * - FILE_ID (id polos, kalau user paste id-nya saja)
 */
function extractDriveFileId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Pattern: /d/FILE_ID/
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (dMatch) return dMatch[1];

  // Pattern: ?id=FILE_ID atau &id=FILE_ID
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (idMatch) return idMatch[1];

  // Kalau bukan URL sama sekali dan terlihat seperti ID Drive murni
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed) && !trimmed.includes("http")) {
    return trimmed;
  }

  return null;
}

/**
 * Mengubah link share Google Drive (atau ID polos) menjadi URL gambar
 * langsung yang bisa dipakai sebagai src <img>.
 *
 * Jika input bukan link Google Drive (misal sudah berupa URL gambar biasa
 * dari sumber lain), input dikembalikan apa adanya supaya tetap fleksibel.
 */
export function toDriveImageUrl(input: string | null | undefined): string {
  if (!input) return "";
  const trimmed = input.trim();
  if (!trimmed) return "";

  // Bukan link Google Drive sama sekali -> kembalikan apa adanya (mis. URL eksternal lain)
  if (!trimmed.includes("drive.google.com") && !/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return trimmed;
  }

  const fileId = extractDriveFileId(trimmed);
  if (!fileId) return trimmed;

  // googleusercontent thumbnail endpoint paling stabil untuk ditampilkan
  // langsung di <img>, lebih jarang kena masalah CORS/hotlink dibanding uc?export=view.
  // sz=w1600 -> lebar maksimal 1600px, cukup untuk tampilan web, bisa diubah sesuai kebutuhan.
  return `https://lh3.googleusercontent.com/d/${fileId}=w1600`;
}

/**
 * Versi thumbnail kecil (untuk grid/list) supaya loading lebih cepat.
 */
export function toDriveThumbnailUrl(input: string | null | undefined, width = 600): string {
  if (!input) return "";
  const trimmed = input.trim();
  if (!trimmed) return "";

  if (!trimmed.includes("drive.google.com") && !/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return trimmed;
  }

  const fileId = extractDriveFileId(trimmed);
  if (!fileId) return trimmed;

  return `https://lh3.googleusercontent.com/d/${fileId}=w${width}`;
}

/**
 * Validasi sederhana untuk form admin: cek apakah input terlihat seperti
 * link/ID Google Drive yang valid (atau URL gambar biasa).
 */
export function isLikelyValidImageInput(input: string): boolean {
  if (!input.trim()) return true; // kosong dianggap valid (optional field)
  const trimmed = input.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return true;
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) return true;
  return false;
}

export const HOBBY_DRIVE_FOLDER_ID =
  import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID || "1wMpqLeZESrsL8TKUTyAPJ-62vy5zHQQ7";

export const HOBBY_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${HOBBY_DRIVE_FOLDER_ID}?usp=sharing`;

/**
 * Upload file gambar langsung ke folder Google Drive admin, lewat Drive API,
 * menggunakan access token OAuth yang didapat dari GoogleDriveAuthContext.
 *
 * Mengembalikan link share Google Drive (bukan langsung direct image URL) —
 * gunakan toDriveImageUrl()/toDriveThumbnailUrl() untuk menampilkannya.
 */
export async function uploadImageToDrive(
  file: File,
  accessToken: string,
  folderId: string
): Promise<{ id: string; webViewLink: string }> {
  const metadata = {
    name: `${Date.now()}-${file.name}`,
    parents: [folderId],
  };

  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", file);

  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    }
  );

  if (!uploadRes.ok) {
    const errBody = await uploadRes.text();
    throw new Error(`Upload ke Google Drive gagal (${uploadRes.status}): ${errBody}`);
  }

  const uploaded = (await uploadRes.json()) as { id: string; webViewLink?: string };

  // File yang diupload lewat scope drive.file otomatis private ke app ini;
  // perlu di-set permission "anyone with link" supaya bisa tampil di web publik.
  const permRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${uploaded.id}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    }
  );

  if (!permRes.ok) {
    const errBody = await permRes.text();
    throw new Error(`Gagal mengatur izin akses file (${permRes.status}): ${errBody}`);
  }

  return {
    id: uploaded.id,
    webViewLink: uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`,
  };
}
