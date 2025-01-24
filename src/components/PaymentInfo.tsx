import { Card } from "./ui/card";

const PaymentInfo = () => {
  return (
    <Card className="p-4 bg-olimpics-orange-primary/10 border-olimpics-orange-primary/20">
      <h3 className="text-lg font-semibold mb-2 text-olimpics-orange-primary">Informações de Pagamento</h3>
      <p className="text-sm text-gray-600">
        Valor da inscrição: <span className="font-semibold">R$ 180,00</span>
      </p>
      <p className="text-xs text-gray-500 mt-2">
        O pagamento deverá ser realizado via PIX após o cadastro.
      </p>
    </Card>
  );
};

export default PaymentInfo;