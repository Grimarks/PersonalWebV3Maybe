import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, PenLine, Image as ImageIcon, ArrowRight, Calendar } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { DriveImage } from "@/components/DriveImage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import type { Writing as WritingType, HobbyMoment } from "@/data/types";

export default function Writing() {
  const [writings, setWritings] = useState<WritingType[]>([]);
  const [moments, setMoments] = useState<HobbyMoment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const writingsSnap = await getDocs(collection(db, "writings"));
        const writingsData = writingsSnap.docs
          .map((d) => ({ ...d.data(), id: d.id })) as WritingType[];
        const published = writingsData
          .filter((w) => w.published !== false)
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        const momentsSnap = await getDocs(collection(db, "hobbyMoments"));
        const momentsData = momentsSnap.docs.map((d) => ({ ...d.data(), id: d.id })) as HobbyMoment[];
        momentsData.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        setWritings(published);
        setMoments(momentsData);
      } catch (error) {
        console.error("Error fetching writing/hobby data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const momentCategories = Array.from(new Set(moments.map((m) => m.category).filter(Boolean)));
  const filteredMoments =
    activeCategory === "all" ? moments : moments.filter((m) => m.category === activeCategory);

  return (
    <PublicLayout>
      <div className="container-custom py-10 space-y-10">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Writing & Hobi</h1>
          <p className="text-muted-foreground">
            Tempat saya menulis pikiran panjang, dan menyimpan momen-momen kecil — secangkir kopi, sesi
            gaming, atau apa pun yang sedang saya nikmati.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="writing" className="w-full">
            <TabsList className="mx-auto grid w-full max-w-md grid-cols-2 mb-8">
              <TabsTrigger value="writing" className="flex items-center gap-2">
                <PenLine className="h-4 w-4" /> Tulisan
              </TabsTrigger>
              <TabsTrigger value="hobby" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Momen Hobi
              </TabsTrigger>
            </TabsList>

            {/* TULISAN */}
            <TabsContent value="writing" className="space-y-6">
              {writings.length === 0 ? (
                <div className="soft-card p-10 text-center text-muted-foreground">
                  Belum ada tulisan yang dipublikasikan.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {writings.map((w, i) => (
                    <motion.div
                      key={w.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
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
                              {new Date(w.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                          )}
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                            {w.title}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                            {w.excerpt}
                          </p>
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex flex-wrap gap-2">
                              {w.tags?.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <span className="inline-flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
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
            <TabsContent value="hobby" className="space-y-6">
              {momentCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-2">
                  <button
                    onClick={() => setActiveCategory("all")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      activeCategory === "all"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary"
                    }`}
                  >
                    Semua
                  </button>
                  {momentCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        activeCategory === cat
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {filteredMoments.length === 0 ? (
                <div className="soft-card p-10 text-center text-muted-foreground">
                  Belum ada momen hobi yang diunggah.
                </div>
              ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
                  {filteredMoments.map((moment, i) => (
                    <motion.div
                      key={moment.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="break-inside-avoid soft-card overflow-hidden group"
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
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {moment.category}
                          </Badge>
                          {moment.createdAt && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(moment.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-foreground mb-1">{moment.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{moment.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PublicLayout>
  );
}
