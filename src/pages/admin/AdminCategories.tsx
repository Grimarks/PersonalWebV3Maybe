import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Loader2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
}

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
      setCategories(data.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Category[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      // Buat slug otomatis dari nama (misal: "Web App" -> "web-app")
      const slug = newCategory.toLowerCase().replace(/\s+/g, "-");

      await addDoc(categoriesCollection, {
        name: newCategory,
        slug: slug
      });

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
        {/* Form Tambah Kategori */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Plus className="w-5 h-5" /> Add New Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="flex gap-2">
                <Input
                    placeholder="Category Name (e.g. Mobile Apps)"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                />
                <Button type="submit">Add</Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2">
                Slug akan digenerate otomatis. Contoh: "Machine Learning" menjadi "machine-learning".
              </p>
            </CardContent>
          </Card>
        </div>

        {/* List Kategori */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" /> Existing Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                  <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div>
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
                            <TableCell colSpan={3} className="text-center text-muted-foreground">Belum ada kategori.</TableCell>
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
      </div>
  );
}