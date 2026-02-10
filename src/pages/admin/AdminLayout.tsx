import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Tag, Lightbulb, Briefcase, MessageSquare, ArrowLeft } from "lucide-react";

const links = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/projects", icon: FolderKanban, label: "Projects" },
  { to: "/admin/categories", icon: Tag, label: "Categories" },
  { to: "/admin/skills", icon: Lightbulb, label: "Skills" },
  { to: "/admin/experience", icon: Briefcase, label: "Experience" },
  { to: "/admin/messages", icon: MessageSquare, label: "Messages" },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-60 border-r border-border bg-card flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-border">
          <span className="font-mono text-sm font-bold text-primary">Admin Panel</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`
              }
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <NavLink to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-2">
            <ArrowLeft className="h-4 w-4" /> Back to Site
          </NavLink>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
