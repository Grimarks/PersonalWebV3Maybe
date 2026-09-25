import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import type { Skill } from "@/data/types";
import { SKILL_CATEGORIES } from "@/data/types";

const emptyForm = { name: "", category: "Frontend" as Skill["category"], level: 50 };

export default function AdminSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const { toast } = useToast();
  const skillsCollection = collection(db, "skills");

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const data = await getDocs(skillsCollection);
      const list = data.docs.map((d) => ({ ...d.data(), id: d.id })) as Skill[];
      list.sort((a, b) => a.category.localeCompare(b.category) || (b.level || 0) - (a.level || 0));
      setSkills(list);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    const name = form.name.trim();
    if (!name) {
      toast({ variant: "destructive", title: "Belum lengkap", description: "Nama skill wajib diisi." });
      return;
    }
    const payload = { ...form, name };
    setSaving(true);
    try {
      if (isEditing && currentId) {
        await updateDoc(doc(db, "skills", currentId), payload);
        toast({ title: "Skill Diperbarui", description: "Skill telah diperbarui." });
      } else {
        await addDoc(skillsCollection, payload);
        toast({ title: "Skill Ditambahkan", description: "Skill baru telah ditambahkan." });
      }
      setOpen(false);
      fetchSkills();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Gagal menyimpan." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus skill ini?")) return;
    try {
      await deleteDoc(doc(db, "skills", id));
      toast({ title: "Terhapus", description: "Skill berhasil dihapus." });
      fetchSkills();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Gagal menghapus skill." });
    }
  };

  const openEdit = (s: Skill) => {
    setIsEditing(true);
    setCurrentId(s.id);
    setForm({ name: s.name, category: s.category, level: s.level });
    setOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Skills Manager</h1>
        <Button
          className="self-start sm:self-auto"
          onClick={() => {
            setIsEditing(false);
            setCurrentId(null);
            setForm(emptyForm);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Skill
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
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skills.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                    Belum ada skill. Tambahkan yang pertama!
                  </TableCell>
                </TableRow>
              )}
              {skills.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.category}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Progress value={s.level} className="h-1.5 w-16" />
                      <span className="tabular-nums">{s.level}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)} aria-label={`Edit ${s.name}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} aria-label={`Hapus ${s.name}`}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit" : "Add"} Skill</DialogTitle>
            <DialogDescription>Skill dikelompokkan per kategori di halaman Skills.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label htmlFor="skill-name" className="text-sm font-medium mb-1 block">Skill Name</label>
              <Input id="skill-name" maxLength={60} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label htmlFor="skill-category" className="text-sm font-medium mb-1 block">Category</label>
              <select
                id="skill-category"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Skill["category"] })}
              >
                {SKILL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Proficiency Level: {form.level}%</label>
              <Slider
                aria-label="Proficiency level"
                value={[form.level]}
                max={100}
                step={5}
                onValueChange={(val) => setForm({ ...form, level: val[0] })}
              />
            </div>
            <Button onClick={handleSave} className="w-full" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
