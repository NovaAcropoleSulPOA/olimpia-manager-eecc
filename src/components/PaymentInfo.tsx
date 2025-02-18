
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import CopyableCode from "@/components/CopyableCode";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface PaymentFeeInfo {
  valor: number | null;
  pix_key: string | null;
  data_limite_inscricao: string | null;
  contato_nome: string | null;
  contato_telefone: string | null;
  isento: boolean;
  perfil_nome: string | null;
  qr_code_image: string | null;
  qr_code_codigo: string | null;
  link_formulario: string | null;
}

const PaymentInfo = () => {
  const { user } = useAuth();
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  useEffect(() => {
    const eventId = localStorage.getItem('currentEventId');
    if (eventId) {
      setCurrentEventId(eventId);
    }
  }, []);

  const { data: paymentInfo, isLoading } = useQuery({
    queryKey: ['payment-info', user?.id, currentEventId],
    queryFn: async () => {
      if (!user?.id || !currentEventId) return null;
      console.log('Fetching payment info for user:', user.id, 'event:', currentEventId);
      
      const { data, error } = await supabase
        .from('vw_taxas_inscricao_usuarios')
        .select(`
          valor,
          pix_key,
          data_limite_inscricao,
          contato_nome,
          contato_telefone,
          isento,
          perfil_nome,
          qr_code_image,
          qr_code_codigo,
          link_formulario
        `)
        .eq('usuario_id', user.id)
        .eq('evento_id', currentEventId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching payment info:', error);
        throw error;
      }

      console.log('Payment info response:', data);
      return data as PaymentFeeInfo;
    },
    enabled: !!user?.id && !!currentEventId,
  });

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
          <div className="space-y-4 text-olimpics-text">
            {paymentInfo.perfil_nome && (
              <p className="flex items-center gap-2">
                <span className="text-lg">👤</span> Perfil: {paymentInfo.perfil_nome}
              </p>
            )}
            <p className="flex items-center gap-2">
              <span className="text-lg">💰</span> Valor: {paymentInfo.valor ? `R$ ${paymentInfo.valor.toFixed(2)}` : 'Não definido'}
            </p>
            {paymentInfo.pix_key && (
              <p className="flex items-center gap-2">
                <span className="text-lg">📱</span> PIX: {paymentInfo.pix_key}
              </p>
            )}
            {paymentInfo.data_limite_inscricao && (
              <p className="flex items-center gap-2">
                <span className="text-lg">⏰</span> Data limite: {new Date(paymentInfo.data_limite_inscricao).toLocaleDateString('pt-BR')}
              </p>
            )}
            {paymentInfo.contato_nome && paymentInfo.contato_telefone && (
              <Button
                variant="link"
                className="text-olimpics-orange-primary hover:text-olimpics-orange-secondary flex items-center gap-2 p-0 justify-start"
                onClick={handleWhatsAppClick}
              >
                <span className="text-lg">📞</span> Contato: {paymentInfo.contato_nome} - {paymentInfo.contato_telefone}
              </Button>
            )}
          </div>

          <div className="flex flex-col items-center justify-center gap-4">
            <h3 className="text-lg font-semibold text-olimpics-green-primary text-center">
              Aponte a câmera do celular para o Código QR e obtenha todos os detalhes do pagamento
            </h3>
            {paymentInfo.qr_code_image && (
              <img
                src={paymentInfo.qr_code_image}
                alt="QR Code do PIX"
                className="w-64 h-64 object-contain"
              />
            )}
            <h3 className="text-lg font-semibold text-olimpics-green-primary text-center">
              ... ou copie o código abaixo:
            </h3>
            {paymentInfo.qr_code_codigo && (
              <CopyableCode code={paymentInfo.qr_code_codigo} />
            )}
          </div>
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
