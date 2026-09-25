import { useState } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useDocumentTitle } from "@/hooks/use-document-title";

// Batas panjang field — harus sama dengan validasi di Firestore Rules (SETUP_GUIDE.md bagian 6).
const LIMITS = { name: 100, email: 200, subject: 150, message: 5000 };

export default function Contact() {
  useDocumentTitle("Contact");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "messages"), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
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
      <div className="container-custom pt-10 pb-16 md:pt-14 flex items-center justify-center">
        <div className="w-full max-w-2xl soft-card p-6 sm:p-8 md:p-10">
          <div className="text-center space-y-2 mb-8">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Hubungi Saya</h1>
            <p className="text-muted-foreground">
              Punya pertanyaan atau ide kolaborasi? Kirim pesan saja!
            </p>
            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> Palembang, Indonesia · Bahasa Indonesia & English
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="contact-name" className="text-sm font-medium text-foreground">Nama</label>
                <Input
                  id="contact-name"
                  name="name"
                  placeholder="Nama kamu"
                  autoComplete="name"
                  maxLength={LIMITS.name}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="contact-email" className="text-sm font-medium text-foreground">Email</label>
                <Input
                  id="contact-email"
                  name="email"
                  autoComplete="email"
                  maxLength={LIMITS.email}
                  type="email"
                  placeholder="email@contoh.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="contact-subject" className="text-sm font-medium text-foreground">Subjek</label>
              <Input
                id="contact-subject"
                name="subject"
                maxLength={LIMITS.subject}
                placeholder="Soal apa nih?"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <label htmlFor="contact-message" className="text-sm font-medium text-foreground">Pesan</label>
                <span className="text-xs text-muted-foreground">
                  {formData.message.length}/{LIMITS.message}
                </span>
              </div>
              <Textarea
                id="contact-message"
                name="message"
                maxLength={LIMITS.message}
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
