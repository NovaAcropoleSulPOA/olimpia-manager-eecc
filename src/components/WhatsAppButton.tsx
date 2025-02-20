
import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const phoneNumber = "5551997033839";
  const message = encodeURIComponent("Olá! Preciso de ajuda.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[88px] right-4 md:bottom-8 md:right-8 z-50 flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-green-600 transition-colors"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="font-medium">Precisa de Ajuda?</span>
    </a>
  );
};

export default WhatsAppButton;
