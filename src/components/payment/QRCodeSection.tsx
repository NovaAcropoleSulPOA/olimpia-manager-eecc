
import CopyableCode from "@/components/CopyableCode";
import { PaymentFeeInfo } from "@/types/payment";

interface QRCodeSectionProps {
  paymentInfo: PaymentFeeInfo;
}

export const QRCodeSection = ({ paymentInfo }: QRCodeSectionProps) => {
  return (
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
  );
};
