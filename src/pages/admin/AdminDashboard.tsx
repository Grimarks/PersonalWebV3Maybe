import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer } from "firebase/firestore";
import { FolderKanban, Lightbulb, Briefcase, MessageSquare, PenLine, Coffee, Loader2 } from "lucide-react";

interface StatItem {
  label: string;
  value: number;
  icon: typeof FolderKanban;
  sub?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatItem[] | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [projects, skills, experiences, writings, hobbyMoments, messages] = await Promise.all([
          getCountFromServer(collection(db, "projects")),
          getCountFromServer(collection(db, "skills")),
          getCountFromServer(collection(db, "experiences")),
          getCountFromServer(collection(db, "writings")),
          getCountFromServer(collection(db, "hobbyMoments")),
          getCountFromServer(collection(db, "messages")),
        ]);

        setStats([
          { label: "Projects", value: projects.data().count, icon: FolderKanban },
          { label: "Skills", value: skills.data().count, icon: Lightbulb },
          { label: "Experience", value: experiences.data().count, icon: Briefcase },
          { label: "Tulisan", value: writings.data().count, icon: PenLine },
          { label: "Momen Hobi", value: hobbyMoments.data().count, icon: Coffee },
          { label: "Pesan Masuk", value: messages.data().count, icon: MessageSquare },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard counts:", error);
        setStats([]);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 text-foreground">Dashboard</h1>
      <p className="text-muted-foreground text-sm mb-6">Ringkasan data situs kamu, langsung dari Firestore.</p>

      {stats === null ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="soft-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{s.value}</p>
              {s.sub && <p className="text-xs text-primary mt-1">{s.sub}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
