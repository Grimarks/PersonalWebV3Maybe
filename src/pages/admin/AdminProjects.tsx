import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

// Interface sesuai struktur database
export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  techStack: string[];
  category: string;
  image: string;
  githubUrl: string;
  liveUrl?: string;
  features: string[];
  featured: boolean;
  createdAt: string;
}

const emptyForm = {
  title: "",
  description: "",
  longDescription: "",
  techStack: "",
  category: "web",
  image: "",
  githubUrl: "",
  liveUrl: "",
  features: "",
  featured: false,
};

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { toast } = useToast();
  const projectsCollection = collection(db, "projects");

  // 1. READ (Ambil Data dari Firebase)
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getDocs(projectsCollection);
      const list = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id
      })) as Project[];
      // Sort by createdAt descending (opsional)
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setProjects(list);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Gagal mengambil data." });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle Form Inputs
  const openNew = () => {
    setIsEditing(false);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (p: Project) => {
    setIsEditing(true);
    setCurrentId(p.id);
    setForm({
      title: p.title,
      description: p.description,
      longDescription: p.longDescription,
      techStack: p.techStack.join(", "),
      category: p.category,
      image: p.image,
      githubUrl: p.githubUrl,
      liveUrl: p.liveUrl || "",
      features: p.features.join(", "),
      featured: p.featured,
    });
    setOpen(true);
  };

  // 2. CREATE & UPDATE (Simpan Data)
  const handleSave = async () => {
    if (!form.title) return;

    // Convert string comma-separated ke array
    const payload = {
      title: form.title,
      description: form.description,
      longDescription: form.longDescription,
      category: form.category,
      image: form.image,
      githubUrl: form.githubUrl,
      liveUrl: form.liveUrl,
      featured: form.featured,
      techStack: form.techStack.split(",").map((s) => s.trim()).filter(Boolean),
      features: form.features.split(",").map((s) => s.trim()).filter(Boolean),
      createdAt: isEditing ? (projects.find(p => p.id === currentId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    try {
      if (isEditing && currentId) {
        const projectDoc = doc(db, "projects", currentId);
        await updateDoc(projectDoc, payload);
        toast({
          title: <span className="text-primary font-semibold">Berhasil Update</span>,
          description: <span className="text-primary font-semibold">Project telah diperbarui</span>
        });
      } else {
        await addDoc(projectsCollection, payload);
        toast({
          title: <span className="text-primary font-semibold">Berhasil Tambah</span>,
          description: <span className="text-primary font-semibold">Project baru ditambahkan</span>
        });
      }
      setOpen(false);
      fetchProjects(); // Refresh data
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Gagal menyimpan data." });
      console.error(error);
    }
  };

  // 3. DELETE (Hapus Data)
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus? Data akan hilang permanen.")) return;
    try {
      const projectDoc = doc(db, "projects", id);
      await deleteDoc(projectDoc);
      toast({
        title: <span className="text-primary font-semibold">Terhapus</span>,
        description:<span className="text-primary">Project berhasil dihapus</span>
      });
      fetchProjects();
    } catch (error) {
      toast({
        variant: "destructive",
        title: <span className="font-semibold">Gagal Hapus</span>,
        description: "Terjadi kesalahan."
      });
    }
  };

  return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl text-primary font-bold">Projects Manager (Firebase)</h1>
          <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Project</Button>
        </div>

        <div className="glass-card overflow-hidden rounded-lg border">
          {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
          ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Belum ada data di Firebase.</TableCell>
                      </TableRow>
                  )}
                  {projects.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-muted-foreground">{p.title}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground uppercase">{p.category}</TableCell>
                        <TableCell className="text-muted-foreground">{p.featured ? "★" : "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-primary">{isEditing ? "Edit" : "New"} Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground font-medium mb-1 block">Title</label>
                  <Input className="text-muted-foreground" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nama Project" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground font-medium mb-1 block">Category</label>
                  <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full h-10 text-muted-foreground rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="web">Web</option>
                    <option value="mobile">Mobile</option>
                    <option value="ai">AI / ML</option>
                    <option value="devops">DevOps</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground font-medium mb-1 block">Short Description</label>
                <Textarea className="text-muted-foreground" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Penjelasan singkat untuk kartu" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground font-medium mb-1 block">Full Description</label>
                <Textarea className="text-muted-foreground" value={form.longDescription} onChange={(e) => setForm({ ...form, longDescription: e.target.value })} rows={4} placeholder="Penjelasan detail halaman" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground font-medium mb-1 block">GitHub URL</label>
                  <Input className="text-muted-foreground" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/..." />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground font-medium mb-1 block">Live URL</label>
                  <Input className="text-muted-foreground" value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} placeholder="https://..." />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground font-medium mb-1 block">Image URL</label>
                <Input className="text-muted-foreground" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Link gambar..." />
              </div>

              <div>
                <label className="text-sm text-muted-foreground font-medium mb-1 block">Tech Stack (pisahkan koma)</label>
                <Input className="text-muted-foreground" value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} placeholder="React, Firebase, Tailwind" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground font-medium mb-1 block">Features (pisahkan koma)</label>
                <Input className="text-muted-foreground" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Login, Dark Mode, Payment" />
              </div>

              <div className="flex items-center gap-2 border p-3 rounded-md">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                <label className="text-sm text-muted-foreground font-medium">Set as Featured Project (Tampil di Home)</label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="destructive" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>{isEditing ? "Update Project" : "Create Project"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
}