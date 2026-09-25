import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Users, MapPin, CalendarDays } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Experience } from "@/data/types";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { formatMonthYear, toTime } from "@/lib/date";
import { cn } from "@/lib/utils";

const typeMeta = {
  work: { icon: Briefcase, label: "Pengalaman Kerja" },
  education: { icon: GraduationCap, label: "Pendidikan" },
  organization: { icon: Users, label: "Organisasi" },
};

function formatPeriod(item: Experience) {
  const start = formatMonthYear(item.startDate);
  const end = item.current ? "Sekarang" : formatMonthYear(item.endDate);
  if (start && end) return `${start} – ${end}`;
  return start || end || "";
}

function ExperienceCard({ item, index }: { item: Experience; index: number }) {
  const period = formatPeriod(item);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index, 5) * 0.06 }}
      className="soft-card soft-card-hover p-6 relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
          <div className="text-base font-medium text-primary">{item.organization}</div>
          {item.location && (
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" /> {item.location}
            </div>
          )}
        </div>
        {period && (
          <span
            className={cn(
              "inline-flex w-fit flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              item.current ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"
            )}
          >
            {item.current ? (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
            ) : (
              <CalendarDays className="h-3 w-3" />
            )}
            {period}
          </span>
        )}
      </div>
      {item.description && (
        <p className="text-muted-foreground whitespace-pre-line leading-relaxed mt-3">{item.description}</p>
      )}
    </motion.div>
  );
}

function SectionHeader({ type }: { type: keyof typeof typeMeta }) {
  const meta = typeMeta[type];
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">{meta.label}</h2>
    </div>
  );
}

export default function ExperiencePage() {
  useDocumentTitle("Experience");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "experiences"));
        const data = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Experience[];
        // Yang masih berjalan di atas, lalu terbaru berdasarkan tanggal mulai.
        data.sort((a, b) => Number(!!b.current) - Number(!!a.current) || toTime(b.startDate) - toTime(a.startDate));
        setExperiences(data);
      } catch (err) {
        console.error("Error fetching experience:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, []);

  const byType = (type: Experience["type"]) => experiences.filter((e) => e.type === type);
  const organizationExperiences = byType("organization");

  return (
    <PublicLayout>
      <div className="container-custom pt-10 pb-16 md:pt-14 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Experience & Education</h1>
          <p className="text-muted-foreground">Perjalanan akademik, riset, dan profesional saya sejauh ini.</p>
        </div>

        {loading ? (
          <div className="grid lg:grid-cols-2 gap-12">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-5">
                <Skeleton className="h-11 w-56" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="soft-card p-10 text-center text-muted-foreground max-w-xl mx-auto">
            Gagal memuat data. Coba muat ulang halaman.
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-12">
              {(["work", "education"] as const).map((type) => {
                const items = byType(type);
                return (
                  <div key={type} className="space-y-6">
                    <SectionHeader type={type} />
                    {items.length > 0 ? (
                      <div className="space-y-5">
                        {items.map((item, i) => (
                          <ExperienceCard key={item.id} item={item} index={i} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">Belum ada data.</p>
                    )}
                  </div>
                );
              })}
            </div>

            {organizationExperiences.length > 0 && (
              <div className="space-y-6">
                <SectionHeader type="organization" />
                <div className="grid md:grid-cols-2 gap-5">
                  {organizationExperiences.map((item, i) => (
                    <ExperienceCard key={item.id} item={item} index={i} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
