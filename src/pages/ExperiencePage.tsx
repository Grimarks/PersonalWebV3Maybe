import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, GraduationCap, Calendar, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface Experience {
  id: string;
  type: "work" | "education";
  title: string;
  organization: string;
  startDate: string;
  endDate?: string;
  description: string;
  current: boolean;
}

const ExperiencePage = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "experiences"));
        const data = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Experience[];

        // Urutkan berdasarkan tanggal mulai (terbaru di atas)
        data.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

        setExperiences(data);
      } catch (error) {
        console.error("Error fetching experience:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, []);

  const workExperiences = experiences.filter((e) => e.type === "work");
  const educationExperiences = experiences.filter((e) => e.type === "education");

  const ExperienceCard = ({ item }: { item: Experience }) => (
      <Card className="glass-card border-none shadow-md mb-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/50 group-hover:bg-primary transition-colors" />
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-bold text-primary">{item.title}</CardTitle>
              <div className="text-lg font-medium text-foreground/80">{item.organization}</div>
            </div>
            <Badge variant={item.current ? "default" : "secondary"} className="w-fit">
              {item.current ? "Present" : `${item.startDate} - ${item.endDate}`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-line">{item.description}</p>
        </CardContent>
      </Card>
  );

  return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-24 space-y-16">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Experience & Education</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              My professional journey and academic background.
            </p>
          </div>

          {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
          ) : (
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Work Section */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Work Experience</h2>
                  </div>
                  {workExperiences.length > 0 ? (
                      workExperiences.map((item) => <ExperienceCard key={item.id} item={item} />)
                  ) : (
                      <p className="text-muted-foreground italic">No work experience added yet.</p>
                  )}
                </div>

                {/* Education Section */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-full bg-primary/10">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Education</h2>
                  </div>
                  {educationExperiences.length > 0 ? (
                      educationExperiences.map((item) => <ExperienceCard key={item.id} item={item} />)
                  ) : (
                      <p className="text-muted-foreground italic">No education added yet.</p>
                  )}
                </div>
              </div>
          )}
        </main>
        <Footer />
      </div>
  );
};

export default ExperiencePage;