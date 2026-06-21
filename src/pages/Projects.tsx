import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Github, ExternalLink, Loader2, Code2 } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { DriveImage } from "@/components/DriveImage";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import type { Project, Category } from "@/data/types";
import { getEffectiveCoverImage } from "@/data/types";
import { cn } from "@/lib/utils";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const projectsSnapshot = await getDocs(collection(db, "projects"));
        const projectsData = projectsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Project[];

        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const categoriesData = categoriesSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Category[];

        projectsData.sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        setProjects(projectsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProjects =
    activeFilter === "all" ? projects : projects.filter((p) => p.category === activeFilter);

  return (
    <PublicLayout>
      <section className="pt-8 pb-12 px-4 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Projects</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Kumpulan project yang pernah saya bangun — dari riset NLP, aplikasi mobile, sampai eksperimen
              full-stack.
            </p>
          </motion.div>

          {/* Filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setActiveFilter("all")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                activeFilter === "all"
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground"
              )}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.slug)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                  activeFilter === cat.slug
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                  >
                    <Link
                      to={`/projects/${project.id}`}
                      className="group block h-full soft-card soft-card-hover overflow-hidden flex flex-col"
                    >
                      <div className="aspect-video w-full bg-muted overflow-hidden relative">
                        {getEffectiveCoverImage(project) ? (
                          <DriveImage
                            src={getEffectiveCoverImage(project)}
                            alt={project.title}
                            thumbnail
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            fallbackClassName="w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary/40">
                            <Code2 className="w-12 h-12 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/50 transition-colors duration-300 flex items-center justify-center">
                          <span className="text-white text-sm font-medium px-4 py-2 border border-white/40 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            Lihat Detail
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="outline" className="font-mono text-xs uppercase tracking-wider">
                            {project.category}
                          </Badge>
                          <div className="flex gap-3 relative z-10">
                            {project.githubUrl && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  window.open(project.githubUrl, "_blank", "noopener,noreferrer");
                                }}
                                className="text-muted-foreground hover:text-primary transition-colors"
                                title="Lihat kode sumber"
                                aria-label="Lihat kode sumber"
                              >
                                <Github className="h-4 w-4" />
                              </button>
                            )}
                            {project.liveUrl && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  window.open(project.liveUrl, "_blank", "noopener,noreferrer");
                                }}
                                className="text-muted-foreground hover:text-primary transition-colors"
                                title="Live demo"
                                aria-label="Live demo"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {project.title}
                        </h3>

                        <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3 flex-grow">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-auto">
                          {Array.isArray(project.techStack) &&
                            project.techStack.slice(0, 3).map((tech) => (
                              <span
                                key={tech}
                                className="text-[10px] px-2 py-1 rounded bg-secondary text-secondary-foreground font-mono"
                              >
                                {tech}
                              </span>
                            ))}
                          {Array.isArray(project.techStack) && project.techStack.length > 3 && (
                            <span className="text-[10px] px-2 py-1 rounded bg-secondary text-secondary-foreground font-mono">
                              +{project.techStack.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {filteredProjects.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
                  <p className="text-muted-foreground text-lg">Belum ada project di kategori ini.</p>
                  <button onClick={() => setActiveFilter("all")} className="mt-4 text-primary hover:underline">
                    Tampilkan semua
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
