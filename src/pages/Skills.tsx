import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Code, Server, Smartphone, Brain, Wrench, Sparkles } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Skill } from "@/data/types";
import { SKILL_CATEGORIES } from "@/data/types";

const categoryMeta: Record<string, { icon: typeof Code; color: string }> = {
  Frontend: { icon: Code, color: "text-primary" },
  Backend: { icon: Server, color: "text-accent" },
  Mobile: { icon: Smartphone, color: "text-primary" },
  "AI/ML": { icon: Brain, color: "text-accent" },
  Tools: { icon: Wrench, color: "text-primary" },
  Other: { icon: Sparkles, color: "text-accent" },
};

export default function Skills() {
  useDocumentTitle("Skills");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "skills"));
        const data = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Skill[];
        data.sort((a, b) => (b.level || 0) - (a.level || 0));
        setSkills(data);
      } catch (error) {
        console.error("Error fetching skills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // Skill dengan kategori di luar daftar resmi dimasukkan ke "Other" supaya tidak hilang.
  const groupedSkills = SKILL_CATEGORIES.reduce((acc, category) => {
    acc[category] = skills.filter((skill) =>
      category === "Other"
        ? skill.category === "Other" || !SKILL_CATEGORIES.includes(skill.category)
        : skill.category === category
    );
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <PublicLayout>
      <div className="container-custom pt-10 pb-16 md:pt-14 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Technical Skills</h1>
          <p className="text-muted-foreground">
            Tools, bahasa pemrograman, dan teknologi yang biasa saya pakai untuk riset maupun pengembangan
            software.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="soft-card p-6 space-y-5">
                <Skeleton className="h-10 w-40" />
                {Array.from({ length: 4 }).map((__, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : skills.length === 0 ? (
          <div className="soft-card p-10 text-center text-muted-foreground max-w-xl mx-auto">
            Belum ada data skill yang ditambahkan.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {SKILL_CATEGORIES.filter((c) => groupedSkills[c]?.length).map((category, i) => {
              const categorySkills = groupedSkills[category];
              const Meta = categoryMeta[category] || categoryMeta.Other;
              const Icon = Meta.icon;

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="soft-card p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className={`h-5 w-5 ${Meta.color}`} />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{category}</h2>
                  </div>
                  <div className="space-y-5">
                    {categorySkills.map((skill) => (
                      <div key={skill.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-foreground">{skill.name}</span>
                          <span className="text-muted-foreground">{skill.level}%</span>
                        </div>
                        <Progress value={skill.level} className="h-2" aria-label={`${skill.name} ${skill.level}%`} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
