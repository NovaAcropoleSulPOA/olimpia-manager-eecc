import { Github, Instagram, Linkedin, Mail, MessageCircle } from "lucide-react";

const Footer = () => {
  const socialLinks = [
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

  return (
    <footer className="relative z-50 w-full bg-white/80 backdrop-blur-sm border-t py-2 px-4 mt-auto">
      <div className="container mx-auto flex justify-end items-center gap-4">
        <span className="text-xs text-gray-500">
          Desenvolvido por: Olimar Teixeira Borges
        </span>
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
      </div>
    </footer>
  );
};

export default Footer;