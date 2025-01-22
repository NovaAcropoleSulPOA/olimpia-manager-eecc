import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const JudgeDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-olimpics-green-primary mb-6">
        Painel do Juiz - {user?.nome_completo}
      </h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-olimpics-green-primary">Atletas por Modalidade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Visualize os atletas inscritos em cada modalidade.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-olimpics-green-primary">Atribuir Pontuações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Registre as pontuações dos competidores.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-olimpics-green-primary">Histórico de Avaliações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Consulte as pontuações que você já atribuiu.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JudgeDashboard;