import { useEffect, useState } from "react";
import { Loader2, Code, Server, Wrench, Sparkles } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Skill } from "@/data/types";
import { SKILL_CATEGORIES } from "@/data/types";

const categoryMeta: Record<string, { icon: typeof Code; color: string }> = {
  Frontend: { icon: Code, color: "text-primary" },
  Backend: { icon: Server, color: "text-accent" },
  Tools: { icon: Wrench, color: "text-primary" },
  Other: { icon: Sparkles, color: "text-accent" },
};

export default function Skills() {
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
        data.sort((a, b) => b.level - a.level);
        setSkills(data);
      } catch (error) {
        console.error("Error fetching skills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const groupedSkills = SKILL_CATEGORIES.reduce((acc, category) => {
    acc[category] = skills.filter((skill) => skill.category === category);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <PublicLayout>
      <div className="container-custom py-10 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Technical Skills</h1>
          <p className="text-muted-foreground">
            Tools, bahasa pemrograman, dan teknologi yang biasa saya pakai untuk riset maupun pengembangan
            software.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : skills.length === 0 ? (
          <div className="soft-card p-10 text-center text-muted-foreground max-w-xl mx-auto">
            Belum ada data skill yang ditambahkan.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {SKILL_CATEGORIES.map((category) => {
              const categorySkills = groupedSkills[category];
              if (!categorySkills || categorySkills.length === 0) return null;
              const Meta = categoryMeta[category] || categoryMeta.Other;
              const Icon = Meta.icon;

              return (
                <div key={category} className="soft-card p-6">
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
                        <Progress value={skill.level} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
