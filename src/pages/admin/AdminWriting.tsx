import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, PenLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DriveImage } from "@/components/DriveImage";
import { DriveUploadButton } from "@/components/DriveUploadButton";
import { HOBBY_DRIVE_FOLDER_URL } from "@/lib/gdrive";
import type { Writing } from "@/data/types";
import { formatLongDate, sortByDateDesc } from "@/lib/date";

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  tags: "",
  published: true,
};

/** Ringkasan otomatis: potong di batas kata supaya tidak terputus di tengah kata. */
function makeExcerpt(content: string, max = 160) {
  const text = content.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const cut = text.lastIndexOf(" ", max);
  return `${text.slice(0, cut > 0 ? cut : max)}…`;
}

export default function AdminWriting() {
  const [writings, setWritings] = useState<Writing[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const writingsCollection = collection(db, "writings");

  const fetchWritings = async () => {
    setLoading(true);
    try {
      const data = await getDocs(writingsCollection);
      const list = data.docs.map((d) => ({ ...d.data(), id: d.id })) as Writing[];
      setWritings(sortByDateDesc(list, (w) => w.createdAt));
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Gagal mengambil data tulisan." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWritings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => {
    setIsEditing(false);
    setCurrentId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (w: Writing) => {
    setIsEditing(true);
    setCurrentId(w.id);
    setForm({
      title: w.title || "",
      excerpt: w.excerpt || "",
      content: w.content || "",
      coverImage: w.coverImage || "",
      tags: (w.tags || []).join(", "),
      published: w.published !== false,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ variant: "destructive", title: "Belum lengkap", description: "Judul dan isi tulisan wajib diisi." });
      return;
    }

    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim() || makeExcerpt(form.content),
      content: form.content.trim(),
      coverImage: form.coverImage.trim(),
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      published: form.published,
      createdAt: isEditing
        ? writings.find((w) => w.id === currentId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    };

    setSaving(true);
    try {
      if (isEditing && currentId) {
        await updateDoc(doc(db, "writings", currentId), payload);
        toast({ title: "Tulisan Diperbarui", description: "Perubahan berhasil disimpan." });
      } else {
        await addDoc(writingsCollection, payload);
        toast({
          title: form.published ? "Tulisan Diterbitkan" : "Draft Disimpan",
          description: form.published ? "Tulisan baru sudah tampil di publik." : "Draft belum tampil di publik.",
        });
      }
      setOpen(false);
      fetchWritings();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Gagal menyimpan tulisan." });
    } finally {
      setSaving(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <PenLine className="h-5 w-5 text-primary" /> Writing Manager
          </h1>
          <p className="text-sm text-muted-foreground">Tulis, simpan sebagai draft, atau langsung publikasikan.</p>
        </div>
        <Button onClick={openNew} className="self-start sm:self-auto">
          <Plus className="mr-2 h-4 w-4" /> Tulis Baru
        </Button>
      </div>

      <div className="soft-card overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {writings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
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
                  <TableCell className="font-medium min-w-[160px]">{w.title}</TableCell>
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
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatLongDate(w.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(w)} aria-label={`Edit ${w.title}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(w.id)} aria-label={`Hapus ${w.title}`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={(v) => !saving && setOpen(v)}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Tulisan" : "Tulisan Baru"}</DialogTitle>
            <DialogDescription>Tulisan published tampil di halaman Writing & Hobi.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label htmlFor="writing-title" className="text-sm font-medium mb-1 block">Judul *</label>
              <Input id="writing-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Judul tulisan" />
            </div>

            <div>
              <label htmlFor="writing-excerpt" className="text-sm font-medium mb-1 block">Ringkasan (excerpt)</label>
              <Textarea
                id="writing-excerpt"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={2}
                placeholder="Ringkasan singkat yang muncul di daftar tulisan (opsional, otomatis diambil dari isi kalau dikosongkan)"
              />
            </div>

            <div>
              <label htmlFor="writing-content" className="text-sm font-medium mb-1 block">Isi Tulisan *</label>
              <Textarea
                id="writing-content"
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
                aria-label="Link cover Google Drive"
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
              <label htmlFor="writing-tags" className="text-sm font-medium mb-1 block">Tags (pisahkan koma)</label>
              <Input id="writing-tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="refleksi, kuliah, teknologi" />
            </div>

            <div className="flex items-center gap-2 border border-border p-3 rounded-lg">
              <Switch id="writing-published" checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
              <label htmlFor="writing-published" className="text-sm font-medium cursor-pointer">
                {form.published ? "Publikasikan sekarang" : "Simpan sebagai draft (belum tampil di publik)"}
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Batal
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Tulisan" : "Simpan Tulisan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
