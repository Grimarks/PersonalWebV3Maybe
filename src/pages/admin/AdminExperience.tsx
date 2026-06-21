import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Experience } from "@/data/types";

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
  const { toast } = useToast();

  const expCollection = collection(db, "experiences");

  const fetchExp = async () => {
    setLoading(true);
    try {
      const data = await getDocs(expCollection);
      setExperiences(data.docs.map((d) => ({ ...d.data(), id: d.id })) as Experience[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExp();
  }, []);

  const handleSave = async () => {
    if (!form.title || !form.organization) return;

    try {
      const payload = { ...form };

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
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus data ini?")) {
      await deleteDoc(doc(db, "experiences", id));
      fetchExp();
    }
  };

  const openEdit = (item: Experience) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setForm({
      type: item.type,
      title: item.title,
      organization: item.organization,
      location: item.location || "",
      startDate: item.startDate,
      endDate: item.endDate || "",
      description: item.description,
      current: item.current,
    });
    setOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Experience & Education</h1>
        <Button
          onClick={() => {
            setIsEditing(false);
            setForm(emptyForm);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Baru
        </Button>
      </div>

      <div className="soft-card">
        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Org</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiences.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-muted-foreground">{item.organization}</TableCell>
                  <TableCell className="uppercase text-xs text-muted-foreground">{item.type}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit" : "Add"} Experience</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground font-bold uppercase">Type</label>
                <select
                  className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as Experience["type"] })}
                >
                  <option value="work">Work</option>
                  <option value="education">Education</option>
                  <option value="organization">Organization</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-bold uppercase">Organization</label>
                <Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder="Company / Univ / Komunitas" />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-bold uppercase">Title / Role</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Software Engineer" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-bold uppercase">Lokasi (opsional)</label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Jakarta, Indonesia" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground font-bold uppercase">Start Date</label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-bold uppercase">End Date</label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} disabled={form.current} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.current} onCheckedChange={(v) => setForm({ ...form, current: v })} />
              <label className="text-sm text-muted-foreground">Sedang berjalan / masih aktif</label>
            </div>

            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi singkat..." />

            <Button onClick={handleSave} className="w-full">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
