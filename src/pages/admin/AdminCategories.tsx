import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Loader2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@/data/types";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const categoriesCollection = collection(db, "categories");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getDocs(categoriesCollection);
      setCategories(data.docs.map((d) => ({ ...d.data(), id: d.id })) as Category[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const slug = newCategory.toLowerCase().trim().replace(/\s+/g, "-");
      await addDoc(categoriesCollection, { name: newCategory, slug });
      toast({ title: "Kategori Ditambahkan", description: `${newCategory} berhasil disimpan.` });
      setNewCategory("");
      fetchCategories();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Gagal menambah kategori." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kategori ini?")) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      toast({ title: "Terhapus", description: "Kategori berhasil dihapus." });
      fetchCategories();
    } catch (error) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Tambah Kategori
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              placeholder="Nama kategori (mis. Mobile Apps)"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <Button type="submit">Add</Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            Slug otomatis dibuat. Contoh: "Machine Learning" jadi "machine-learning".
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" /> Kategori Tersimpan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
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
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Belum ada kategori.
                    </TableCell>
                  </TableRow>
                )}
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{cat.slug}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
