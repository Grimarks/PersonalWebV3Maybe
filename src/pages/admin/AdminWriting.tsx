import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, PenLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DriveImage } from "@/components/DriveImage";
import { DriveUploadButton } from "@/components/DriveUploadButton";
import { HOBBY_DRIVE_FOLDER_URL } from "@/lib/gdrive";
import type { Writing } from "@/data/types";

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  tags: "",
  published: true,
};

export default function AdminWriting() {
  const [writings, setWritings] = useState<Writing[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const writingsCollection = collection(db, "writings");

  const fetchWritings = async () => {
    setLoading(true);
    try {
      const data = await getDocs(writingsCollection);
      const list = data.docs.map((d) => ({ ...d.data(), id: d.id })) as Writing[];
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setWritings(list);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Gagal mengambil data tulisan." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWritings();
  }, []);

  const openNew = () => {
    setIsEditing(false);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (w: Writing) => {
    setIsEditing(true);
    setCurrentId(w.id);
    setForm({
      title: w.title,
      excerpt: w.excerpt,
      content: w.content,
      coverImage: w.coverImage || "",
      tags: (w.tags || []).join(", "),
      published: w.published !== false,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.content) {
      toast({ variant: "destructive", title: "Belum lengkap", description: "Judul dan isi tulisan wajib diisi." });
      return;
    }

    const payload = {
      title: form.title,
      excerpt: form.excerpt || form.content.slice(0, 140),
      content: form.content,
      coverImage: form.coverImage,
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      published: form.published,
      createdAt: isEditing
        ? writings.find((w) => w.id === currentId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    };

    try {
      if (isEditing && currentId) {
        await updateDoc(doc(db, "writings", currentId), payload);
        toast({ title: "Tulisan Diperbarui", description: "Perubahan berhasil disimpan." });
      } else {
        await addDoc(writingsCollection, payload);
        toast({ title: "Tulisan Diterbitkan", description: "Tulisan baru berhasil ditambahkan." });
      }
      setOpen(false);
      fetchWritings();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Gagal menyimpan tulisan." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus tulisan ini secara permanen?")) return;
    try {
      await deleteDoc(doc(db, "writings", id));
      toast({ title: "Terhapus", description: "Tulisan berhasil dihapus." });
      fetchWritings();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Gagal menghapus." });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <PenLine className="h-5 w-5 text-primary" /> Writing Manager
          </h1>
          <p className="text-sm text-muted-foreground">Tulis, simpan sebagai draft, atau langsung publikasikan.</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Tulis Baru
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
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {writings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                    Belum ada tulisan. Mulai menulis yuk!
                  </TableCell>
                </TableRow>
              )}
              {writings.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>
                    <div className="h-10 w-14 rounded-md overflow-hidden bg-muted">
                      <DriveImage
                        src={w.coverImage}
                        alt={w.title}
                        thumbnail
                        thumbnailWidth={200}
                        className="h-full w-full object-cover"
                        fallbackClassName="h-full w-full"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{w.title}</TableCell>
                  <TableCell>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        w.published !== false
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {w.published !== false ? "Published" : "Draft"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(w)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(w.id)}>
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
            <DialogTitle>{isEditing ? "Edit" : "Tulisan Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Judul</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Judul tulisan" />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Ringkasan (excerpt)</label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={2}
                placeholder="Ringkasan singkat yang muncul di daftar tulisan (opsional, otomatis diambil dari isi kalau dikosongkan)"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Isi Tulisan</label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={10}
                placeholder="Tulis di sini... Pisahkan paragraf dengan baris baru."
              />
            </div>

            <div className="border border-border rounded-xl p-4 space-y-2 bg-secondary/20">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">Cover Image (opsional)</label>
                <a href={HOBBY_DRIVE_FOLDER_URL} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                  Buka folder Drive
                </a>
              </div>
              <DriveUploadButton onUploaded={(link) => setForm((f) => ({ ...f, coverImage: link }))} />
              <div className="flex items-center gap-2 pt-1">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[11px] text-muted-foreground uppercase tracking-wide">atau paste link manual</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <Input
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                placeholder="Paste link share Google Drive di sini..."
              />
              {form.coverImage && (
                <div className="h-32 w-full rounded-lg overflow-hidden bg-muted mt-2">
                  <DriveImage
                    src={form.coverImage}
                    alt="Preview"
                    thumbnail
                    className="h-full w-full object-cover"
                    fallbackClassName="h-full w-full"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Tags (pisahkan koma)</label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="refleksi, kuliah, teknologi" />
            </div>

            <div className="flex items-center gap-2 border border-border p-3 rounded-lg">
              <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
              <label className="text-sm font-medium">
                {form.published ? "Publikasikan sekarang" : "Simpan sebagai draft (belum tampil di publik)"}
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSave}>{isEditing ? "Update Tulisan" : "Simpan Tulisan"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
