import { useState } from "react";
import { usePortfolio, Skill } from "@/data/portfolio-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";

const emptySkill: { name: string; category: Skill["category"]; level: number } = { name: "", category: "Frontend", level: 50 };

export default function AdminSkills() {
  const { skills, setSkills } = usePortfolio();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState(emptySkill);

  const openNew = () => { setEditing(null); setForm(emptySkill); setOpen(true); };
  const openEdit = (s: Skill) => { setEditing(s); setForm(s); setOpen(true); };

  const save = () => {
    if (!form.name) return;
    if (editing) {
      setSkills((prev) => prev.map((s) => (s.id === editing.id ? { ...editing, ...form } : s)));
      toast({ title: "Skill updated" });
    } else {
      setSkills((prev) => [...prev, { ...form, id: Date.now().toString() } as Skill]);
      toast({ title: "Skill created" });
    }
    setOpen(false);
  };

  const remove = (id: string) => { setSkills((prev) => prev.filter((s) => s.id !== id)); toast({ title: "Skill deleted" }); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl text-primary font-bold">Skills</h1>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Skill</Button>
      </div>
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Level</TableHead><TableHead className="w-24">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {skills.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium text-muted-foreground">{s.name}</TableCell>
                <TableCell className="text-muted-foreground">{s.category}</TableCell>
                <TableCell className="font-mono text-muted-foreground text-xs">{s.level}%</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-primary">{editing ? "Edit" : "New"} Skill</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm text-muted-foreground font-medium mb-1 block">Name</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div>
              <label className="text-sm text-muted-foreground font-medium mb-1 block">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Skill["category"] })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="Frontend">Frontend</option><option value="Backend">Backend</option><option value="Tools">Tools</option><option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-medium mb-1 block">Level: {form.level}%</label>
              <Slider value={[form.level]} onValueChange={([v]) => setForm({ ...form, level: v })} min={0} max={100} step={5} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="destructive" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
