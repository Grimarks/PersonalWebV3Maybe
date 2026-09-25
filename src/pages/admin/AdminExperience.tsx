import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Experience } from "@/data/types";
import { formatMonthYear, toTime } from "@/lib/date";

const emptyForm = {
  type: "work" as Experience["type"],
  title: "",
  organization: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
  current: false,
};

export default function AdminExperience() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const expCollection = collection(db, "experiences");

  const fetchExp = async () => {
    setLoading(true);
    try {
      const data = await getDocs(expCollection);
      const list = data.docs.map((d) => ({ ...d.data(), id: d.id })) as Experience[];
      list.sort((a, b) => Number(!!b.current) - Number(!!a.current) || toTime(b.startDate) - toTime(a.startDate));
      setExperiences(list);
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: "Gagal mengambil data experience." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!form.title.trim() || !form.organization.trim()) {
      toast({ variant: "destructive", title: "Belum lengkap", description: "Title dan organization wajib diisi." });
      return;
    }
    if (!form.startDate) {
      toast({ variant: "destructive", title: "Belum lengkap", description: "Tanggal mulai wajib diisi." });
      return;
    }
    if (!form.current && form.endDate && form.endDate < form.startDate) {
      toast({ variant: "destructive", title: "Tanggal tidak valid", description: "Tanggal selesai tidak boleh sebelum tanggal mulai." });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        organization: form.organization.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        // Kalau masih berjalan, end date dikosongkan supaya tidak menyimpan data basi.
        endDate: form.current ? "" : form.endDate,
      };

      if (isEditing && currentId) {
        await updateDoc(doc(db, "experiences", currentId), payload);
        toast({ title: "Diperbarui", description: "Experience berhasil diperbarui." });
      } else {
        await addDoc(expCollection, payload);
        toast({ title: "Ditambahkan", description: "Experience berhasil ditambahkan." });
      }

      setOpen(false);
      fetchExp();
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Terjadi kesalahan saat menyimpan data." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data ini?")) return;
    try {
      await deleteDoc(doc(db, "experiences", id));
      toast({ title: "Terhapus", description: "Experience berhasil dihapus." });
      fetchExp();
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Gagal menghapus data." });
    }
  };

  const openEdit = (item: Experience) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setForm({
      type: item.type,
      title: item.title || "",
      organization: item.organization || "",
      location: item.location || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      description: item.description || "",
      current: !!item.current,
    });
    setOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Experience & Education</h1>
        <Button
          className="self-start sm:self-auto"
          onClick={() => {
            setIsEditing(false);
            setCurrentId(null);
            setForm(emptyForm);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Baru
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
                <TableHead>Title</TableHead>
                <TableHead>Org</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiences.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    Belum ada data experience.
                  </TableCell>
                </TableRow>
              )}
              {experiences.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-muted-foreground">{item.organization}</TableCell>
                  <TableCell className="uppercase text-xs text-muted-foreground">{item.type}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatMonthYear(item.startDate) || "—"} – {item.current ? "Sekarang" : formatMonthYear(item.endDate) || "—"}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)} aria-label={`Edit ${item.title}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} aria-label={`Hapus ${item.title}`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={(v) => !saving && setOpen(v)}>
        <DialogContent className="max-w-lg max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit" : "Add"} Experience</DialogTitle>
            <DialogDescription>Pekerjaan, pendidikan, atau organisasi.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="exp-type" className="text-xs text-muted-foreground font-bold uppercase">Type</label>
                <select
                  id="exp-type"
                  className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as Experience["type"] })}
                >
                  <option value="work">Work</option>
                  <option value="education">Education</option>
                  <option value="organization">Organization</option>
                </select>
              </div>
              <div>
                <label htmlFor="exp-org" className="text-xs text-muted-foreground font-bold uppercase">Organization *</label>
                <Input id="exp-org" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder="Company / Univ / Komunitas" />
              </div>
            </div>

            <div>
              <label htmlFor="exp-title" className="text-xs text-muted-foreground font-bold uppercase">Title / Role *</label>
              <Input id="exp-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Software Engineer" />
            </div>

            <div>
              <label htmlFor="exp-location" className="text-xs text-muted-foreground font-bold uppercase">Lokasi (opsional)</label>
              <Input id="exp-location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Jakarta, Indonesia" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="exp-start" className="text-xs text-muted-foreground font-bold uppercase">Start Date *</label>
                <Input id="exp-start" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label htmlFor="exp-end" className="text-xs text-muted-foreground font-bold uppercase">End Date</label>
                <Input
                  id="exp-end"
                  type="date"
                  value={form.current ? "" : form.endDate}
                  min={form.startDate || undefined}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  disabled={form.current}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch id="exp-current" checked={form.current} onCheckedChange={(v) => setForm({ ...form, current: v })} />
              <label htmlFor="exp-current" className="text-sm text-muted-foreground cursor-pointer">Sedang berjalan / masih aktif</label>
            </div>

            <div>
              <label htmlFor="exp-desc" className="text-xs text-muted-foreground font-bold uppercase">Deskripsi</label>
              <Textarea
                id="exp-desc"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Deskripsi singkat..."
              />
            </div>

            <Button onClick={handleSave} className="w-full" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
