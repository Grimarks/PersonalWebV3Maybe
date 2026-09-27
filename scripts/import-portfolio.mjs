#!/usr/bin/env node
// Import data project, skill, dan kategori dari scripts/portfolio-data.json ke Firestore.
//
// Idempotent — aman dijalankan berulang kali:
//   - categories dicocokkan lewat `slug`
//   - projects dicocokkan lewat `githubUrl` (dinormalisasi); coverImage & gallery TIDAK pernah disentuh
//   - skills dicocokkan lewat `name` (case-insensitive)
// Dokumen yang isinya sudah sama dilewati; yang beda di-update; yang belum ada dibuat.
//
// Pemakaian:
//   npm install --no-save firebase-admin
//   export GOOGLE_APPLICATION_CREDENTIALS=/path/ke/service-account.json
//   node scripts/import-portfolio.mjs --dry-run   # lihat rencana perubahan, tanpa menulis
//   node scripts/import-portfolio.mjs             # tulis ke Firestore

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");
const UNVERIFIED_MARKER = "[PERLU DICEK]";

const dataPath = join(dirname(fileURLToPath(import.meta.url)), "portfolio-data.json");
const data = JSON.parse(readFileSync(dataPath, "utf8"));

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error("GOOGLE_APPLICATION_CREDENTIALS belum di-set. Arahkan ke file JSON service account.");
  process.exit(1);
}

// Tolak import kalau masih ada konten yang belum diverifikasi.
if (JSON.stringify(data).includes(UNVERIFIED_MARKER)) {
  console.error(`Masih ada "${UNVERIFIED_MARKER}" di portfolio-data.json. Lengkapi dulu sebelum import.`);
  process.exit(1);
}

let initializeApp, applicationDefault, getFirestore;
try {
  ({ initializeApp, applicationDefault } = await import("firebase-admin/app"));
  ({ getFirestore } = await import("firebase-admin/firestore"));
} catch {
  console.error("firebase-admin belum terpasang. Jalankan: npm install --no-save firebase-admin");
  process.exit(1);
}

initializeApp({ credential: applicationDefault(), projectId: data.firebaseProjectId });
const db = getFirestore();

const PROJECT_FIELDS = [
  "title",
  "description",
  "longDescription",
  "techStack",
  "category",
  "githubUrl",
  "liveUrl",
  "features",
  "featured",
  "createdAt",
];
const SKILL_FIELDS = ["name", "category", "level"];
const VALID_SKILL_CATEGORIES = ["Frontend", "Backend", "Mobile", "AI/ML", "Tools", "Other"];

const normalizeUrl = (url = "") => url.trim().toLowerCase().replace(/\.git$/, "").replace(/\/+$/, "");
const pick = (obj, fields) => Object.fromEntries(fields.map((f) => [f, obj[f]]));
const changedFields = (existing, next) =>
  Object.keys(next).filter((k) => JSON.stringify(existing[k]) !== JSON.stringify(next[k]));

const summary = { created: 0, updated: 0, unchanged: 0 };

async function upsert({ label, collection, existing, payload, createDefaults = {} }) {
  if (!existing) {
    console.log(`  + CREATE ${label}`);
    summary.created++;
    if (!DRY_RUN) await db.collection(collection).add({ ...createDefaults, ...payload });
    return;
  }
  const diff = changedFields(existing.data(), payload);
  if (diff.length === 0) {
    console.log(`  = SKIP   ${label} (tidak ada perubahan)`);
    summary.unchanged++;
    return;
  }
  console.log(`  ~ UPDATE ${label} [${diff.join(", ")}] (doc ${existing.id})`);
  summary.updated++;
  if (!DRY_RUN) await existing.ref.update(pick(payload, diff));
}

// Cari duplikat di Firestore berdasarkan key, peringatkan kalau ada lebih dari satu.
function indexBy(docs, keyFn, label) {
  const map = new Map();
  for (const d of docs) {
    const key = keyFn(d.data());
    if (!key) continue;
    if (map.has(key)) console.warn(`  ! Duplikat ${label} "${key}" (doc ${d.id}); memakai doc ${map.get(key).id}`);
    else map.set(key, d);
  }
  return map;
}

async function importCategories() {
  console.log("\nCategories");
  const snap = await db.collection("categories").get();
  const bySlug = indexBy(snap.docs, (c) => c.slug, "kategori");
  for (const cat of data.categories) {
    await upsert({
      label: cat.slug,
      collection: "categories",
      existing: bySlug.get(cat.slug),
      payload: { name: cat.name, slug: cat.slug },
    });
  }
  return new Set([...bySlug.keys(), ...data.categories.map((c) => c.slug)]);
}

async function importProjects(knownCategories) {
  console.log("\nProjects");
  const snap = await db.collection("projects").get();
  const byGithub = indexBy(snap.docs, (p) => normalizeUrl(p.githubUrl), "githubUrl");
  for (const project of data.projects) {
    if (!project.githubUrl) throw new Error(`Project "${project.title}" tidak punya githubUrl (dipakai sebagai key).`);
    if (!knownCategories.has(project.category)) {
      throw new Error(`Kategori "${project.category}" untuk "${project.title}" tidak ada di collection categories.`);
    }
    await upsert({
      label: project.title,
      collection: "projects",
      existing: byGithub.get(normalizeUrl(project.githubUrl)),
      payload: pick(project, PROJECT_FIELDS),
      createDefaults: { coverImage: "", gallery: [] },
    });
  }
}

async function importSkills() {
  console.log("\nSkills");
  const snap = await db.collection("skills").get();
  const byName = indexBy(snap.docs, (s) => s.name?.trim().toLowerCase(), "skill");
  for (const skill of data.skills) {
    if (!VALID_SKILL_CATEGORIES.includes(skill.category)) {
      throw new Error(`Kategori skill "${skill.category}" untuk "${skill.name}" tidak valid.`);
    }
    if (typeof skill.level !== "number" || skill.level < 0 || skill.level > 100) {
      throw new Error(`Level skill "${skill.name}" harus angka 0-100.`);
    }
    await upsert({
      label: skill.name,
      collection: "skills",
      existing: byName.get(skill.name.trim().toLowerCase()),
      payload: pick(skill, SKILL_FIELDS),
    });
  }
}

console.log(`${DRY_RUN ? "[DRY RUN] " : ""}Import ke project Firebase "${data.firebaseProjectId}"`);
const knownCategories = await importCategories();
await importProjects(knownCategories);
await importSkills();
console.log(
  `\n${DRY_RUN ? "[DRY RUN] Akan" : "Selesai:"} dibuat ${summary.created}, di-update ${summary.updated}, tidak berubah ${summary.unchanged}.`
);
