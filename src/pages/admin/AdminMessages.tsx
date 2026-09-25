import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, orderBy, query, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Mail, MailOpen, Calendar, Reply } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ContactMessage } from "@/data/types";
import { formatDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMessages = async () => {
    try {
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as ContactMessage[];
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({ variant: "destructive", title: "Error", description: "Gagal mengambil pesan." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleRead = async (msg: ContactMessage) => {
    const read = !msg.read;
    // Optimistic update supaya terasa instan
    setMessages((list) => list.map((m) => (m.id === msg.id ? { ...m, read } : m)));
    try {
      await updateDoc(doc(db, "messages", msg.id), { read });
    } catch (error) {
      console.error(error);
      setMessages((list) => list.map((m) => (m.id === msg.id ? { ...m, read: !read } : m)));
      toast({ variant: "destructive", title: "Error", description: "Gagal memperbarui status pesan." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pesan ini?")) return;
    try {
      await deleteDoc(doc(db, "messages", id));
      setMessages((list) => list.filter((m) => m.id !== id));
      toast({ title: "Pesan Dihapus", description: "Pesan berhasil dihapus dari database." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Gagal menghapus pesan." });
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-foreground">Inbox Messages</h1>
        {!loading && (
          <span className="text-muted-foreground text-sm">
            {messages.length} pesan{unreadCount > 0 && ` · ${unreadCount} belum dibaca`}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-10 soft-card">
          <Mail className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Belum ada pesan masuk.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map((msg) => (
            <Card
              key={msg.id}
              className={cn(
                "relative transition-shadow hover:shadow-md",
                !msg.read ? "border-primary/40 bg-primary/[0.03]" : "border-border"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="space-y-1 min-w-0">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      {!msg.read && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" aria-label="Belum dibaca" />}
                      <span className="break-words">{msg.subject}</span>
                    </CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-x-2">
                      <span className="font-medium text-foreground">{msg.name}</span>
                      <span className="text-muted-foreground break-all">&lt;{msg.email}&gt;</span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 self-end sm:self-auto">
                    <Button asChild variant="ghost" size="icon" title="Balas lewat email">
                      <a
                        href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject}`)}`}
                        aria-label="Balas lewat email"
                      >
                        <Reply className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleRead(msg)}
                      title={msg.read ? "Tandai belum dibaca" : "Tandai sudah dibaca"}
                      aria-label={msg.read ? "Tandai belum dibaca" : "Tandai sudah dibaca"}
                    >
                      {msg.read ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(msg.id)}
                      aria-label="Hapus pesan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-secondary/30 p-4 rounded-lg text-sm whitespace-pre-wrap break-words leading-relaxed mb-3">
                  {msg.message}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDateTime(msg.createdAt) || "Tanggal tidak tersedia"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
