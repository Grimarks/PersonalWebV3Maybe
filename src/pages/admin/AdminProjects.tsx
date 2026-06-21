import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, ImagePlus, X, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { DriveImage } from "@/components/DriveImage";
import { DriveUploadButton } from "@/components/DriveUploadButton";
import { HOBBY_DRIVE_FOLDER_URL } from "@/lib/gdrive";
import type { Project } from "@/data/types";
import { getEffectiveCoverImage } from "@/data/types";

const emptyForm = {
  title: "",
  description: "",
  longDescription: "",
  techStack: "",
  category: "web",
  coverImage: "",
  gallery: [] as string[],
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
  const [galleryInput, setGalleryInput] = useState("");

  const { toast } = useToast();
  const projectsCollection = collection(db, "projects");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getDocs(projectsCollection);
      const list = data.docs.map((d) => ({ ...d.data(), id: d.id })) as Project[];
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
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

  const openNew = () => {
    setIsEditing(false);
    setForm(emptyForm);
    setGalleryInput("");
    setOpen(true);
  };

  const openEdit = (p: Project) => {
    setIsEditing(true);
    setCurrentId(p.id);
    setForm({
      title: p.title,
      description: p.description,
      longDescription: p.longDescription,
      techStack: (p.techStack || []).join(", "),
      category: p.category,
      coverImage: p.coverImage || "",
      gallery: p.gallery || [],
      githubUrl: p.githubUrl || "",
      liveUrl: p.liveUrl || "",
      features: (p.features || []).join(", "),
      featured: p.featured,
    });
    setGalleryInput("");
    setOpen(true);
  };

  const addGalleryImage = () => {
    if (!galleryInput.trim()) return;
    setForm({ ...form, gallery: [...form.gallery, galleryInput.trim()] });
    setGalleryInput("");
  };

  const removeGalleryImage = (idx: number) => {
    setForm({ ...form, gallery: form.gallery.filter((_, i) => i !== idx) });
  };

  const setAsCover = (img: string) => {
    setForm({ ...form, coverImage: img });
  };

  const handleSave = async () => {
    if (!form.title) return;

    const payload = {
      title: form.title,
      description: form.description,
      longDescription: form.longDescription,
      category: form.category,
      coverImage: form.coverImage,
      gallery: form.gallery,
      githubUrl: form.githubUrl,
      liveUrl: form.liveUrl,
      featured: form.featured,
      techStack: form.techStack.split(",").map((s) => s.trim()).filter(Boolean),
      features: form.features.split(",").map((s) => s.trim()).filter(Boolean),
      createdAt: isEditing
        ? projects.find((p) => p.id === currentId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    };

    try {
      if (isEditing && currentId) {
        await updateDoc(doc(db, "projects", currentId), payload);
        toast({ title: "Berhasil Update", description: "Project telah diperbarui." });
      } else {
        await addDoc(projectsCollection, payload);
        toast({ title: "Berhasil Tambah", description: "Project baru ditambahkan." });
      }
      setOpen(false);
      fetchProjects();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Gagal menyimpan data." });
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus? Data akan hilang permanen.")) return;
    try {
      await deleteDoc(doc(db, "projects", id));
      toast({ title: "Terhapus", description: "Project berhasil dihapus." });
      fetchProjects();
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal Hapus", description: "Terjadi kesalahan." });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects Manager</h1>
          <p className="text-sm text-muted-foreground">Tersimpan langsung ke Firestore.</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Project
        </Button>
      </div>

      <div className="soft-card overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    Belum ada data di Firestore.
                  </TableCell>
                </TableRow>
              )}
              {projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="h-10 w-14 rounded-md overflow-hidden bg-muted">
                      <DriveImage
                        src={getEffectiveCoverImage(p)}
                        alt={p.title}
                        thumbnail
                        thumbnailWidth={200}
                        className="h-full w-full object-cover"
                        fallbackClassName="h-full w-full"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground uppercase">{p.category}</TableCell>
                  <TableCell>{p.featured ? <Star className="h-4 w-4 text-accent fill-accent" /> : "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit" : "New"} Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nama Project" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category (slug)</label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="web / mobile / ai / research" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Short Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Penjelasan singkat untuk kartu" />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Full Description</label>
              <Textarea value={form.longDescription} onChange={(e) => setForm({ ...form, longDescription: e.target.value })} rows={4} placeholder="Penjelasan detail halaman" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">GitHub URL</label>
                <Input value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Live URL</label>
                <Input value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} placeholder="https://..." />
              </div>
            </div>

            {/* Galeri Foto Google Drive */}
            <div className="border border-border rounded-xl p-4 space-y-3 bg-secondary/20">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <ImagePlus className="h-4 w-4" /> Foto Project
                </label>
                <a
                  href={HOBBY_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Buka folder Drive
                </a>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload foto langsung dari device kamu — otomatis tersimpan ke folder Google Drive dan link-nya
                masuk ke sini. Foto yang ditandai bintang akan jadi foto utama/sampul.
              </p>

              <DriveUploadButton onUploaded={(link) => setForm((f) => ({ ...f, gallery: [...f.gallery, link] }))} />

              <div className="flex items-center gap-2 pt-1">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[11px] text-muted-foreground uppercase tracking-wide">atau paste link manual</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="flex gap-2">
                <Input
                  value={galleryInput}
                  onChange={(e) => setGalleryInput(e.target.value)}
                  placeholder="Paste link share Google Drive di sini..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addGalleryImage();
                    }
                  }}
                />
                <Button type="button" onClick={addGalleryImage} variant="secondary">
                  Tambah
                </Button>
              </div>

              {form.gallery.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                  {form.gallery.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                        <DriveImage
                          src={img}
                          alt={`Foto ${idx + 1}`}
                          thumbnail
                          thumbnailWidth={300}
                          className="w-full h-full object-cover"
                          fallbackClassName="w-full h-full"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setAsCover(img)}
                        title="Jadikan foto utama"
                        className={`absolute top-1 left-1 h-6 w-6 flex items-center justify-center rounded-full text-xs ${
                          form.coverImage === img
                            ? "bg-accent text-accent-foreground"
                            : "bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100"
                        } transition-opacity`}
                      >
                        <Star className={`h-3.5 w-3.5 ${form.coverImage === img ? "fill-current" : ""}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        title="Hapus foto"
                        className="absolute top-1 right-1 h-6 w-6 flex items-center justify-center rounded-full bg-background/80 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {form.coverImage && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star className="h-3 w-3 fill-accent text-accent" /> Foto utama sudah dipilih.
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Tech Stack (pisahkan koma)</label>
              <Input value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} placeholder="React, Firebase, Tailwind" />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Features (pisahkan koma)</label>
              <Input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Login, Dark Mode, Payment" />
            </div>

            <div className="flex items-center gap-2 border border-border p-3 rounded-lg">
              <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
              <label className="text-sm font-medium">Jadikan Featured Project (tampil di Home)</label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>{isEditing ? "Update Project" : "Create Project"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
