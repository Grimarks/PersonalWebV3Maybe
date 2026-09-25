import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { FolderKanban, Lightbulb, Briefcase, MessageSquare, PenLine, Coffee } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatItem {
  label: string;
  value: number;
  icon: typeof FolderKanban;
  to: string;
  sub?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [projects, skills, experiences, writings, drafts, hobbyMoments, messages, unread] = await Promise.all([
          getCountFromServer(collection(db, "projects")),
          getCountFromServer(collection(db, "skills")),
          getCountFromServer(collection(db, "experiences")),
          getCountFromServer(collection(db, "writings")),
          getCountFromServer(query(collection(db, "writings"), where("published", "==", false))),
          getCountFromServer(collection(db, "hobbyMoments")),
          getCountFromServer(collection(db, "messages")),
          getCountFromServer(query(collection(db, "messages"), where("read", "==", false))),
        ]);

        const draftCount = drafts.data().count;
        const unreadCount = unread.data().count;

        setStats([
          { label: "Projects", value: projects.data().count, icon: FolderKanban, to: "/admin/projects" },
          { label: "Skills", value: skills.data().count, icon: Lightbulb, to: "/admin/skills" },
          { label: "Experience", value: experiences.data().count, icon: Briefcase, to: "/admin/experience" },
          {
            label: "Tulisan",
            value: writings.data().count,
            icon: PenLine,
            to: "/admin/writing",
            sub: draftCount > 0 ? `${draftCount} draft` : undefined,
          },
          { label: "Momen Hobi", value: hobbyMoments.data().count, icon: Coffee, to: "/admin/hobby" },
          {
            label: "Pesan Masuk",
            value: messages.data().count,
            icon: MessageSquare,
            to: "/admin/messages",
            sub: unreadCount > 0 ? `${unreadCount} belum dibaca` : undefined,
          },
        ]);
      } catch (err) {
        console.error("Error fetching dashboard counts:", err);
        setError(true);
        setStats([]);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 text-foreground">Dashboard</h1>
      <p className="text-muted-foreground text-sm mb-6">Ringkasan data situs kamu, langsung dari Firestore.</p>

      {error && (
        <div className="soft-card mb-4 p-4 text-sm text-destructive">
          Gagal memuat statistik. Pastikan Firestore Rules sudah dipasang (lihat SETUP_GUIDE.md).
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats === null
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[116px] rounded-2xl" />)
          : stats.map((s) => (
              <Link key={s.label} to={s.to} className="soft-card soft-card-hover p-6 group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <s.icon className="h-4 w-4" />
                  </span>
                </div>
                <p className="text-3xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-primary mt-1 h-4">{s.sub}</p>
              </Link>
            ))}
      </div>
    </div>
  );
}
