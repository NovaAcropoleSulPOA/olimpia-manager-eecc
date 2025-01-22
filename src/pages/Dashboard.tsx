import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Dashboard mounted, user status:", user?.status);
    if (!loading && !user) {
      console.log("No user found, redirecting to login");
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-olimpics-background">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  if (!user) return null;

  const getStatusIcon = () => {
    switch (user.status) {
      case "aprovado":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "pendente":
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      case "rejeitado":
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (user.status) {
      case "aprovado":
        return "Seu cadastro foi aprovado. Você tem acesso completo ao sistema.";
      case "pendente":
        return "Seu cadastro está em análise. Você terá acesso completo após a aprovação.";
      case "rejeitado":
        return "Seu cadastro foi rejeitado. Entre em contato com a organização.";
      default:
        return "Status de cadastro desconhecido.";
    }
  };

  return (
    <div className="min-h-screen bg-olimpics-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-olimpics-green-primary flex items-center gap-2">
              Bem-vindo(a), {user.nome}
              {getStatusIcon()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{getStatusMessage()}</p>
            
            {user.status === "aprovado" && (
              <div className="grid gap-4 md:grid-cols-2">
                {user.roleIds?.includes(1) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Painel do Atleta</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Acesse seus detalhes de inscrição e acompanhe suas pontuações.</p>
                    </CardContent>
                  </Card>
                )}
                
                {user.roleIds?.includes(2) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Painel do Organizador</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Gerencie inscrições e pagamentos.</p>
                    </CardContent>
                  </Card>
                )}
                
                {user.roleIds?.includes(3) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Painel do Juiz</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Acesse o painel de pontuação.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}