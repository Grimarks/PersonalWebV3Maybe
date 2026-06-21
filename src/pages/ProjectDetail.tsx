import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Github, ExternalLink, Loader2, Calendar, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/layout/PublicLayout";
import { DriveImage } from "@/components/DriveImage";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/data/types";
import { cn } from "@/lib/utils";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const docRef = doc(db, "projects", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Project;
          setProject(data);
          setActiveImage(data.coverImage || data.gallery?.[0] || "");
        } else {
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

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  if (!project) {
    return (
      <PublicLayout>
        <div className="container-custom py-24 text-center">
          <h1 className="text-3xl font-bold mb-4 text-foreground">Project tidak ditemukan</h1>
          <p className="text-muted-foreground mb-8">
            Project yang kamu cari tidak ada atau sudah dihapus.
          </p>
          <Button asChild variant="outline">
            <Link to="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Projects
            </Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const allImages = [project.coverImage, ...(project.gallery || [])].filter(Boolean) as string[];
  const uniqueImages = Array.from(new Set(allImages));

  return (
    <PublicLayout>
      <section className="pb-16">
        <div className="container-custom max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link
              to="/projects"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8 group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Projects
            </Link>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div className="space-y-3">
                <Badge variant="outline" className="text-primary border-primary/30 uppercase tracking-wider">
                  {project.category}
                </Badge>
                <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">{project.title}</h1>
                {project.createdAt && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Ditambahkan {new Date(project.createdAt).toLocaleDateString("id-ID")}</span>
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

            {/* Galeri Foto: foto utama besar + thumbnail bisa diklik */}
            {uniqueImages.length > 0 && (
              <div className="mb-10 space-y-3">
                <div className="rounded-2xl overflow-hidden border border-border bg-muted shadow-sm">
                  <DriveImage
                    src={activeImage}
                    alt={project.title}
                    className="w-full h-auto max-h-[480px] object-cover"
                    fallbackClassName="w-full h-72"
                  />
                </div>
                {uniqueImages.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                    {uniqueImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={cn(
                          "flex-shrink-0 h-20 w-28 rounded-lg overflow-hidden border-2 transition-all",
                          activeImage === img
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border opacity-70 hover:opacity-100"
                        )}
                      >
                        <DriveImage
                          src={img}
                          alt={`${project.title} - foto ${idx + 1}`}
                          thumbnail
                          thumbnailWidth={300}
                          className="w-full h-full object-cover"
                          fallbackClassName="w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {uniqueImages.length === 0 && (
              <div className="mb-10 rounded-2xl border-2 border-dashed border-border bg-muted/30 h-56 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <ImageIcon className="h-8 w-8 opacity-40" />
                <span className="text-sm">Belum ada foto untuk project ini</span>
              </div>
            )}

            <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
              <h3 className="text-xl font-semibold mb-2 text-foreground">Overview</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {project.longDescription || project.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-4 border-b border-border pb-2">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack && project.techStack.length > 0 ? (
                    project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-sm px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground border border-border"
                      >
                        {tech}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground italic">Belum ada tech stack.</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4 border-b border-border pb-2">Fitur Utama</h3>
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
                  <p className="text-muted-foreground italic">Belum ada fitur yang dicatat.</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
