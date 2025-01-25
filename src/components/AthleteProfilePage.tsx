import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  User, MapPin, Phone, Mail, CreditCard, 
  Building2, Calendar, FileText, UserCircle 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AthleteProfile {
  atleta_id: string;
  nome_completo: string;
  telefone: string;
  email: string;
  numero_identificador: string;
  tipo_documento: string;
  numero_documento: string;
  genero: string;
  status_confirmacao: boolean;
  filial_id: string;
  filial_nome: string;
  filial_cidade: string;
  filial_estado: string;
  pagamento_valor: number;
  pagamento_status: string;
  data_validacao: string | null;
  pagamento_data_criacao: string;
}

export default function AthleteProfilePage() {
  const { user } = useAuth();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['athlete-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.warn("User ID is missing, skipping API call.");
        return null;
      }

      console.log('Fetching athlete profile for user:', user.id);

      const { data, error } = await supabase
        .from('view_perfil_atleta')
        .select('*')
        .eq('atleta_id', user.id) // 🔥 Passando o ID do usuário autenticado corretamente
        .maybeSingle(); // Retorna null se não encontrar o usuário

      if (error) {
        console.error('Error fetching athlete profile:', error);
        throw error;
      }

      console.log('Fetched athlete profile:', data);
      return data as AthleteProfile | null;
    },
    enabled: !!user?.id, // Evita que a query rode sem um usuário logado
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Erro ao carregar perfil: {error.message}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Perfil não encontrado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-xl font-bold">{profile.nome_completo}</h1>
        <p>Email: {profile.email}</p>
        <p>Telefone: {profile.telefone}</p>
        <p>
          Filial: {profile.filial_nome} - {profile.filial_cidade}/{profile.filial_estado}
        </p>
        <p className={`font-semibold ${profile.pagamento_status === 'confirmado' ? 'text-green-600' : 'text-red-600'}`}>
          Pagamento: {profile.pagamento_status} ({profile.pagamento_valor} BRL)
        </p>
      </div>
    </div>
  );
}

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'confirmado':
      return 'text-green-600 bg-green-100';
    case 'pendente':
      return 'text-yellow-600 bg-yellow-100';
    case 'cancelado':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

return (
  <div className="container mx-auto py-6 space-y-6">
    <h1 className="text-2xl font-bold text-olimpics-green-primary">
      Perfil do Atleta
    </h1>

    <div className="grid gap-6 md:grid-cols-2">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4 mb-6">
            <div className="h-24 w-24 rounded-full bg-olimpics-green-primary/10 flex items-center justify-center">
              <User className="h-12 w-12 text-olimpics-green-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">{profile.nome_completo}</h3>
              <p className="text-sm text-muted-foreground">
                ID: {profile.numero_identificador}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UserCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {profile.genero || 'Não informado'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {profile.tipo_documento}: {profile.numero_documento}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{profile.telefone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{profile.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branch Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Filial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{profile.filial_nome}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {profile.filial_cidade}, {profile.filial_estado}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Informações de Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Valor: R$ {profile.pagamento_valor.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(profile.pagamento_status)}`}>
                  {profile.pagamento_status.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Data de Criação:{' '}
                  {format(new Date(profile.pagamento_data_criacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </div>
              {profile.data_validacao && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Data de Validação:{' '}
                    {format(new Date(profile.data_validacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);
