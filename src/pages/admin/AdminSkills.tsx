import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
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

  const { toast } = useToast();
  const skillsCollection = collection(db, "skills");

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const data = await getDocs(skillsCollection);
      setSkills(data.docs.map((d) => ({ ...d.data(), id: d.id })) as Skill[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleSave = async () => {
    if (!form.name) return;
    try {
      if (isEditing && currentId) {
        await updateDoc(doc(db, "skills", currentId), form);
        toast({ title: "Skill Diperbarui", description: "Skill telah diperbarui." });
      } else {
        await addDoc(skillsCollection, form);
        toast({ title: "Skill Ditambahkan", description: "Skill baru telah ditambahkan." });
      }
      setOpen(false);
      fetchSkills();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Gagal menyimpan." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus skill ini?")) return;
    try {
      await deleteDoc(doc(db, "skills", id));
      toast({ title: "Terhapus", description: "Skill berhasil dihapus." });
      fetchSkills();
    } catch (error) {
      toast({ variant: "destructive", title: "Error" });
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
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Skills Manager</h1>
        <Button
          onClick={() => {
            setIsEditing(false);
            setForm(emptyForm);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Skill
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
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skills.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.category}</TableCell>
                  <TableCell className="text-muted-foreground">{s.level}%</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit" : "Add"} Skill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">Skill Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
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
              <Slider value={[form.level]} max={100} step={1} onValueChange={(val) => setForm({ ...form, level: val[0] })} />
            </div>
            <Button onClick={handleSave} className="w-full">
              {isEditing ? "Update" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
