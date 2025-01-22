import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const PaymentInfo = () => {
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/5551995033119", "_blank");
  };

  return (
    <div className="space-y-4 p-4 bg-olimpics-background rounded-lg border border-olimpics-green-primary/20">
      <h3 className="text-lg font-semibold text-olimpics-green-primary text-left">
        Informações de Pagamento
      </h3>
      
      <div className="grid gap-2 text-olimpics-text text-left">
        <p className="flex items-center gap-2">
          <span className="text-lg">💰</span> Valor: R$ 180,00
        </p>
        <p className="flex items-center gap-2">
          <span className="text-lg">📱</span> PIX: escoladoesporte.napoa@gmail.com
        </p>
        <p className="flex items-center gap-2">
          <span className="text-lg">⏰</span> Data limite: 10/03/2025
        </p>
        <Button
          variant="link"
          className="text-olimpics-orange-primary hover:text-olimpics-orange-secondary flex items-center gap-2 p-0 justify-start"
          onClick={handleWhatsAppClick}
        >
          <span className="text-lg">📞</span> Contato: Felipe Navarro - (51) 99503-3119
        </Button>
      </div>

      <div className="flex justify-center">
        <img 
          src="/lovable-uploads/2a16c3db-40ff-4888-9796-799bf80f6748.png" 
          alt="QR Code do PIX"
          className="w-48 h-48 object-contain"
        />
      </div>

      <Alert variant="default" className="bg-olimpics-green-primary/5 border-olimpics-green-primary/20">
        <InfoIcon className="h-4 w-4 text-olimpics-green-primary" />
        <AlertDescription className="text-sm text-gray-600 ml-2">
          Após realizar o pagamento, aguarde a confirmação do seu cadastro por e-mail. 
          Você receberá um e-mail com instruções para enviar seu comprovante de pagamento. 
          Caso tenha dúvidas, entre em contato pelo WhatsApp.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PaymentInfo;