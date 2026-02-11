import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Github, ExternalLink } from "lucide-react";
import { usePortfolio } from "@/data/portfolio-data";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";

export default function ProjectDetail() {
  const { id } = useParams();
  const { projects } = usePortfolio();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <PublicLayout>
        <div className="section-padding container-custom text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Button asChild variant="outline">
            <Link to="/projects"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link to="/projects" className="inline-flex items-center text-lg text-muted-foreground hover:text-primary transition-colors mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
            </Link>

            <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
              <div>
                <span className="font-mono text-xs text-primary uppercase tracking-wider">{project.category}</span>
                <h1 className="text-4xl text-primary md:text-5xl font-bold mt-2">{project.title}</h1>
              </div>
              <div className="flex gap-3">
                {project.githubUrl && (
                    <Button asChild size="sm">
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" /> Source
                    </a>
                  </Button>
                )}
                {project.liveUrl && (
                  <Button asChild size="sm">
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed mb-10">{project.longDescription}</p>

            {/* Tech Stack */}
            <div className="mb-10">
              <h2 className="text-xl text-primary font-bold mb-4">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span key={tech} className="font-mono text-sm px-3 py-1.5 rounded-full bg-secondary text-foreground">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Features */}
            {project.features.length > 0 && (
              <div>
                <h2 className="text-xl text-primary font-bold mb-4">Key Features</h2>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {project.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
