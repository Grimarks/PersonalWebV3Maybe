import { useCallback, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Category } from "@/data/types";

/**
 * Mengambil daftar kategori project dari Firestore, plus helper untuk
 * menampilkan nama kategori dari slug yang tersimpan di project.
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, "categories"));
      const data = snap.docs.map((d) => ({ ...d.data(), id: d.id })) as Category[];
      data.sort((a, b) => a.name.localeCompare(b.name));
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getCategoryName = useCallback(
    (slug: string) => categories.find((c) => c.slug === slug)?.name || slug,
    [categories]
  );

  return { categories, loading, refresh, getCategoryName };
}
