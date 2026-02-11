import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Loader2 } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
}

const Skills = () => {
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
        setSkills(data);
      } catch (error) {
        console.error("Error fetching skills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // Mengelompokkan skill berdasarkan kategori
  const categories = ["Frontend", "Backend", "Tools", "Other"];
  const groupedSkills = categories.reduce((acc, category) => {
    acc[category] = skills.filter((skill) => skill.category === category);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-24 space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Technical Skills</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive overview of my technical expertise and proficiency levels across various domains of software development.
            </p>
          </div>

          {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
          ) : (
              <div className="grid gap-8 md:grid-cols-2">
                {categories.map((category) => {
                  const categorySkills = groupedSkills[category];
                  if (categorySkills.length === 0) return null;

                  return (
                      <Card key={category} className="glass-card border-none shadow-md">
                        <CardHeader>
                          <CardTitle className="text-2xl text-primary">{category}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {categorySkills.map((skill) => (
                              <div key={skill.id} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium">{skill.name}</span>
                                  <span className="text-muted-foreground">{skill.level}%</span>
                                </div>
                                <Progress value={skill.level} className="h-2" />
                              </div>
                          ))}
                        </CardContent>
                      </Card>
                  );
                })}
              </div>
          )}
        </main>
        <Footer />
      </div>
  );
};

export default Skills;