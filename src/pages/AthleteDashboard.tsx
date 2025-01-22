import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const AthleteDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-olimpics-green-primary mb-6">
        Bem-vindo, {user?.nome_completo}!
      </h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-olimpics-green-primary">Minhas Modalidades</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Visualize suas modalidades e status de inscrição aqui.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-olimpics-green-primary">Status da Inscrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Acompanhe o status do seu cadastro e pagamento.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-olimpics-green-primary">Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Confira seus resultados nas competições quando disponíveis.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-olimpics-green-primary">Próximas Competições</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Veja o calendário das suas próximas competições.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AthleteDashboard;