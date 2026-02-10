import { useState } from "react";
import { usePortfolio, Project } from "@/data/portfolio-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

const empty: Omit<Project, "id" | "createdAt"> = {
  title: "", description: "", longDescription: "", techStack: [], category: "web",
  image: "", githubUrl: "", liveUrl: "", features: [], featured: false,
};

export default function AdminProjects() {
  const { projects, setProjects, categories } = usePortfolio();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(empty);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: Project) => { setEditing(p); setForm(p); setOpen(true); };

  const save = () => {
    if (!form.title) return;
    if (editing) {
      setProjects((prev) => prev.map((p) => (p.id === editing.id ? { ...editing, ...form } : p)));
      toast({ title: "Project updated" });
    } else {
      setProjects((prev) => [...prev, { ...form, id: Date.now().toString(), createdAt: new Date().toISOString() } as Project]);
      toast({ title: "Project created" });
    }
    setOpen(false);
  };

  const remove = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Project deleted" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Project</Button>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell className="font-mono text-xs">{p.category}</TableCell>
                <TableCell>{p.featured ? "★" : "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Project</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Title</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Short Description</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            <div><label className="text-sm font-medium mb-1 block">Full Description</label><Textarea value={form.longDescription} onChange={(e) => setForm({ ...form, longDescription: e.target.value })} rows={4} /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">GitHub URL</label><Input value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1 block">Live URL</label><Input value={form.liveUrl || ""} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} /></div>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Tech Stack (comma separated)</label><Input value={form.techStack.join(", ")} onChange={(e) => setForm({ ...form, techStack: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></div>
            <div><label className="text-sm font-medium mb-1 block">Features (comma separated)</label><Input value={form.features.join(", ")} onChange={(e) => setForm({ ...form, features: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></div>
            <div className="flex items-center gap-2">
              <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
              <label className="text-sm">Featured project</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
