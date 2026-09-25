import { Link } from "react-router-dom";
import { Github, ExternalLink } from "lucide-react";
import { DriveImage } from "@/components/DriveImage";
import { Skeleton } from "@/components/ui/skeleton";
import type { Project } from "@/data/types";
import { getEffectiveCoverImage } from "@/data/types";

interface ProjectCardProps {
  project: Project;
  categoryName: string;
  maxTech?: number;
}

/**
 * Kartu project. Seluruh kartu bisa diklik (link "stretched" lewat ::after),
 * sementara tombol GitHub/Live Demo tetap berupa <a> terpisah di atasnya —
 * tidak ada elemen interaktif bersarang di dalam <a>.
 */
export function ProjectCard({ project, categoryName, maxTech = 3 }: ProjectCardProps) {
  const tech = Array.isArray(project.techStack) ? project.techStack : [];

  return (
    <article className="group relative flex h-full flex-col overflow-hidden soft-card soft-card-hover focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        <DriveImage
          src={getEffectiveCoverImage(project)}
          alt={project.title}
          thumbnail
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          fallbackClassName="h-full w-full"
        />
      </div>

      <div className="flex flex-grow flex-col p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <span className="font-mono text-xs uppercase tracking-wider text-primary">{categoryName}</span>
          <div className="relative z-10 -mr-1.5 -mt-1.5 flex gap-1">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                title="Lihat kode sumber"
                aria-label={`Kode sumber ${project.title}`}
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                title="Live demo"
                aria-label={`Live demo ${project.title}`}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <h3 className="mb-2 line-clamp-2 text-xl font-bold text-foreground transition-colors group-hover:text-primary">
          <Link to={`/projects/${project.id}`} className="outline-none after:absolute after:inset-0 after:content-['']">
            {project.title}
          </Link>
        </h3>

        <p className="mb-4 line-clamp-3 flex-grow text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        {tech.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2">
            {tech.slice(0, maxTech).map((t) => (
              <span key={t} className="rounded bg-secondary px-2 py-1 font-mono text-[11px] text-secondary-foreground">
                {t}
              </span>
            ))}
            {tech.length > maxTech && (
              <span className="rounded bg-secondary px-2 py-1 font-mono text-[11px] text-secondary-foreground">
                +{tech.length - maxTech}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="soft-card overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-14" />
        </div>
      </div>
    </div>
  );
}
