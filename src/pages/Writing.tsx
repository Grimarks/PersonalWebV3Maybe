import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { PenLine, Image as ImageIcon, ArrowRight, Calendar } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { DriveImage } from "@/components/DriveImage";
import { FilterPills } from "@/components/FilterPills";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import type { Writing as WritingType, HobbyMoment } from "@/data/types";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { formatLongDate, sortByDateDesc } from "@/lib/date";

type Status = "loading" | "ready" | "error";

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="soft-card p-10 text-center text-muted-foreground">{children}</div>;
}

export default function Writing() {
  useDocumentTitle("Writing & Hobi");
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "hobby" ? "hobby" : "writing";

  const [writings, setWritings] = useState<WritingType[]>([]);
  const [moments, setMoments] = useState<HobbyMoment[]>([]);
  const [writingStatus, setWritingStatus] = useState<Status>("loading");
  const [momentStatus, setMomentStatus] = useState<Status>("loading");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedMoment, setSelectedMoment] = useState<HobbyMoment | null>(null);

  useEffect(() => {
    // Query dibatasi ke tulisan published: Firestore Rules menolak query yang
    // berpotensi mengembalikan draft untuk pengunjung yang tidak login.
    getDocs(query(collection(db, "writings"), where("published", "==", true)))
      .then((snap) => {
        const data = snap.docs.map((d) => ({ ...d.data(), id: d.id })) as WritingType[];
        setWritings(sortByDateDesc(data, (w) => w.createdAt));
        setWritingStatus("ready");
      })
      .catch((error) => {
        console.error("Error fetching writings:", error);
        setWritingStatus("error");
      });

    // Diambil terpisah supaya kalau salah satu gagal, tab lainnya tetap tampil.
    getDocs(collection(db, "hobbyMoments"))
      .then((snap) => {
        const data = snap.docs.map((d) => ({ ...d.data(), id: d.id })) as HobbyMoment[];
        setMoments(sortByDateDesc(data, (m) => m.createdAt));
        setMomentStatus("ready");
      })
      .catch((error) => {
        console.error("Error fetching hobby moments:", error);
        setMomentStatus("error");
      });
  }, []);

  const categoryOptions = useMemo(() => {
    const cats = Array.from(new Set(moments.map((m) => m.category).filter(Boolean)));
    return [{ value: "all", label: "Semua" }, ...cats.map((c) => ({ value: c, label: c }))];
  }, [moments]);

  const filteredMoments =
    activeCategory === "all" ? moments : moments.filter((m) => m.category === activeCategory);

  const handleTabChange = (value: string) => {
    setSearchParams(value === "hobby" ? { tab: "hobby" } : {}, { replace: true });
  };

  return (
    <PublicLayout>
      <div className="container-custom pt-10 pb-16 md:pt-14 space-y-10">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Writing & Hobi</h1>
          <p className="text-muted-foreground">
            Tempat saya menulis pikiran panjang, dan menyimpan momen-momen kecil — secangkir kopi, sesi
            gaming, atau apa pun yang sedang saya nikmati.
          </p>
        </div>

        <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mx-auto grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="writing" className="flex items-center gap-2">
              <PenLine className="h-4 w-4" /> Tulisan
            </TabsTrigger>
            <TabsTrigger value="hobby" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Momen Hobi
            </TabsTrigger>
          </TabsList>

          {/* TULISAN */}
          <TabsContent value="writing" className="space-y-6 focus-visible:ring-0">
            {writingStatus === "loading" ? (
              <div className="grid md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="soft-card p-6 space-y-3">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ))}
              </div>
            ) : writingStatus === "error" ? (
              <EmptyState>Gagal memuat tulisan. Coba muat ulang halaman.</EmptyState>
            ) : writings.length === 0 ? (
              <EmptyState>Belum ada tulisan yang dipublikasikan.</EmptyState>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {writings.map((w, i) => (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.06 }}
                  >
                    <Link
                      to={`/writing/${w.id}`}
                      className="soft-card soft-card-hover group flex flex-col h-full overflow-hidden"
                    >
                      {w.coverImage && (
                        <div className="aspect-[16/9] w-full bg-muted overflow-hidden">
                          <DriveImage
                            src={w.coverImage}
                            alt={w.title}
                            thumbnail
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            fallbackClassName="w-full h-full"
                          />
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-grow">
                        {w.createdAt && (
                          <div className="flex items-center text-xs text-muted-foreground mb-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatLongDate(w.createdAt)}
                          </div>
                        )}
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                          {w.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                          {w.excerpt}
                        </p>
                        <div className="flex items-center justify-between gap-3 mt-auto">
                          <div className="flex flex-wrap gap-2">
                            {w.tags?.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <span className="inline-flex flex-shrink-0 items-center text-sm font-medium text-primary sm:opacity-0 sm:-translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                            Baca <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* MOMEN HOBI */}
          <TabsContent value="hobby" className="space-y-6 focus-visible:ring-0">
            {categoryOptions.length > 2 && (
              <FilterPills
                options={categoryOptions}
                value={activeCategory}
                onChange={setActiveCategory}
                layoutId="hobby-filter"
                className="justify-center"
              />
            )}

            {momentStatus === "loading" ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                ))}
              </div>
            ) : momentStatus === "error" ? (
              <EmptyState>Gagal memuat momen hobi. Coba muat ulang halaman.</EmptyState>
            ) : filteredMoments.length === 0 ? (
              <EmptyState>Belum ada momen hobi yang diunggah.</EmptyState>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [&>*]:mb-5">
                {filteredMoments.map((moment, i) => (
                  <motion.button
                    key={moment.id}
                    type="button"
                    onClick={() => setSelectedMoment(moment)}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.05 }}
                    className="block w-full break-inside-avoid text-left soft-card soft-card-hover overflow-hidden group"
                  >
                    <div className="bg-muted overflow-hidden">
                      <DriveImage
                        src={moment.image}
                        alt={moment.title}
                        thumbnail
                        thumbnailWidth={800}
                        className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        fallbackClassName="w-full h-48"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {moment.category && (
                          <Badge variant="secondary" className="text-xs">
                            {moment.category}
                          </Badge>
                        )}
                        {moment.createdAt && (
                          <span className="text-xs text-muted-foreground">{formatLongDate(moment.createdAt)}</span>
                        )}
                      </div>
                      <h3 className="font-bold text-foreground mb-1">{moment.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{moment.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail momen: foto besar + deskripsi lengkap */}
      <Dialog open={!!selectedMoment} onOpenChange={(open) => !open && setSelectedMoment(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[92vh] overflow-y-auto">
          {selectedMoment && (
            <>
              <div className="bg-muted flex items-center justify-center">
                <DriveImage
                  src={selectedMoment.image}
                  alt={selectedMoment.title}
                  className="w-auto max-w-full max-h-[65vh] object-contain"
                  fallbackClassName="w-full h-64"
                />
              </div>
              <div className="p-6 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {selectedMoment.category && <Badge variant="secondary">{selectedMoment.category}</Badge>}
                  {selectedMoment.createdAt && <span>{formatLongDate(selectedMoment.createdAt)}</span>}
                </div>
                <DialogTitle className="text-xl">{selectedMoment.title}</DialogTitle>
                <DialogDescription className="whitespace-pre-line leading-relaxed">
                  {selectedMoment.description}
                </DialogDescription>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
