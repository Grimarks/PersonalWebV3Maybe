import { Link } from "react-router-dom";
import { Github, Linkedin, Mail, Instagram } from "lucide-react";
import { SOCIAL_LINKS } from "@/data/profile";

const socials = [
  { icon: Github, href: SOCIAL_LINKS.github, label: "GitHub" },
  { icon: Linkedin, href: SOCIAL_LINKS.linkedin, label: "LinkedIn" },
  { icon: Instagram, href: SOCIAL_LINKS.instagram, label: "Instagram" },
  { icon: Mail, href: SOCIAL_LINKS.email ? `mailto:${SOCIAL_LINKS.email}` : "", label: "Email" },
].filter((s) => s.href);

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/20">
      <div className="container-custom py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
              D
            </span>
            <span>© {new Date().getFullYear()} Darrell Satriano. Dibuat dengan niat baik dan banyak kopi.</span>
          </div>
          <div className="flex items-center gap-2">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target={social.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label={social.label}
              >
                <social.icon className="h-[18px] w-[18px]" />
              </a>
            ))}
            {socials.length === 0 && (
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Hubungi saya →
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
