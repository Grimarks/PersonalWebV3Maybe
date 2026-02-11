import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";
import { usePortfolio } from "@/data/portfolio-data";
import PublicLayout from "@/components/layout/PublicLayout";

export default function Projects() {
  const { projects, categories } = usePortfolio();
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = activeFilter === "all" ? projects : projects.filter((p) => p.category === activeFilter);

  return (
    <PublicLayout>
      <section className="section-padding">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-5xl text-primary font-bold mb-4">Projects</h1>
            <p className="text-muted-foreground text-lg mb-10 max-w-2xl">
              A collection of projects I've built — from full-stack apps to developer tools.
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveFilter(cat.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === cat.slug
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  to={`/projects/${project.id}`}
                  className="glass-card group block p-6 h-full hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-mono text-xs text-primary uppercase tracking-wider">{project.category}</span>
                    <div className="flex gap-3">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-foreground transition-colors">
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-foreground transition-colors">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl text-muted-foreground font-bold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <span key={tech} className="font-mono text-xs px-2 py-1 rounded bg-secondary text-muted-foreground">
                        {tech}
                      </span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-muted-foreground text-center py-20">No projects found in this category.</p>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
