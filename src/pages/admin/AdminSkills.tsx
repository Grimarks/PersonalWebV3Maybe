// FILE: src/pages/admin/AdminSkills.tsx
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

interface Skill {
  id: string;
  name: string;
  category: "Frontend" | "Backend" | "Tools" | "Other";
  level: number; // 0-100
}

const emptyForm = {
  name: "",
  category: "Frontend",
  level: 50,
};

export default function AdminSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { toast } = useToast();
  const skillsCollection = collection(db, "skills");

  // 1. READ
  const fetchSkills = async () => {
    setLoading(true);
    try {
      const data = await getDocs(skillsCollection);
      setSkills(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Skill[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSkills(); }, []);

  // 2. CREATE & UPDATE
  const handleSave = async () => {
    if (!form.name) return;
    try {
      if (isEditing && currentId) {
        await updateDoc(doc(db, "skills", currentId), form);
        toast({
          title: <span className="text-primary font-semibold">Skill Updated</span>,
          description: <span className="text-primary font-semibold">Skill telah diperbarui</span>
        });
      } else {
        await addDoc(skillsCollection, form);
        toast({
          title: <span className="text-primary font-semibold">Skill Added</span>,
          description: <span className="text-primary font-semibold">Skill telah ditambahkan</span>
        });
      }
      setOpen(false);
      fetchSkills();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Gagal menyimpan." });
    }
  };

  // 3. DELETE
  const handleDelete = async (id: string) => {
    if (!confirm("Hapus skill ini?")) return;
    try {
      await deleteDoc(doc(db, "skills", id));
      toast({
        title: <span className="text-primary font-semibold">Skill Deleted</span>,
        description: <span className="text-primary"> Skill berhasil dihapus </span>
      });
      fetchSkills();
    } catch (error) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const openEdit = (s: Skill) => {
    setIsEditing(true);
    setCurrentId(s.id);
    setForm({ name: s.name, category: s.category as any, level: s.level });
    setOpen(true);
  };

  return (
      <div>
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl text-primary font-bold">Skills Manager</h1>
          <Button onClick={() => { setIsEditing(false); setForm(emptyForm); setOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Skill
          </Button>
        </div>

        <div className="glass-card border rounded-lg">
          {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div> : (
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
                        <TableCell className="font-medium text-muted-foreground">{s.name}</TableCell>
                        <TableCell className="text-muted-foreground">{s.category}</TableCell>
                        <TableCell className="text-muted-foreground">{s.level}%</TableCell>
                        <TableCell className="text-right text-muted-foreground space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle className="text-primary">{isEditing ? "Edit" : "Add"} Skill</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm text-muted-foreground font-medium">Skill Name</label>
                <Input className="text-muted-foreground" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground font-medium">Category</label>
                <select
                    className="w-full h-10 text-muted-foreground rounded-md border bg-background px-3 text-sm"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Tools">Tools</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground font-medium block mb-2">Proficiency Level: {form.level}%</label>
                <Slider
                    value={[form.level]}
                    max={100}
                    step={1}
                    onValueChange={(val) => setForm({ ...form, level: val[0] })}
                />
              </div>
              <Button onClick={handleSave} className="w-full">{isEditing ? "Update" : "Save"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
}