
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { PaymentDetails } from "./payment/PaymentDetails";
import { QRCodeSection } from "./payment/QRCodeSection";
import { usePaymentInfo } from "@/hooks/usePaymentInfo";
import { PaymentStatus } from "@/types/payment";

interface PaymentInfoProps {
  initialPaymentStatus?: PaymentStatus;
  userId?: string;
  eventId?: string;
}

const PaymentInfo = ({ initialPaymentStatus, userId, eventId }: PaymentInfoProps) => {
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  useEffect(() => {
    const eventId = localStorage.getItem('currentEventId');
    if (eventId) {
      setCurrentEventId(eventId);
    }
  }, []);

  const { data: paymentInfo, isLoading } = usePaymentInfo(userId, eventId, initialPaymentStatus);

  const handleWhatsAppClick = () => {
    if (paymentInfo?.contato_telefone) {
      window.open(`https://wa.me/${paymentInfo.contato_telefone.replace(/\D/g, '')}`, "_blank");
    }
  };

  const handleFormClick = () => {
    console.log('Form link:', paymentInfo?.link_formulario);
    if (paymentInfo?.link_formulario) {
      const url = paymentInfo.link_formulario.startsWith('http') 
        ? paymentInfo.link_formulario 
        : `https://${paymentInfo.link_formulario}`;
        
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      toast.error("O link para envio do comprovante ainda não está disponível. Por favor, entre em contato com o suporte.");
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!paymentInfo) {
    return null;
  }

  if (paymentInfo.isento) {
    return (
      <Card className="w-full bg-olimpics-background border-olimpics-green-primary/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-olimpics-green-primary">
            Informações de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-olimpics-text">
            Você está isento da taxa de inscrição.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-olimpics-background border-olimpics-green-primary/20">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-olimpics-green-primary">
          Informações de Pagamento
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PaymentDetails 
            paymentInfo={paymentInfo}
            onWhatsAppClick={handleWhatsAppClick}
          />
          <QRCodeSection paymentInfo={paymentInfo} />
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleFormClick}
          className="w-full bg-olimpics-orange-primary hover:bg-olimpics-orange-secondary text-white"
          type="button"
        >
          {paymentInfo.link_formulario 
            ? 'Realize o envio do comprovante'
            : 'Link para envio indisponível no momento'
          }
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentInfo;
