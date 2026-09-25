import { ReactNode } from "react";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background dekoratif: soft blue glow + dot grid, sangat halus, tidak mengganggu keterbacaan */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-sky-300/10 dark:bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-[24rem] w-[24rem] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute inset-0 bg-dot opacity-[0.4] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      </div>

      <Navbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex-1 pt-16"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}
