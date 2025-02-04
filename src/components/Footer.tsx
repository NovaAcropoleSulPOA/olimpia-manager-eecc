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
    <footer className="hidden md:block fixed bottom-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-sm border-t py-4 px-4">
      <div className="container mx-auto flex justify-between items-center">
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