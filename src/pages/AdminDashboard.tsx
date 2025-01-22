import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-olimpics-green-primary mb-6">
        Painel Administrativo - {user?.nome_completo}
      </h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-olimpics-green-primary">Gerenciar Inscrições</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Aprove ou rejeite inscrições pendentes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-olimpics-green-primary">Aprovação de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Verifique e aprove os comprovantes de pagamento.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-olimpics-green-primary">Configurações do Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Gerencie modalidades e configurações gerais.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-olimpics-green-primary">Relatórios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Acesse relatórios e estatísticas do evento.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;