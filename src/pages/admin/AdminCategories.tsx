import { useState } from "react";
import { usePortfolio, Category } from "@/data/portfolio-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminCategories() {
  const { categories, setCategories } = usePortfolio();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "" });

  const openNew = () => { setEditing(null); setForm({ name: "", slug: "" }); setOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm(c); setOpen(true); };

  const save = () => {
    if (!form.name) return;
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-");
    if (editing) {
      setCategories((prev) => prev.map((c) => (c.id === editing.id ? { ...editing, name: form.name, slug } : c)));
      toast({ title: "Category updated" });
    } else {
      setCategories((prev) => [...prev, { name: form.name, slug, id: Date.now().toString() }]);
      toast({ title: "Category created" });
    }
    setOpen(false);
  };

  const remove = (id: string) => { setCategories((prev) => prev.filter((c) => c.id !== id)); toast({ title: "Category deleted" }); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl text-primary font-bold">Categories</h1>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
      </div>
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead className="w-24">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium text-muted-foreground">{c.name}</TableCell>
                <TableCell className="font-mono text-muted-foreground text-xs">{c.slug}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-primary">{editing ? "Edit" : "New"} Category</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm text-muted-foreground font-medium mb-1 block">Name</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="text-sm text-muted-foreground font-medium mb-1 block">Slug</label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from name" /></div>
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
