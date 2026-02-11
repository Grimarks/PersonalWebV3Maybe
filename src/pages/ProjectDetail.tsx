import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Github, ExternalLink, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";

// Interface agar TypeScript tidak error
interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string; // Bisa kosong
  techStack: string[];
  category: string;
  image?: string;
  githubUrl?: string;
  liveUrl?: string;
  features?: string[];
  createdAt?: string;
}

export default function ProjectDetail() {
  const { id } = useParams(); // Ambil ID dari URL
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Data Satu Project dari Firebase
  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // Referensi ke dokumen spesifik
        const docRef = doc(db, "projects", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() } as Project);
        } else {
          console.log("No such document!");
          setProject(null);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // Tampilan Loading
  if (loading) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar />
          <div className="flex-grow flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
          <Footer />
        </div>
    );
  }

  // Tampilan Jika Project Tidak Ditemukan
  if (!project) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar />
          <div className="flex-grow container mx-auto px-4 py-24 text-center">
            <h1 className="text-3xl font-bold mb-4">Project not found</h1>
            <p className="text-muted-foreground mb-8">The project you are looking for does not exist or has been removed.</p>
            <Button asChild variant="outline">
              <Link to="/projects"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects</Link>
            </Button>
          </div>
          <Footer />
        </div>
    );
  }

  // Tampilan Detail Project (Berhasil Load)
  return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="flex-grow pt-24 pb-12">
          <section className="container mx-auto px-4 md:px-8 max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
              {/* Tombol Back */}
              <Link
                  to="/projects"
                  className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8 group"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Projects
              </Link>

              {/* Header: Kategori, Judul, Tombol Link */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div className="space-y-4">
                  <Badge variant="outline" className="text-primary border-primary/30 uppercase tracking-wider">
                    {project.category}
                  </Badge>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                    {project.title}
                  </h1>
                  {project.createdAt && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Added on {new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                  )}
                </div>

                <div className="flex gap-3 flex-shrink-0">
                  {project.githubUrl && (
                      <Button asChild variant="outline" size="sm">
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="mr-2 h-4 w-4" /> Code
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

              {/* Gambar Project (Jika Ada) */}
              {project.image && (
                  <div className="rounded-xl overflow-hidden border bg-muted mb-10 shadow-lg">
                    <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-auto max-h-[500px] object-cover object-top"
                    />
                  </div>
              )}

              {/* Deskripsi */}
              <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
                <h3 className="text-xl font-semibold mb-2">Overview</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {project.longDescription || project.description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                {/* Tech Stack */}
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-4 border-b pb-2">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack && project.techStack.length > 0 ? (
                        project.techStack.map((tech) => (
                            <span
                                key={tech}
                                className="font-mono text-sm px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground border border-secondary-foreground/10"
                            >
                        {tech}
                      </span>
                        ))
                    ) : (
                        <span className="text-muted-foreground italic">No tech stack listed.</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-4 border-b pb-2">Key Features</h3>
                  {project.features && project.features.length > 0 ? (
                      <ul className="space-y-2">
                        {project.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                              <span className="leading-relaxed">{feature}</span>
                            </li>
                        ))}
                      </ul>
                  ) : (
                      <p className="text-muted-foreground italic">No specific features listed.</p>
                  )}
                </div>
              </div>

            </motion.div>
          </section>
        </main>

        <Footer />
      </div>
  );
}