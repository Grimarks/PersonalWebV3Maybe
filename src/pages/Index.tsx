import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Github, Code2, PenLine, Coffee } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { DriveImage } from "@/components/DriveImage";
import { db } from "@/lib/firebase";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import type { Project } from "@/data/types";
import { getEffectiveCoverImage } from "@/data/types";

export default function Index() {
  const [featured, setFeatured] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, "projects"), where("featured", "==", true), limit(3));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Project[];
        setFeatured(data);
      } catch (error) {
        console.error("Error fetching featured projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="section-padding relative overflow-hidden">
        <div className="container-custom relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className="inline-flex items-center gap-2 font-mono text-primary text-sm mb-5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              Hai, nama saya
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 tracking-tight text-foreground">
              Darrell Satriano<span className="text-accent">.</span>
            </h1>
            <h2 className="text-2xl md:text-4xl font-bold text-muted-foreground mb-6 text-balance">
              Mahasiswa Informatika yang suka mengubah ide jadi sesuatu yang bisa benar-benar dipakai.
            </h2>

            <p className="text-base md:text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              Fokus di pengembangan software, riset NLP, dan eksplorasi machine learning —
              ditemani secangkir kopi dan rasa penasaran yang tidak pernah habis. Di luar layar,
              saya juga senang menulis dan mengoleksi cerita kecil tentang hal-hal yang saya nikmati.
            </p>
            <div className="flex flex-wrap gap-4">
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

      {/* Quick links: Projects / Skills / Writing */}
      <section className="container-custom -mt-4 mb-4">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { to: "/projects", icon: Code2, label: "Projects", desc: "Karya & eksperimen teknis" },
            { to: "/skills", icon: ArrowRight, label: "Skills", desc: "Tools & teknologi yang dikuasai" },
            { to: "/writing", icon: PenLine, label: "Writing & Hobi", desc: "Tulisan & momen sehari-hari" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="soft-card soft-card-hover p-5 flex items-center gap-4 group"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-2 text-foreground">Featured Projects</h2>
            <p className="text-muted-foreground mb-12 text-lg">Beberapa hal yang belakangan ini saya bangun</p>
          </motion.div>

          {!loading && featured.length === 0 ? (
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
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Link
                    to={`/projects/${project.id}`}
                    className="soft-card soft-card-hover group block h-full overflow-hidden"
                  >
                    <div className="aspect-video w-full bg-muted overflow-hidden">
                      <DriveImage
                        src={getEffectiveCoverImage(project)}
                        alt={project.title}
                        thumbnail
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        fallbackClassName="w-full h-full"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <span className="font-mono text-xs text-primary uppercase tracking-wider">
                          {project.category}
                        </span>
                        <div className="flex gap-2">
                          {project.githubUrl && (
                            <Github className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          )}
                          {project.liveUrl && (
                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          )}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {project.techStack &&
                          project.techStack.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="font-mono text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground"
                            >
                              {tech}
                            </span>
                          ))}
                      </div>
                    </div>
                  </Link>
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
            <Button asChild variant="outline">
              <Link to="/writing">
                Jelajahi Writing & Hobi <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
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
