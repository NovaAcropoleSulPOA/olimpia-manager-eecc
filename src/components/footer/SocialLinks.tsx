
import { Github, Instagram, Linkedin, Mail, MessageCircle } from "lucide-react";

export const socialLinks = [
  {
    icon: <Linkedin className="w-4 h-4" />,
    href: "https://www.linkedin.com/in/olimarteixeiraborges/",
    label: "LinkedIn",
  },
  {
    icon: <Github className="w-4 h-4" />,
    href: "https://github.com/olimarborges",
    label: "GitHub",
  },
  {
    icon: <Instagram className="w-4 h-4" />,
    href: "https://www.instagram.com/olimarbjunior/",
    label: "Instagram",
  },
  {
    icon: <Mail className="w-4 h-4" />,
    href: "mailto:olimarbjunior@gmail.com",
    label: "Email",
  },
  {
    icon: <MessageCircle className="w-4 h-4" />,
    href: "https://wa.me/5551984294328",
    label: "WhatsApp",
  },
];

const SocialLinks = () => {
  return (
    <div className="flex gap-2">
      {socialLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-olimpics-green-primary transition-colors"
          title={link.label}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
