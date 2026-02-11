import { usePortfolio } from "@/data/portfolio-data";
import { FolderKanban, Lightbulb, Briefcase, MessageSquare } from "lucide-react";

export default function AdminDashboard() {
  const { projects, skills, experiences, messages } = usePortfolio();
  const unread = messages.filter((m) => !m.read).length;

  const stats = [
    { label: "Projects", value: projects.length, icon: FolderKanban },
    { label: "Skills", value: skills.length, icon: Lightbulb },
    { label: "Experience", value: experiences.length, icon: Briefcase },
    { label: "Messages", value: messages.length, icon: MessageSquare, sub: unread > 0 ? `${unread} unread` : undefined },
  ];

  return (
    <div>
      <h1 className="text-2xl text-primary font-bold mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl text-muted-foreground font-bold">{s.value}</p>
            {s.sub && <p className="text-xs text-primary mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
