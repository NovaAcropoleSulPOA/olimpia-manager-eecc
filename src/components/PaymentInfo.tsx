
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
    const storedEventId = localStorage.getItem('currentEventId');
    if (storedEventId) {
      setCurrentEventId(storedEventId);
    }
  }, []);

  // Only use stored event ID if no event ID is provided
  const effectiveEventId = eventId || currentEventId || undefined;

  const { data: paymentFees, isLoading, error } = usePaymentInfo(
    userId,
    effectiveEventId
  );

  const handleWhatsAppClick = (telefone: string | null) => {
    if (!telefone) {
      toast.error("Número de telefone para contato não disponível");
      return;
    }
    
    const phoneNumber = telefone.replace(/\D/g, '');
    window.open(`https://wa.me/${phoneNumber}`, "_blank");
  };

  const handleFormClick = (link: string | null) => {
    if (!link) {
      toast.error("O link para envio do comprovante ainda não está disponível. Por favor, entre em contato com o suporte.");
      return;
    }

    const url = link.startsWith('http') ? link : `https://${link}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    console.error('Payment info error:', error);
    return (
      <Card className="w-full bg-olimpics-background border-olimpics-green-primary/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-olimpics-green-primary">
            Informações de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-olimpics-text">
            Ocorreu um erro ao carregar as informações de pagamento. Por favor, tente novamente mais tarde.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!paymentFees || paymentFees.length === 0) {
    return (
      <Card className="w-full bg-olimpics-background border-olimpics-green-primary/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-olimpics-green-primary">
            Informações de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-olimpics-text">
            Não há informações de pagamento disponíveis no momento.
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
          {paymentFees.map((fee, index) => (
            <Card 
              key={index}
              className={`relative ${fee.is_current_profile 
                ? 'border-2 border-olimpics-green-primary shadow-lg' 
                : 'border border-olimpics-green-primary/20'}`}
            >
              <CardHeader>
                <CardTitle className="text-md font-semibold text-olimpics-green-primary">
                  {fee.perfil_nome}
                  {fee.is_current_profile && (
                    <span className="ml-2 text-sm text-olimpics-orange-primary">(Seu perfil)</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentDetails 
                  paymentInfo={fee}
                  onWhatsAppClick={() => handleWhatsAppClick(fee.contato_telefone)}
                />
                {fee.is_current_profile && (
                  <>
                    <div className="mt-6 border-t border-olimpics-green-primary/20 pt-6">
                      <QRCodeSection paymentInfo={fee} />
                    </div>
                    {fee.link_formulario && (
                      <Button
                        onClick={() => handleFormClick(fee.link_formulario)}
                        className="w-full mt-4 bg-olimpics-orange-primary hover:bg-olimpics-orange-secondary text-white"
                        type="button"
                      >
                        Enviar comprovante de pagamento
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentInfo;
