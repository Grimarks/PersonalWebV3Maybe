import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PublicLayout from "@/components/layout/PublicLayout";
import { ProjectCard, ProjectCardSkeleton } from "@/components/ProjectCard";
import { FilterPills } from "@/components/FilterPills";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Project } from "@/data/types";
import { useCategories } from "@/hooks/use-categories";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { sortByDateDesc } from "@/lib/date";

export default function Projects() {
  useDocumentTitle("Projects");
  const { categories, getCategoryName } = useCategories();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDocs(collection(db, "projects"));
        const data = snap.docs.map((d) => ({ ...d.data(), id: d.id })) as Project[];
        setProjects(sortByDateDesc(data, (p) => p.createdAt));
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filterOptions = useMemo(() => {
    const counts = projects.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    return [
      { value: "all", label: "Semua", count: projects.length },
      // Hanya tampilkan kategori yang punya project, supaya tidak ada filter kosong.
      ...categories.filter((c) => counts[c.slug]).map((c) => ({ value: c.slug, label: c.name, count: counts[c.slug] })),
    ];
  }, [projects, categories]);

  const filteredProjects =
    activeFilter === "all" ? projects : projects.filter((p) => p.category === activeFilter);

  return (
    <PublicLayout>
      <section className="container-custom pt-10 pb-16 md:pt-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Projects</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Kumpulan project yang pernah saya bangun — dari riset NLP, aplikasi mobile, sampai eksperimen
            full-stack.
          </p>
        </motion.div>

        {!loading && projects.length > 0 && filterOptions.length > 2 && (
          <FilterPills
            options={filterOptions}
            value={activeFilter}
            onChange={setActiveFilter}
            layoutId="project-filter"
            className="mb-8"
          />
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="soft-card p-10 text-center text-muted-foreground">
            Gagal memuat project. Coba muat ulang halaman.
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground text-lg">
              {projects.length === 0 ? "Belum ada project yang ditambahkan." : "Belum ada project di kategori ini."}
            </p>
            {activeFilter !== "all" && (
              <button onClick={() => setActiveFilter("all")} className="mt-4 text-primary hover:underline">
                Tampilkan semua
              </button>
            )}
          </div>
        ) : (
          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredProjects.map((project, i) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.35, delay: Math.min(i, 6) * 0.05 } }}
                  exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
                >
                  <ProjectCard project={project} categoryName={getCategoryName(project.category)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </PublicLayout>
  );
}
