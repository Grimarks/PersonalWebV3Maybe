// FILE: src/pages/Contact.tsx
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const Contact = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simpan ke Firebase Collection 'messages'
      await addDoc(collection(db, "messages"), {
        ...formData,
        createdAt: new Date().toISOString(),
        read: false
      });

      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. I'll get back to you soon.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to send",
        description: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-24 flex items-center justify-center">
          <Card className="w-full max-w-2xl glass-card border-none shadow-xl">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">Get in Touch</CardTitle>
              <p className="text-muted-foreground">
                Have a question or want to work together? Drop me a message!
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input name="subject" placeholder="Project Inquiry" value={formData.subject} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea name="message" placeholder="Tell me about your project..." rows={6} className="resize-none" value={formData.message} onChange={handleChange} required />
                </div>
                <Button type="submit" className="w-full text-lg h-12" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
  );
};

export default Contact;