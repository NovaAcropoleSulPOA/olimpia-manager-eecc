
import CopyableCode from "@/components/CopyableCode";
import { PaymentFeeInfo } from "@/types/payment";

interface QRCodeSectionProps {
  paymentInfo: PaymentFeeInfo;
}

export const QRCodeSection = ({ paymentInfo }: QRCodeSectionProps) => {
  console.log('QRCodeSection props:', {
    has_qr_image: !!paymentInfo.qr_code_image,
    has_qr_code: !!paymentInfo.qr_code_codigo
  });

  if (!paymentInfo.qr_code_image && !paymentInfo.qr_code_codigo) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-olimpics-text text-center">
          QR Code para pagamento ainda não disponível.
          {paymentInfo.pix_key && (
            <span className="block mt-2">
              Por favor, utilize a chave PIX fornecida.
            </span>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h3 className="text-lg font-semibold text-olimpics-green-primary text-center">
        Aponte a câmera do celular para o Código QR e obtenha todos os detalhes do pagamento
      </h3>
      {paymentInfo.qr_code_image && (
        <img
          src={paymentInfo.qr_code_image}
          alt="QR Code do PIX"
          className="w-64 h-64 object-contain bg-white p-2 rounded-lg shadow-sm"
        />
      )}
      {paymentInfo.qr_code_codigo && (
        <>
          <h3 className="text-lg font-semibold text-olimpics-green-primary text-center">
            ... ou copie o código abaixo:
          </h3>
          <CopyableCode code={paymentInfo.qr_code_codigo} />
        </>
      )}
    </div>
  );
};
