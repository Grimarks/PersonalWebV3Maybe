import { useEffect, useState } from "react";
import { Briefcase, GraduationCap, Users, Loader2, MapPin } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Experience } from "@/data/types";

const typeMeta = {
  work: { icon: Briefcase, label: "Pengalaman Kerja" },
  education: { icon: GraduationCap, label: "Pendidikan" },
  organization: { icon: Users, label: "Organisasi" },
};

function ExperienceCard({ item }: { item: Experience }) {
  return (
    <div className="soft-card p-6 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
        <div>
          <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
          <div className="text-base font-medium text-primary">{item.organization}</div>
          {item.location && (
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3 mr-1" /> {item.location}
            </div>
          )}
        </div>
        <Badge variant={item.current ? "default" : "secondary"} className="w-fit flex-shrink-0">
          {item.current ? "Sedang berjalan" : `${item.startDate} – ${item.endDate || "—"}`}
        </Badge>
      </div>
      <p className="text-muted-foreground whitespace-pre-line leading-relaxed mt-3">{item.description}</p>
    </div>
  );
}

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "experiences"));
        const data = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Experience[];
        data.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        setExperiences(data);
      } catch (error) {
        console.error("Error fetching experience:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, []);

  const workExperiences = experiences.filter((e) => e.type === "work");
  const educationExperiences = experiences.filter((e) => e.type === "education");
  const organizationExperiences = experiences.filter((e) => e.type === "organization");

  const columns = [
    { type: "work" as const, items: workExperiences },
    { type: "education" as const, items: educationExperiences },
  ];

  return (
    <PublicLayout>
      <div className="container-custom py-10 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Experience & Education</h1>
          <p className="text-muted-foreground">Perjalanan akademik, riset, dan profesional saya sejauh ini.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-12">
              {columns.map(({ type, items }) => {
                const meta = typeMeta[type];
                const Icon = meta.icon;
                return (
                  <div key={type} className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">{meta.label}</h2>
                    </div>
                    {items.length > 0 ? (
                      <div className="space-y-5">
                        {items.map((item) => (
                          <ExperienceCard key={item.id} item={item} />
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
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Organisasi</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  {organizationExperiences.map((item) => (
                    <ExperienceCard key={item.id} item={item} />
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
