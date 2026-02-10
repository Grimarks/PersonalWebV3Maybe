import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  techStack: string[];
  category: string;
  image: string;
  githubUrl: string;
  liveUrl?: string;
  features: string[];
  featured: boolean;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: "Frontend" | "Backend" | "Tools" | "Other";
  level: number; // 0-100
  icon?: string;
}

export interface Experience {
  id: string;
  type: "work" | "education";
  title: string;
  organization: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string;
  current: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PortfolioData {
  projects: Project[];
  skills: Skill[];
  experiences: Experience[];
  messages: ContactMessage[];
  categories: Category[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setSkills: React.Dispatch<React.SetStateAction<Skill[]>>;
  setExperiences: React.Dispatch<React.SetStateAction<Experience[]>>;
  setMessages: React.Dispatch<React.SetStateAction<ContactMessage[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const defaultCategories: Category[] = [
  { id: "1", name: "Web", slug: "web" },
  { id: "2", name: "Mobile", slug: "mobile" },
  { id: "3", name: "AI / ML", slug: "ai" },
  { id: "4", name: "DevOps", slug: "devops" },
];

const defaultProjects: Project[] = [
  {
    id: "1",
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce solution with real-time inventory, payments, and admin dashboard.",
    longDescription: "Built a scalable e-commerce platform handling thousands of concurrent users. Features include real-time inventory tracking, Stripe payment integration, order management, and a comprehensive admin dashboard for store owners.",
    techStack: ["React", "Node.js", "PostgreSQL", "Stripe", "Redis"],
    category: "web",
    image: "",
    githubUrl: "https://github.com",
    liveUrl: "https://example.com",
    features: ["Real-time inventory tracking", "Stripe payments", "Admin dashboard", "Order management", "User authentication"],
    featured: true,
    createdAt: "2024-06-15",
  },
  {
    id: "2",
    title: "AI Content Generator",
    description: "An intelligent content creation tool powered by GPT-4 with custom fine-tuning capabilities.",
    longDescription: "Developed an AI-powered content generation platform that leverages GPT-4 for creating blog posts, social media content, and marketing copy. Includes custom fine-tuning pipelines and content scheduling.",
    techStack: ["Python", "FastAPI", "React", "OpenAI", "Docker"],
    category: "ai",
    image: "",
    githubUrl: "https://github.com",
    features: ["GPT-4 integration", "Custom fine-tuning", "Content scheduling", "Analytics dashboard", "Multi-language support"],
    featured: true,
    createdAt: "2024-04-20",
  },
  {
    id: "3",
    title: "DevOps Dashboard",
    description: "A centralized monitoring and deployment dashboard for cloud infrastructure management.",
    longDescription: "Created a comprehensive DevOps dashboard that provides real-time monitoring, automated deployments, and infrastructure management across multiple cloud providers.",
    techStack: ["TypeScript", "Go", "Kubernetes", "Terraform", "Grafana"],
    category: "devops",
    image: "",
    githubUrl: "https://github.com",
    liveUrl: "https://example.com",
    features: ["Real-time monitoring", "Auto-scaling", "CI/CD pipelines", "Multi-cloud support", "Alert management"],
    featured: true,
    createdAt: "2024-02-10",
  },
  {
    id: "4",
    title: "Fitness Tracker App",
    description: "A cross-platform mobile app for tracking workouts, nutrition, and health metrics.",
    longDescription: "Designed and built a cross-platform mobile application for fitness enthusiasts. Features include workout tracking, nutrition logging, health metrics visualization, and social challenges.",
    techStack: ["React Native", "Firebase", "Node.js", "Chart.js"],
    category: "mobile",
    image: "",
    githubUrl: "https://github.com",
    features: ["Workout tracking", "Nutrition logging", "Health metrics", "Social challenges", "Progress charts"],
    featured: false,
    createdAt: "2024-01-05",
  },
];

const defaultSkills: Skill[] = [
  { id: "1", name: "React", category: "Frontend", level: 95 },
  { id: "2", name: "TypeScript", category: "Frontend", level: 90 },
  { id: "3", name: "Next.js", category: "Frontend", level: 85 },
  { id: "4", name: "Tailwind CSS", category: "Frontend", level: 92 },
  { id: "5", name: "Vue.js", category: "Frontend", level: 70 },
  { id: "6", name: "Node.js", category: "Backend", level: 88 },
  { id: "7", name: "Python", category: "Backend", level: 82 },
  { id: "8", name: "PostgreSQL", category: "Backend", level: 80 },
  { id: "9", name: "GraphQL", category: "Backend", level: 75 },
  { id: "10", name: "Docker", category: "Tools", level: 85 },
  { id: "11", name: "Git", category: "Tools", level: 93 },
  { id: "12", name: "AWS", category: "Tools", level: 78 },
  { id: "13", name: "Figma", category: "Tools", level: 70 },
  { id: "14", name: "Go", category: "Backend", level: 65 },
  { id: "15", name: "Redis", category: "Backend", level: 72 },
];

const defaultExperiences: Experience[] = [
  {
    id: "1",
    type: "work",
    title: "Senior Software Engineer",
    organization: "Tech Corp",
    location: "San Francisco, CA",
    startDate: "2023-01",
    description: "Leading frontend architecture and mentoring a team of 5 developers. Building scalable web applications with React and TypeScript.",
    current: true,
  },
  {
    id: "2",
    type: "work",
    title: "Full Stack Developer",
    organization: "StartupXYZ",
    location: "Remote",
    startDate: "2021-06",
    endDate: "2022-12",
    description: "Built and maintained multiple client-facing applications. Implemented CI/CD pipelines and improved deployment efficiency by 40%.",
    current: false,
  },
  {
    id: "3",
    type: "education",
    title: "B.Sc. Computer Science",
    organization: "University of Technology",
    location: "Milan, Italy",
    startDate: "2017-09",
    endDate: "2021-05",
    description: "Focused on software engineering, algorithms, and artificial intelligence. Graduated with honors.",
    current: false,
  },
];

const PortfolioContext = createContext<PortfolioData | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => loadFromStorage("portfolio_projects", defaultProjects));
  const [skills, setSkills] = useState<Skill[]>(() => loadFromStorage("portfolio_skills", defaultSkills));
  const [experiences, setExperiences] = useState<Experience[]>(() => loadFromStorage("portfolio_experiences", defaultExperiences));
  const [messages, setMessages] = useState<ContactMessage[]>(() => loadFromStorage("portfolio_messages", []));
  const [categories, setCategories] = useState<Category[]>(() => loadFromStorage("portfolio_categories", defaultCategories));

  useEffect(() => { localStorage.setItem("portfolio_projects", JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem("portfolio_skills", JSON.stringify(skills)); }, [skills]);
  useEffect(() => { localStorage.setItem("portfolio_experiences", JSON.stringify(experiences)); }, [experiences]);
  useEffect(() => { localStorage.setItem("portfolio_messages", JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem("portfolio_categories", JSON.stringify(categories)); }, [categories]);

  return (
    <PortfolioContext.Provider value={{ projects, skills, experiences, messages, categories, setProjects, setSkills, setExperiences, setMessages, setCategories }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error("usePortfolio must be used within PortfolioProvider");
  return context;
}
