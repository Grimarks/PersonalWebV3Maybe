import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Github, ExternalLink, Loader2, Code2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";

// Interface untuk Tipe Data
interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  category: string;
  image?: string;
  githubUrl?: string;
  liveUrl?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data dari Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch Projects
        const projectsSnapshot = await getDocs(collection(db, "projects"));
        const projectsData = projectsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Project[];

        // Fetch Categories
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const categoriesData = categoriesSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Category[];

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

  // 2. Filter Logic
  const filteredProjects =
      activeFilter === "all"
          ? projects
          : projects.filter((p) => p.category === activeFilter);

  return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="flex-grow">
          <section className="pt-24 pb-12 px-4 md:px-8">
            <div className="container mx-auto max-w-6xl">
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-12"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Projects</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  A collection of projects I've built — from full-stack apps to developer tools.
                </p>
              </motion.div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2 mb-10">
                <button
                    onClick={() => setActiveFilter("all")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        activeFilter === "all"
                            ? "bg-primary text-primary-foreground shadow-lg"
                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveFilter(cat.slug)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            activeFilter === cat.slug
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                    >
                      {cat.name}
                    </button>
                ))}
              </div>

              {/* Content Area */}
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
                              transition={{ duration: 0.4, delay: i * 0.1 }}
                          >
                            <Link
                                to={`/projects/${project.id}`}
                                className="group block h-full glass-card border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl flex flex-col"
                            >
                              {/* Image / Placeholder */}
                              <div className="aspect-video w-full bg-muted/50 overflow-hidden relative">
                                {project.image ? (
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                                      <Code2 className="w-12 h-12 text-muted-foreground/30" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                  <span className="text-white font-medium px-4 py-2 border border-white/30 rounded-full backdrop-blur-sm">View Details</span>
                                </div>
                              </div>

                              <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-start justify-between mb-3">
                                  <Badge variant="outline" className="font-mono text-xs uppercase tracking-wider">
                                    {project.category}
                                  </Badge>
                                  <div className="flex gap-3 relative z-10">
                                    {project.githubUrl && (
                                        <a
                                            href={project.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-muted-foreground hover:text-primary transition-colors"
                                            title="View Source Code"
                                        >
                                          <Github className="h-4 w-4" />
                                        </a>
                                    )}
                                    {project.liveUrl && (
                                        <a
                                            href={project.liveUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-muted-foreground hover:text-primary transition-colors"
                                            title="Live Demo"
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                        </a>
                                    )}
                                  </div>
                                </div>

                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                                  {project.title}
                                </h3>

                                <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3 flex-grow">
                                  {project.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mt-auto">
                                  {Array.isArray(project.techStack) && project.techStack.slice(0, 3).map((tech) => (
                                      <span key={tech} className="text-[10px] px-2 py-1 rounded bg-secondary text-secondary-foreground font-mono">
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
                        <div className="text-center py-20 border-2 border-dashed rounded-xl">
                          <p className="text-muted-foreground text-lg">No projects found in this category.</p>
                          <button
                              onClick={() => setActiveFilter("all")}
                              className="mt-4 text-primary hover:underline"
                          >
                            Clear filters
                          </button>
                        </div>
                    )}
                  </>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
  );
}