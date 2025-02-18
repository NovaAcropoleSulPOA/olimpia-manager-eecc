
import { Button } from "@/components/ui/button";
import { PaymentFeeInfo } from "@/types/payment";

interface PaymentDetailsProps {
  paymentInfo: PaymentFeeInfo;
  onWhatsAppClick: () => void;
}

export const PaymentDetails = ({ paymentInfo, onWhatsAppClick }: PaymentDetailsProps) => {
  return (
    <div className="space-y-4 text-olimpics-text">
      {/* Profile Information */}
      {paymentInfo.perfil_nome && (
        <p className="flex items-center gap-2">
          <span className="text-lg">👤</span> Perfil: {paymentInfo.perfil_nome}
        </p>
      )}
      
      {/* Payment Information */}
      <p className="flex items-center gap-2">
        <span className="text-lg">💰</span> Valor: {paymentInfo.valor ? `R$ ${paymentInfo.valor.toFixed(2)}` : 'Não definido'}
      </p>

      {/* Payment Method */}
      {paymentInfo.pix_key && (
        <p className="flex items-center gap-2">
          <span className="text-lg">📱</span> Chave PIX: {paymentInfo.pix_key}
        </p>
      )}

      {/* Deadline */}
      {paymentInfo.data_limite_inscricao && (
        <p className="flex items-center gap-2 text-orange-600 font-medium">
          <span className="text-lg">⏰</span> Data limite para pagamento: {new Date(paymentInfo.data_limite_inscricao).toLocaleDateString('pt-BR')}
        </p>
      )}

      {/* Contact Information */}
      {(paymentInfo.contato_nome || paymentInfo.contato_telefone) && (
        <div className="mt-4 pt-4 border-t border-olimpics-green-primary/20">
          <h4 className="text-sm font-medium mb-2 text-olimpics-green-primary">Informações de Contato:</h4>
          {paymentInfo.contato_nome && paymentInfo.contato_telefone && (
            <Button
              variant="link"
              className="text-olimpics-orange-primary hover:text-olimpics-orange-secondary flex items-center gap-2 p-0 justify-start"
              onClick={onWhatsAppClick}
            >
              <span className="text-lg">📞</span> {paymentInfo.contato_nome} - {paymentInfo.contato_telefone}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
