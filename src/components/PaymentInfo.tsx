
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface PaymentFeeInfo {
  valor: number | null;
  pix_key: string | null;
  data_limite_inscricao: string | null;
  contato_nome: string | null;
  contato_telefone: string | null;
  isento: boolean;
  perfil_nome: string | null;
}

const PaymentInfo = () => {
  const { user } = useAuth();

  // This query uses the view that returns only the highest fee profile
  const { data: paymentInfo, isLoading } = useQuery({
    queryKey: ['payment-info', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      console.log('Fetching payment info for user:', user.id);
      
      const { data, error } = await supabase
        .from('vw_taxas_inscricao_usuarios')
        .select('*')
        .eq('usuario_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching payment info:', error);
        throw error;
      }

      console.log('Payment info for highest fee profile:', data);
      return data as PaymentFeeInfo;
    },
    enabled: !!user?.id,
  });

  const handleWhatsAppClick = () => {
    if (paymentInfo?.contato_telefone) {
      window.open(`https://wa.me/${paymentInfo.contato_telefone.replace(/\D/g, '')}`, "_blank");
    }
  };

  const handleFormClick = () => {
    window.open("https://forms.gle/doAci87XFFWgVXXs7", "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  if (!paymentInfo) {
    return null;
  }

  if (paymentInfo.isento) {
    return (
      <div className="space-y-4 p-4 bg-olimpics-background rounded-lg border border-olimpics-green-primary/20">
        <h3 className="text-lg font-semibold text-olimpics-green-primary text-left">
          Informações de Pagamento
        </h3>
        <p className="text-olimpics-text">
          Você está isento da taxa de inscrição.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-olimpics-background rounded-lg border border-olimpics-green-primary/20">
      <h3 className="text-lg font-semibold text-olimpics-green-primary text-left">
        Informações de Pagamento
      </h3>
      <div className="grid gap-2 text-olimpics-text text-left">
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

      <div className="flex flex-col items-center gap-4">
        <img 
          src="/lovable-uploads/2a16c3db-40ff-4888-9796-799bf80f6748.png" 
          alt="QR Code do PIX"
          className="w-48 h-48 object-contain"
        />
        
        <Button
          onClick={handleFormClick}
          className="w-full bg-olimpics-orange-primary hover:bg-olimpics-orange-secondary text-white"
        >
          Realize o envio do comprovante
        </Button>
      </div>
    </div>
  );
};

export default PaymentInfo;
