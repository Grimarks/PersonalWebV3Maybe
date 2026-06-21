import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/layout/PublicLayout";
import { DriveImage } from "@/components/DriveImage";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Writing } from "@/data/types";

export default function WritingDetail() {
  const { id } = useParams();
  const [writing, setWriting] = useState<Writing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWriting = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const docRef = doc(db, "writings", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setWriting({ id: docSnap.id, ...docSnap.data() } as Writing);
        } else {
          setWriting(null);
        }
      } catch (error) {
        console.error("Error fetching writing:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWriting();
  }, [id]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex justify-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  if (!writing) {
    return (
      <PublicLayout>
        <div className="container-custom py-24 text-center">
          <h1 className="text-3xl font-bold mb-4 text-foreground">Tulisan tidak ditemukan</h1>
          <p className="text-muted-foreground mb-8">Tulisan yang kamu cari tidak ada atau sudah dihapus.</p>
          <Button asChild variant="outline">
            <Link to="/writing">
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Writing & Hobi
            </Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <article className="pb-16">
        <div className="container-custom max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link
              to="/writing"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8 group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Writing & Hobi
            </Link>

            <div className="space-y-4 mb-8">
              <div className="flex flex-wrap gap-2">
                {writing.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">{writing.title}</h1>
              {writing.createdAt && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {new Date(writing.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              )}
            </div>

            {writing.coverImage && (
              <div className="rounded-2xl overflow-hidden border border-border bg-muted mb-10 shadow-sm">
                <DriveImage
                  src={writing.coverImage}
                  alt={writing.title}
                  className="w-full h-auto max-h-[420px] object-cover"
                  fallbackClassName="w-full h-64"
                />
              </div>
            )}

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {writing.content?.split("\n").map((paragraph, idx) =>
                paragraph.trim() ? (
                  <p key={idx} className="text-foreground/90 leading-relaxed mb-5 whitespace-pre-line">
                    {paragraph}
                  </p>
                ) : null
              )}
            </div>
          </motion.div>
        </div>
      </article>
    </PublicLayout>
  );
}
