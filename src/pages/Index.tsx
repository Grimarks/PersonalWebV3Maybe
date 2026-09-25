import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Code2, PenLine, Coffee, Lightbulb, Calendar } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { DriveImage } from "@/components/DriveImage";
import { ProjectCard, ProjectCardSkeleton } from "@/components/ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import type { Project, Writing, HobbyMoment } from "@/data/types";
import { useCategories } from "@/hooks/use-categories";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { formatLongDate, sortByDateDesc } from "@/lib/date";

const quickLinks = [
  { to: "/projects", icon: Code2, label: "Projects", desc: "Karya & eksperimen teknis" },
  { to: "/skills", icon: Lightbulb, label: "Skills", desc: "Tools & teknologi yang dikuasai" },
  { to: "/writing", icon: PenLine, label: "Writing & Hobi", desc: "Tulisan & momen sehari-hari" },
];

export default function Index() {
  useDocumentTitle();
  const { getCategoryName } = useCategories();
  const [featured, setFeatured] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestWritings, setLatestWritings] = useState<Writing[]>([]);
  const [latestMoments, setLatestMoments] = useState<HobbyMoment[]>([]);
  const [teaserLoading, setTeaserLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Ambil semua featured lalu urutkan terbaru di client (hindari butuh composite index).
        const q = query(collection(db, "projects"), where("featured", "==", true));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ ...d.data(), id: d.id })) as Project[];
        setFeatured(sortByDateDesc(data, (p) => p.createdAt).slice(0, 3));
      } catch (error) {
        console.error("Error fetching featured projects:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTeaser = async () => {
      const [writingsRes, momentsRes] = await Promise.allSettled([
        getDocs(query(collection(db, "writings"), where("published", "==", true))),
        getDocs(collection(db, "hobbyMoments")),
      ]);
      if (writingsRes.status === "fulfilled") {
        const data = writingsRes.value.docs.map((d) => ({ ...d.data(), id: d.id })) as Writing[];
        setLatestWritings(sortByDateDesc(data, (w) => w.createdAt).slice(0, 2));
      } else {
        console.error("Error fetching writings:", writingsRes.reason);
      }
      if (momentsRes.status === "fulfilled") {
        const data = momentsRes.value.docs.map((d) => ({ ...d.data(), id: d.id })) as HobbyMoment[];
        setLatestMoments(sortByDateDesc(data, (m) => m.createdAt).slice(0, 3));
      } else {
        console.error("Error fetching hobby moments:", momentsRes.reason);
      }
      setTeaserLoading(false);
    };

    fetchFeatured();
    fetchTeaser();
  }, []);

  const hasTeaser = latestWritings.length > 0 || latestMoments.length > 0;

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="section-padding relative overflow-hidden">
        <div className="container-custom relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <p className="inline-flex items-center gap-2 font-mono text-primary text-sm mb-5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              Hai, nama saya
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 tracking-tight text-foreground">
              Darrell Satriano<span className="text-accent">.</span>
            </h1>
            <h2 className="text-2xl md:text-4xl font-bold text-muted-foreground mb-6 text-balance">
              Developer-researcher yang menjembatani riset AI/NLP dengan produk software yang benar-benar dipakai orang.
            </h2>

            <p className="text-base md:text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              Mahasiswa Teknik Informatika Universitas Sriwijaya, Palembang. Student researcher NLP
              untuk Bahasa Indonesia, sekaligus membangun aplikasi web & mobile dari desain UI sampai
              deploy — ditemani secangkir kopi dan rasa penasaran yang tidak pernah habis.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Button asChild size="lg">
                <Link to="/projects">
                  Lihat Projects <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Hubungi Saya</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick links */}
      <section className="container-custom -mt-4 mb-4">
        <div className="grid sm:grid-cols-3 gap-4">
          {quickLinks.map((item, i) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.08, ease: "easeOut" }}
            >
              <Link to={item.to} className="soft-card soft-card-hover p-5 flex items-center gap-4 group h-full">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10 md:mb-12"
          >
            <h2 className="text-3xl font-bold mb-2 text-foreground">Featured Projects</h2>
            <p className="text-muted-foreground text-lg">Beberapa hal yang belakangan ini saya bangun</p>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="soft-card p-10 text-center text-muted-foreground">
              Belum ada project yang ditandai sebagai featured.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
                >
                  <ProjectCard project={project} categoryName={getCategoryName(project.category)} maxTech={4} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link to="/projects">
                Lihat Semua Projects <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Writing & Hobby teaser */}
      <section className="section-padding bg-secondary/30">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-foreground flex items-center gap-2">
                <Coffee className="h-7 w-7 text-accent" /> Di Luar Kode
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl">
                Tulisan, seduhan kopi, dan hal-hal kecil lain yang saya nikmati di luar layar.
              </p>
            </div>
            <Button asChild variant="outline" className="self-start md:self-auto">
              <Link to="/writing">
                Jelajahi Writing & Hobi <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {teaserLoading ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-28 w-full rounded-2xl" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="aspect-square rounded-2xl" />
                <Skeleton className="aspect-square rounded-2xl" />
                <Skeleton className="aspect-square rounded-2xl" />
              </div>
            </div>
          ) : hasTeaser ? (
            <div className="grid lg:grid-cols-2 gap-6">
              {latestWritings.length > 0 && (
                <div className="space-y-4">
                  {latestWritings.map((w) => (
                    <Link
                      key={w.id}
                      to={`/writing/${w.id}`}
                      className="soft-card soft-card-hover group flex flex-col p-5"
                    >
                      {w.createdAt && (
                        <span className="mb-1.5 flex items-center text-xs text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" /> {formatLongDate(w.createdAt)}
                        </span>
                      )}
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{w.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{w.excerpt}</p>
                    </Link>
                  ))}
                </div>
              )}
              {latestMoments.length > 0 && (
                <div className="grid grid-cols-3 gap-3 content-start">
                  {latestMoments.map((m) => (
                    <Link
                      key={m.id}
                      to="/writing?tab=hobby"
                      className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted"
                      title={m.title}
                    >
                      <DriveImage
                        src={m.image}
                        alt={m.title}
                        thumbnail
                        thumbnailWidth={400}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        fallbackClassName="h-full w-full"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 line-clamp-1">
                        {m.title}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Mari Berkolaborasi</h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Terbuka untuk diskusi project, riset, maupun sekadar ngobrol soal teknologi. Jangan ragu menyapa!
            </p>
            <Button asChild size="lg">
              <Link to="/contact">Sapa Saya</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
