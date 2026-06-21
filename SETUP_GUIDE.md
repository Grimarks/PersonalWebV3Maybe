# Panduan Setup — Portfolio Darrell Satriano (v4)

## ⚠️ WAJIB sebelum admin panel bisa dipakai: Pasang Firestore Security Rules

Kalau kamu lihat error `Missing or insufficient permissions` di console, itu **bukan bug** — itu karena
Firestore di project Firebase kamu masih default-deny (tidak ada yang boleh baca/tulis sama sekali).
Wajib pasang rules di bagian **6** sebelum admin panel bisa baca/tulis data. Tanpa ini, dashboard,
projects, writing, hobby — semuanya akan gagal load walau kode sudah benar.

## 1. Cara Menjalankan di Lokal

```bash
npm install
cp .env .env   # lalu isi VITE_GOOGLE_CLIENT_ID (lihat bagian 4)
npm run dev
```

Buka `http://localhost:8080`. Untuk build production:

```bash
npm run build
```

## 2. Apa yang Berubah dari Versi Lama

- **Design**: dari dark neon-green futuristik → light mode (putih + biru muda dominan, merah/brick sebagai aksen kecil di tombol/link penting). Dark mode tetap tersedia lewat tombol toggle (ikon bulan/matahari) di navbar.
- **Font**: tetap Inter + JetBrains Mono, ditambah Plus Jakarta Sans khusus untuk heading supaya lebih tegas tapi tetap soft.
- **Data**: 100% Firestore. Context `usePortfolio` berbasis localStorage sudah dihapus total — termasuk Admin Dashboard yang dulu masih pakai data dummy, sekarang sudah live count dari Firestore.
- **Gambar**: tidak pakai Firebase Storage (berbayar). Semua foto (project, tulisan, momen hobi) disimpan di Google Drive folder kamu. Admin bisa **upload langsung dari device** (laptop/HP) lewat tombol di form admin — otomatis ke Drive, link-nya otomatis masuk ke Firestore. Paste link manual juga masih bisa dipakai sebagai alternatif.
- **Halaman baru**: `/writing` — gabungan dua hal:
  - Tab **"Tulisan"**: blog post lengkap (judul, isi, cover, tags), admin di `/admin/writing`.
  - Tab **"Momen Hobi"**: galeri foto + deskripsi singkat (kopi, gaming, dll), admin di `/admin/hobby`.
- **Projects**: sekarang punya `coverImage` (foto utama, dipilih dengan klik ikon bintang di admin) + `gallery` (array foto tambahan). Halaman detail project menampilkan foto besar + thumbnail strip yang bisa diklik.
- **Experience**: tambah tipe baru `"organization"` di samping `work`/`education`.

## 3. Upload Foto dari Device (Google Drive OAuth)

Sekarang admin bisa klik **"Upload dari Device"** di form Project/Writing/Hobby, pilih foto dari laptop/HP,
dan foto otomatis terupload ke folder Google Drive kamu + link-nya otomatis masuk ke field gambar (dan
akhirnya ke Firestore). Tidak perlu lagi buka Drive secara manual untuk upload satu-satu.

Supaya ini jalan, kamu perlu setup **OAuth Client ID** gratis di Google Cloud Console — sekali saja, ~10 menit.

### Langkah Setup Google Cloud Console

1. **Buat Project** — buka https://console.cloud.google.com/ → dropdown project (kiri atas) → **New Project** → nama bebas, mis. `Portfolio Darrell` → Create.

2. **Aktifkan Drive API** — search bar atas, ketik "Google Drive API" → klik hasil → **Enable**.

3. **Setup OAuth Consent Screen** — Menu (☰) → **APIs & Services** → **OAuth consent screen**:
   - User type: **External** → Create
   - App name: `Portfolio Darrell Admin`, support email & developer contact: email kamu
   - Save and Continue sampai ke bagian **Test users** → **Add users** → masukkan email Google kamu sendiri (yang punya folder Drive itu). Ini wajib karena app belum "published" ke publik.

4. **Buat OAuth Client ID** — Menu → **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**:
   - Application type: **Web application**
   - Name: `Portfolio Web Admin`
   - **Authorized JavaScript origins**, tambahkan:
     - `http://localhost:8080` (untuk testing lokal)
     - domain situs kamu setelah deploy (mis. `https://nama-domainmu.vercel.app`)
   - Klik **Create** → copy **Client ID** yang muncul (formatnya `xxxxx.apps.googleusercontent.com`)

5. **Isi ke `.env`**:
   ```
   VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
   VITE_GOOGLE_DRIVE_FOLDER_ID=1wMpqLeZESrsL8TKUTyAPJ-62vy5zHQQ7
   ```
   `VITE_GOOGLE_DRIVE_FOLDER_ID` adalah ID folder Drive (bagian akhir URL folder kamu).

6. Kalau deploy ke Vercel/Netlify, tambahkan kedua env var ini juga di pengaturan Environment Variables platform tersebut, lalu redeploy.

### Cara Pakai di Admin Panel

- Di sidebar Admin Panel ada status **"Hubungkan Google Drive"** — klik sekali, login pakai akun Google yang punya folder Drive itu, izinkan akses.
- Setelah terhubung, status berubah jadi **"Drive Terhubung"** (bisa "Putuskan" kapan saja).
- Di form Project/Writing/Hobby, klik tombol **"Upload dari Device"** → pilih file → otomatis upload, otomatis ke-set izin "Anyone with the link", dan link langsung terisi ke field gambar.
- Sesi login ada masa berlaku (~1 jam token aktif). Kalau habis, tinggal klik connect lagi — tidak akan kehilangan data apa pun.
- Saat pertama kali login, mungkin muncul layar **"Google hasn't verified this app"** — ini normal untuk app personal yang belum disubmit ke proses review panjang Google. Klik **Advanced** → **Go to (nama app) (unsafe)** untuk lanjut. Ini aman karena app ini cuma kamu sendiri yang pakai (terdaftar sebagai test user) dan scope-nya dibatasi hanya ke file yang diupload lewat app ini saja (`drive.file` scope) — tidak bisa akses file lain di Drive kamu.

## 4. Setup Google Drive — Folder & Izin

Folder yang dipakai:
`https://drive.google.com/drive/folders/1wMpqLeZESrsL8TKUTyAPJ-62vy5zHQQ7`

Kalau upload lewat tombol "Upload dari Device", izin otomatis diatur. Kalau masih mau paste link manual
untuk foto yang sudah ada di Drive sebelumnya:
1. Klik kanan file → **Get link** / **Bagikan**.
2. Ubah akses jadi **"Anyone with the link"** (Siapa saja yang memiliki link) → role **Viewer**.
3. Copy link, paste ke kolom gambar yang relevan di Admin Panel.

Kalau foto tidak muncul (ada ikon "image off"), kemungkinan besar izin share-nya belum "Anyone with the link".

## 5. Struktur Koleksi Firestore

| Collection      | Field penting |
|------------------|---------------|
| `projects`       | title, description, longDescription, techStack[], category, coverImage, gallery[], githubUrl, liveUrl, features[], featured, createdAt |
| `categories`     | name, slug |
| `skills`         | name, category ("Frontend"/"Backend"/"Tools"/"Other"), level (0-100) |
| `experiences`    | type ("work"/"education"/"organization"), title, organization, location, startDate, endDate, description, current |
| `writings`       | title, excerpt, content, coverImage, tags[], published, createdAt |
| `hobbyMoments`   | title, description, image, category, createdAt |
| `messages`       | name, email, subject, message, createdAt, read |

## 6. Firestore Security Rules (WAJIB dipasang)

Buka **Firebase Console → Firestore Database → Rules**, ganti isinya dengan ini, lalu klik **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Koleksi konten: publik bisa baca, hanya user yang login (admin) yang bisa tulis
    match /projects/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /categories/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /skills/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /experiences/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /writings/{docId} {
      // Hanya tampilkan yang published ke publik; admin (auth) bisa baca semua termasuk draft
      allow read: if resource.data.published == true || request.auth != null;
      allow write: if request.auth != null;
    }
    match /hobbyMoments/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Pesan kontak: publik boleh KIRIM (create) saja, tidak boleh baca/edit/hapus.
    // Hanya admin yang bisa baca & hapus dari Admin Panel.
    match /messages/{docId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

Setelah klik Publish, refresh halaman admin panel — error "Missing or insufficient permissions" akan hilang
(asalkan kamu juga sudah login di `/login`).

## 7. Login Admin

Login admin pakai Firebase Authentication (Email/Password) di `/login`. Pastikan kamu sudah membuat user admin di Firebase Console → Authentication → Users. Setelah login, akses panel di `/admin`.

## 8. Catatan Teknis

- TypeScript check (`npx tsc --noEmit`) dan production build (`npm run build`) sudah dicoba dan **lolos tanpa error**.
- Dependency `next-themes` di `package.json` sebenarnya sudah tidak terpakai (theme toggle dibangun custom di `src/contexts/ThemeContext.tsx`), aman dihapus kalau mau lebih ringkas, tapi tidak mengganggu apa pun jika dibiarkan.
- Bundle JS sekitar 1.1MB (300KB gzip) — wajar untuk app dengan shadcn/ui lengkap + Firebase + framer-motion. Bisa dioptimasi lebih lanjut dengan code-splitting kalau suatu saat terasa lambat, tapi untuk portfolio personal ini sudah lebih dari cukup.
- Upload Google Drive pakai Google Identity Services (dimuat lewat script tag di `index.html`, bukan npm package tambahan) + Drive API REST langsung dari browser. Scope yang dipakai: `drive.file` — paling sempit, app hanya bisa akses file yang dia upload sendiri, tidak bisa baca file lain di Drive kamu.
- Token OAuth disimpan di `localStorage` browser (key: `darrell-site-gdrive-token`), bukan di server manapun. Aman untuk dipakai sendiri sebagai admin tunggal.

