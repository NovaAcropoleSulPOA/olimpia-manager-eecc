
import { Button } from "@/components/ui/button";
import { PaymentFeeInfo } from "@/types/payment";

interface PaymentDetailsProps {
  paymentInfo: PaymentFeeInfo;
  onWhatsAppClick: () => void;
}

export const PaymentDetails = ({ paymentInfo, onWhatsAppClick }: PaymentDetailsProps) => {
  return (
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
          onClick={onWhatsAppClick}
        >
          <span className="text-lg">📞</span> Contato: {paymentInfo.contato_nome} - {paymentInfo.contato_telefone}
        </Button>
      )}
    </div>
  );
};
