import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, deleteDoc, doc, getCountFromServer, query, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Plus, Loader2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/use-categories";

/** "Machine Learning & AI!" -> "machine-learning-ai" */
function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCategories() {
  const { categories, loading, refresh } = useCategories();
  const [newCategory, setNewCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const slugPreview = toSlug(newCategory);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategory.trim();
    const slug = toSlug(name);
    if (!name || !slug) {
      toast({ variant: "destructive", title: "Nama tidak valid", description: "Isi nama kategori dengan huruf/angka." });
      return;
    }
    if (categories.some((c) => c.slug === slug)) {
      toast({ variant: "destructive", title: "Sudah ada", description: `Kategori dengan slug "${slug}" sudah ada.` });
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "categories"), { name, slug });
      toast({ title: "Kategori Ditambahkan", description: `${name} berhasil disimpan.` });
      setNewCategory("");
      refresh();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Gagal menambah kategori." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, slug: string) => {
    setDeletingId(id);
    try {
      const used = await getCountFromServer(query(collection(db, "projects"), where("category", "==", slug)));
      const count = used.data().count;
      const message =
        count > 0
          ? `Kategori ini masih dipakai oleh ${count} project. Project tersebut tidak akan muncul di filter kategori mana pun sampai kategorinya diganti. Tetap hapus?`
          : "Hapus kategori ini?";
      if (!confirm(message)) return;

      await deleteDoc(doc(db, "categories", id));
      toast({ title: "Terhapus", description: "Kategori berhasil dihapus." });
      refresh();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Gagal menghapus kategori." });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Categories</h1>
        <p className="text-sm text-muted-foreground">Kategori untuk mengelompokkan project di halaman publik.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="w-5 h-5 text-primary" /> Tambah Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="flex gap-2">
              <Input
                aria-label="Nama kategori"
                placeholder="Nama kategori (mis. Mobile Apps)"
                value={newCategory}
                maxLength={60}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Button type="submit" disabled={saving || !slugPreview}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tambah"}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2">
              {slugPreview ? (
                <>
                  Slug: <code className="rounded bg-secondary px-1.5 py-0.5">{slugPreview}</code>
                </>
              ) : (
                'Slug otomatis dibuat. Contoh: "Machine Learning" jadi "machine-learning".'
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Tag className="w-5 h-5 text-primary" /> Kategori Tersimpan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground h-20">
                          Belum ada kategori.
                        </TableCell>
                      </TableRow>
                    )}
                    {categories.map((cat) => (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">{cat.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono">{cat.slug}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(cat.id, cat.slug)}
                            disabled={deletingId === cat.id}
                            aria-label={`Hapus kategori ${cat.name}`}
                          >
                            {deletingId === cat.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-destructive" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
