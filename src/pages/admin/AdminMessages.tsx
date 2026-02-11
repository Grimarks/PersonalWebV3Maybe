import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Mail, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // Query pesan diurutkan dari yang terbaru
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Message[];
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
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pesan ini?")) return;

    try {
      await deleteDoc(doc(db, "messages", id));
      toast({ title: "Pesan Dihapus", description: "Pesan berhasil dihapus dari database." });
      fetchMessages(); // Refresh list
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Gagal menghapus pesan." });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Inbox Messages</h1>
          <span className="text-muted-foreground text-sm">{messages.length} messages</span>
        </div>

        {messages.length === 0 ? (
            <div className="text-center py-10 border rounded-lg bg-muted/20">
              <Mail className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Belum ada pesan masuk.</p>
            </div>
        ) : (
            <div className="grid gap-4">
              {messages.map((msg) => (
                  <Card key={msg.id} className="relative group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-lg font-semibold">{msg.subject}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{msg.name}</span>
                            <span className="text-muted-foreground">&lt;{msg.email}&gt;</span>
                          </CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive opacity-70 hover:opacity-100 hover:bg-destructive/10"
                            onClick={() => handleDelete(msg.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/30 p-4 rounded-md text-sm whitespace-pre-wrap leading-relaxed mb-3">
                        {msg.message}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        {msg.createdAt ? format(new Date(msg.createdAt), "PPP p") : "Tanggal tidak tersedia"}
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>
        )}
      </div>
  );
}