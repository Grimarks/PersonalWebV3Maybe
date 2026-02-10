import { useState } from "react";
import { usePortfolio, Experience } from "@/data/portfolio-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

const emptyExp: { type: Experience["type"]; title: string; organization: string; location: string; startDate: string; endDate: string; description: string; current: boolean } = { type: "work", title: "", organization: "", location: "", startDate: "", endDate: "", description: "", current: false };

export default function AdminExperience() {
  const { experiences, setExperiences } = usePortfolio();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [form, setForm] = useState(emptyExp);

  const openNew = () => { setEditing(null); setForm(emptyExp); setOpen(true); };
  const openEdit = (e: Experience) => { setEditing(e); setForm({ ...e, endDate: e.endDate || "" }); setOpen(true); };

  const save = () => {
    if (!form.title) return;
    if (editing) {
      setExperiences((prev) => prev.map((e) => (e.id === editing.id ? { ...editing, ...form } : e)));
      toast({ title: "Experience updated" });
    } else {
      setExperiences((prev) => [...prev, { ...form, id: Date.now().toString() } as Experience]);
      toast({ title: "Experience created" });
    }
    setOpen(false);
  };

  const remove = (id: string) => { setExperiences((prev) => prev.filter((e) => e.id !== id)); toast({ title: "Deleted" }); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Experience & Education</h1>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Entry</Button>
      </div>
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Organization</TableHead><TableHead>Type</TableHead><TableHead className="w-24">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {experiences.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{e.title}</TableCell>
                <TableCell>{e.organization}</TableCell>
                <TableCell className="capitalize">{e.type}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Entry</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "work" | "education" })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="work">Work</option><option value="education">Education</option>
              </select>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Title</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="text-sm font-medium mb-1 block">Organization</label><Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} /></div>
            <div><label className="text-sm font-medium mb-1 block">Location</label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Start Date</label><Input type="month" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1 block">End Date</label><Input type="month" value={form.endDate || ""} onChange={(e) => setForm({ ...form, endDate: e.target.value })} disabled={form.current} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.current} onCheckedChange={(v) => setForm({ ...form, current: v })} /><label className="text-sm">Currently here</label></div>
            <div><label className="text-sm font-medium mb-1 block">Description</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
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
