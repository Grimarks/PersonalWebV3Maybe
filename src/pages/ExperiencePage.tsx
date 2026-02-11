import { motion } from "framer-motion";
import { Briefcase, GraduationCap, MapPin } from "lucide-react";
import { usePortfolio } from "@/data/portfolio-data";
import PublicLayout from "@/components/layout/PublicLayout";

function formatDate(d: string) {
  const [y, m] = d.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(m) - 1]} ${y}`;
}

export default function ExperiencePage() {
  const { experiences } = usePortfolio();
  const work = experiences.filter((e) => e.type === "work");
  const education = experiences.filter((e) => e.type === "education");

  const TimelineItem = ({ exp, i }: { exp: typeof experiences[0]; i: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: i * 0.1 }}
      className="relative pl-8 pb-10 last:pb-0 border-l border-border"
    >
      <div className="absolute left-0 top-0 -translate-x-1/2 h-3 w-3 rounded-full bg-primary" />
      <div className="glass-card p-6">
        <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
          <h3 className="text-lg text-primary font-bold">{exp.title}</h3>
          <span className="font-mono text-xs text-muted-foreground">
            {formatDate(exp.startDate)} — {exp.current ? "Present" : exp.endDate ? formatDate(exp.endDate) : ""}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span className="font-medium text-foreground">{exp.organization}</span>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{exp.location}</span>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">{exp.description}</p>
      </div>
    </motion.div>
  );

  return (
    <PublicLayout>
      <section className="section-padding">
        <div className="container-custom max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl text-primary md:text-5xl font-bold mb-4">Experience & Education</h1>
            <p className="text-muted-foreground text-lg mb-12">My professional journey and academic background.</p>
          </motion.div>

          {work.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-2 mb-8">
                <Briefcase className="h-5 w-5 text-primary" />
                <h2 className="text-2xl text-primary font-bold">Work Experience</h2>
              </div>
              {work.map((exp, i) => <TimelineItem key={exp.id} exp={exp} i={i} />)}
            </div>
          )}

          {education.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-8">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h2 className="text-2xl text-primary font-bold">Education</h2>
              </div>
              {education.map((exp, i) => <TimelineItem key={exp.id} exp={exp} i={i} />)}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
