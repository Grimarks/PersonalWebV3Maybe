import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { GoogleDriveAuthProvider } from "@/contexts/GoogleDriveAuthContext";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Skills from "./pages/Skills";
import ExperiencePage from "./pages/ExperiencePage";
import Writing from "./pages/Writing";
import WritingDetail from "./pages/WritingDetail";
import Contact from "./pages/Contact";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminSkills from "./pages/admin/AdminSkills";
import AdminExperience from "./pages/admin/AdminExperience";
import AdminWriting from "./pages/admin/AdminWriting";
import AdminHobby from "./pages/admin/AdminHobby";
import AdminMessages from "./pages/admin/AdminMessages";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <GoogleDriveAuthProvider>
        <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/experience" element={<ExperiencePage />} />
              <Route path="/writing" element={<Writing />} />
              <Route path="/writing/:id" element={<WritingDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="skills" element={<AdminSkills />} />
                <Route path="experience" element={<AdminExperience />} />
                <Route path="writing" element={<AdminWriting />} />
                <Route path="hobby" element={<AdminHobby />} />
                <Route path="messages" element={<AdminMessages />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </AuthProvider>
      </GoogleDriveAuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
