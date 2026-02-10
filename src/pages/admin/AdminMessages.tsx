import { usePortfolio } from "@/data/portfolio-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminMessages() {
  const { messages, setMessages } = usePortfolio();
  const { toast } = useToast();

  const toggleRead = (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: !m.read } : m)));
  };

  const remove = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    toast({ title: "Message deleted" });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      {messages.length === 0 ? (
        <p className="text-muted-foreground">No messages yet.</p>
      ) : (
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((m) => (
                <TableRow key={m.id} className={m.read ? "opacity-60" : ""}>
                  <TableCell>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.email}</div>
                  </TableCell>
                  <TableCell>{m.subject}</TableCell>
                  <TableCell className="font-mono text-xs">{new Date(m.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => toggleRead(m.id)}>
                        {m.read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(m.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
