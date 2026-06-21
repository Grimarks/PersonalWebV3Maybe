import { useState } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Contact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "messages"), {
        ...formData,
        createdAt: new Date().toISOString(),
        read: false,
      });

      toast({
        title: "Pesan terkirim!",
        description: "Terima kasih sudah menghubungi. Saya akan membalas secepatnya.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal mengirim",
        description: "Terjadi kesalahan. Silakan coba lagi nanti.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <PublicLayout>
      <div className="container-custom py-10 flex items-center justify-center">
        <div className="w-full max-w-2xl soft-card p-8 md:p-10">
          <div className="text-center space-y-2 mb-8">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Hubungi Saya</h1>
            <p className="text-muted-foreground">
              Punya pertanyaan atau ide kolaborasi? Kirim pesan saja!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nama</label>
                <Input name="name" placeholder="Nama kamu" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="email@contoh.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Subjek</label>
              <Input
                name="subject"
                placeholder="Soal apa nih?"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Pesan</label>
              <Textarea
                name="message"
                placeholder="Ceritakan lebih lanjut..."
                rows={6}
                className="resize-none"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" className="w-full text-base h-12" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {loading ? "Mengirim..." : "Kirim Pesan"}
            </Button>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
}
