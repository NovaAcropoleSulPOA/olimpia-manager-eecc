
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  const [isOpen, setIsOpen] = useState(true);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  useEffect(() => {
    const storedEventId = localStorage.getItem('currentEventId');
    if (storedEventId) {
      setCurrentEventId(storedEventId);
    }
  }, []);

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

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
        </CardContent>
      </Card>
    );
  }

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
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg font-semibold text-olimpics-green-primary">
            Informações de Pagamento
          </CardTitle>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className={`w-9 h-9 p-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
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
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default PaymentInfo;
