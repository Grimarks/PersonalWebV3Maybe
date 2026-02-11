import { motion } from "framer-motion";
import { usePortfolio } from "@/data/portfolio-data";
import PublicLayout from "@/components/layout/PublicLayout";

const categoryOrder = ["Frontend", "Backend", "Tools", "Other"] as const;

export default function Skills() {
  const { skills } = usePortfolio();

  return (
    <PublicLayout>
      <section className="section-padding">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl text-primary md:text-5xl font-bold mb-4">Skills</h1>
            <p className="text-muted-foreground text-lg mb-12 max-w-2xl">
              Technologies and tools I work with on a daily basis.
            </p>
          </motion.div>

          <div className="space-y-16">
            {categoryOrder.map((category) => {
              const catSkills = skills.filter((s) => s.category === category);
              if (catSkills.length === 0) return null;
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-2xl text-primary font-bold mb-6">{category}</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catSkills.map((skill) => (
                      <div key={skill.id} className="glass-card p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-muted-foreground">{skill.name}</span>
                          <span className="font-mono text-xs text-muted-foreground">{skill.level}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
