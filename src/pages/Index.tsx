import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Github } from "lucide-react";
import { usePortfolio } from "@/data/portfolio-data";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";

export default function Index() {
  const { projects } = usePortfolio();
  const featured = projects.filter((p) => p.featured).slice(0, 3);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(160_84%_39%/0.08),transparent_60%)]" />
        <div className="container-custom relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className="font-mono text-primary text-lg mb-4">Hi, my name is</p>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight text-green-300">
              Darrell Satriano<span className="gradient-text">.</span>
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold text-muted-foreground mb-6">
              I build things for the web.
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              Full-stack software developer specializing in building exceptional digital
              experiences. Currently focused on building scalable, accessible, and
              performant web applications.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link to="/projects">
                  View Projects <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg">
                <Link to="/contact">Get in Touch</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="section-padding bg-secondary/35">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-2 text-green-300">Featured Projects</h2>
            <p className="text-muted-foreground mb-12 text-lg">Some things I've built recently</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link
                  to={`/projects/${project.id}`}
                  className="glass-card group block p-6 h-full hover:border-primary/30 transition-all duration-300 hover:glow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="font-mono text-xs text-primary uppercase tracking-wider">
                      {project.category}
                    </span>
                    <div className="flex gap-2">
                      {project.githubUrl && (
                        <Github className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      )}
                      {project.liveUrl && (
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl text-muted-foreground font-bold mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.techStack.slice(0, 4).map((tech) => (
                      <span key={tech} className="font-mono text-xs text-muted-foreground">
                        {tech}
                      </span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link to="/projects">
                View All Projects <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl text-primary font-bold mb-4">Let's Work Together</h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              I'm currently open to new opportunities and interesting projects.
              Feel free to reach out!
            </p>
            <Button asChild size="lg">
              <Link to="/contact">Say Hello</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
