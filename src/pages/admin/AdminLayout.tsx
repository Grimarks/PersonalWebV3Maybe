import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Tag,
  Lightbulb,
  Briefcase,
  MessageSquare,
  ArrowLeft,
  PenLine,
  Coffee,
  LogOut,
  Menu,
} from "lucide-react";
import { GoogleDriveStatus } from "@/components/GoogleDriveStatus";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { GoogleDriveAuthProvider } from "@/contexts/GoogleDriveAuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { toast } from "sonner";

const links = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/projects", icon: FolderKanban, label: "Projects" },
  { to: "/admin/categories", icon: Tag, label: "Categories" },
  { to: "/admin/skills", icon: Lightbulb, label: "Skills" },
  { to: "/admin/experience", icon: Briefcase, label: "Experience" },
  { to: "/admin/writing", icon: PenLine, label: "Writing" },
  { to: "/admin/hobby", icon: Coffee, label: "Hobi & Galeri" },
  { to: "/admin/messages", icon: MessageSquare, label: "Messages" },
];

function SidebarContent() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Berhasil logout.");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Gagal logout. Coba lagi.");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between gap-2 border-b border-border px-4">
        <span className="font-display text-sm font-bold text-primary">Admin Panel</span>
        <ThemeToggle className="h-8 w-8" />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Menu admin">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`
            }
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <GoogleDriveStatus />
      </div>
      <div className="space-y-1 border-t border-border p-3">
        {currentUser?.email && (
          <p className="truncate px-3 pb-1 text-xs text-muted-foreground" title={currentUser.email}>
            {currentUser.email}
          </p>
        )}
        <NavLink
          to="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Situs
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  useDocumentTitle("Admin");
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <GoogleDriveAuthProvider>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar desktop */}
        <aside className="sticky top-0 hidden h-screen w-60 flex-shrink-0 border-r border-border bg-card md:block">
          <SidebarContent />
        </aside>

        {/* Sidebar mobile (drawer) */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-64 bg-card p-0">
            <SheetTitle className="sr-only">Menu admin</SheetTitle>
            <SidebarContent />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md md:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu admin"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-display text-sm font-bold text-primary">Admin Panel</span>
          </header>
          <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </GoogleDriveAuthProvider>
  );
}
