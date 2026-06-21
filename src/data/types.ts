// Tipe data terpusat untuk seluruh koleksi Firestore yang dipakai di web ini.
// Semua halaman publik & admin mengacu ke tipe yang sama di sini supaya konsisten.

export interface Project {
  id: string;
  title: string;
  description: string; // ringkasan singkat untuk card
  longDescription: string; // penjelasan lengkap di halaman detail
  techStack: string[];
  category: string; // slug kategori, mengacu ke Category.slug
  coverImage: string; // link Google Drive untuk foto utama/sampul (dipilih admin)
  gallery: string[]; // daftar link Google Drive untuk foto-foto tambahan project
  githubUrl?: string;
  liveUrl?: string;
  features: string[];
  featured: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Skill {
  id: string;
  name: string;
  category: "Frontend" | "Backend" | "Tools" | "Other";
  level: number; // 0-100
}

export interface Experience {
  id: string;
  type: "work" | "education" | "organization";
  title: string;
  organization: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description: string;
  current: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

// ---- Hobi: Menulis ----
export interface Writing {
  id: string;
  title: string;
  excerpt: string; // ringkasan singkat untuk card daftar tulisan
  content: string; // isi tulisan lengkap (mendukung paragraf multi-baris)
  coverImage?: string; // opsional, link Google Drive
  tags: string[];
  published: boolean; // draft vs publish
  createdAt: string;
}

// ---- Hobi: Galeri (mis. kopi, momen sehari-hari) ----
export interface HobbyMoment {
  id: string;
  title: string; // mis. "V60 Ethiopia Yirgacheffe"
  description: string; // mis. "Coba seduh manual pakai V60..."
  image: string; // link Google Drive
  category: string; // mis. "Kopi", "Tokusatsu", "Gaming", bebas diisi admin
  createdAt: string;
}

export const PROJECT_CATEGORIES_FALLBACK: Category[] = [
  { id: "web", name: "Web", slug: "web" },
  { id: "mobile", name: "Mobile", slug: "mobile" },
  { id: "ai", name: "AI / ML", slug: "ai" },
  { id: "research", name: "Research", slug: "research" },
];

export const SKILL_CATEGORIES: Skill["category"][] = [
  "Frontend",
  "Backend",
  "Tools",
  "Other",
];

export const HOBBY_CATEGORIES_SUGGESTIONS = [
  "Kopi",
  "Gaming",
  "Tokusatsu",
  "Lainnya",
];

/**
 * Mengembalikan foto cover efektif untuk sebuah project: pakai coverImage
 * kalau sudah di-set, kalau belum/admin lupa klik bintang, fallback ke
 * foto pertama di gallery supaya project tetap punya foto sampul.
 */
export function getEffectiveCoverImage(project: Pick<Project, "coverImage" | "gallery">): string {
  if (project.coverImage) return project.coverImage;
  if (project.gallery && project.gallery.length > 0) return project.gallery[0];
  return "";
}
