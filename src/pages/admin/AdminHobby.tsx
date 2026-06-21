import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Coffee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DriveImage } from "@/components/DriveImage";
import { DriveUploadButton } from "@/components/DriveUploadButton";
import { HOBBY_DRIVE_FOLDER_URL } from "@/lib/gdrive";
import type { HobbyMoment } from "@/data/types";
import { HOBBY_CATEGORIES_SUGGESTIONS } from "@/data/types";

const emptyForm = {
  title: "",
  description: "",
  image: "",
  category: "Kopi",
};

export default function AdminHobby() {
  const [moments, setMoments] = useState<HobbyMoment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const momentsCollection = collection(db, "hobbyMoments");

  const fetchMoments = async () => {
    setLoading(true);
    try {
      const data = await getDocs(momentsCollection);
      const list = data.docs.map((d) => ({ ...d.data(), id: d.id })) as HobbyMoment[];
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setMoments(list);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Gagal mengambil data momen hobi." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoments();
  }, []);

  const openNew = () => {
    setIsEditing(false);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (m: HobbyMoment) => {
    setIsEditing(true);
    setCurrentId(m.id);
    setForm({
      title: m.title,
      description: m.description,
      image: m.image,
      category: m.category,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.image) {
      toast({ variant: "destructive", title: "Belum lengkap", description: "Judul dan foto wajib diisi." });
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      image: form.image,
      category: form.category || "Lainnya",
      createdAt: isEditing
        ? moments.find((m) => m.id === currentId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    };

    try {
      if (isEditing && currentId) {
        await updateDoc(doc(db, "hobbyMoments", currentId), payload);
        toast({ title: "Diperbarui", description: "Momen hobi berhasil diperbarui." });
      } else {
        await addDoc(momentsCollection, payload);
        toast({ title: "Ditambahkan", description: "Momen hobi baru berhasil diunggah." });
      }
      setOpen(false);
      fetchMoments();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Gagal menyimpan momen hobi." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus momen hobi ini?")) return;
    try {
      await deleteDoc(doc(db, "hobbyMoments", id));
      toast({ title: "Terhapus", description: "Momen hobi berhasil dihapus." });
      fetchMoments();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Gagal menghapus." });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Coffee className="h-5 w-5 text-accent" /> Hobi & Galeri Manager
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload momen kecil — kopi yang diseduh, sesi gaming, atau apa pun yang sedang dinikmati.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Unggah Momen
        </Button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : moments.length === 0 ? (
        <div className="soft-card p-10 text-center text-muted-foreground">
          Belum ada momen hobi. Yuk unggah yang pertama!
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {moments.map((m) => (
            <div key={m.id} className="soft-card overflow-hidden group">
              <div className="aspect-video bg-muted overflow-hidden">
                <DriveImage
                  src={m.image}
                  alt={m.title}
                  thumbnail
                  className="w-full h-full object-cover"
                  fallbackClassName="w-full h-full"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-primary uppercase tracking-wide">{m.category}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(m)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(m.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{m.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Momen" : "Unggah Momen Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Judul</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="mis. V60 Ethiopia Yirgacheffe"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Deskripsi</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                placeholder="Ceritakan momennya — kopi apa, gimana cara seduhnya, atau apa yang bikin momen ini berkesan..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Kategori</label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Kopi / Gaming / Tokusatsu / ..."
                list="hobby-category-suggestions"
              />
              <datalist id="hobby-category-suggestions">
                {HOBBY_CATEGORIES_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div className="border border-border rounded-xl p-4 space-y-2 bg-secondary/20">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">Foto</label>
                <a href={HOBBY_DRIVE_FOLDER_URL} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                  Buka folder Drive
                </a>
              </div>
              <DriveUploadButton onUploaded={(link) => setForm((f) => ({ ...f, image: link }))} />
              <div className="flex items-center gap-2 pt-1">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[11px] text-muted-foreground uppercase tracking-wide">atau paste link manual</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <Input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="Paste link share Google Drive di sini..."
              />
              <p className="text-xs text-muted-foreground">
                Foto yang diupload otomatis diatur jadi "Anyone with the link" supaya tampil di web publik.
              </p>
              {form.image && (
                <div className="h-40 w-full rounded-lg overflow-hidden bg-muted mt-2">
                  <DriveImage
                    src={form.image}
                    alt="Preview"
                    thumbnail
                    className="h-full w-full object-cover"
                    fallbackClassName="h-full w-full"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSave}>{isEditing ? "Update Momen" : "Simpan Momen"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
