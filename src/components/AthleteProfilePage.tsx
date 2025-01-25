import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  User, MapPin, Phone, Mail, CreditCard, 
  Building2, Calendar, FileText, UserCircle,
  CheckCircle2, XCircle, Clock, AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface Modality {
  id: number;
  nome: string;
  status: 'pendente' | 'confirmado' | 'rejeitado' | 'cancelado';
  data_inscricao: string;
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

const getModalityStatusIcon = (status: string) => {
  switch (status) {
    case 'confirmado':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'rejeitado':
      return <XCircle className="h-5 w-5 text-red-600" />;
    case 'pendente':
      return <Clock className="h-5 w-5 text-yellow-600" />;
    case 'cancelado':
      return <AlertCircle className="h-5 w-5 text-gray-600" />;
    default:
      return null;
  }
};

const getProfileImage = (gender: string) => {
  switch (gender?.toLowerCase()) {
    case 'masculino':
      return "/lovable-uploads/71dd91ef-fe30-4b2b-9292-5c7ecebb1b69.png";
    case 'feminino':
      return "/lovable-uploads/781f97ba-e496-4392-92b0-8ea401f0aa3e.png";
    default:
      return "/lovable-uploads/7f5d4c54-bc15-4310-ac7a-ecd055bda99b.png";
  }
};

export default function AthleteProfilePage() {
  const { user } = useAuth();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['athlete-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('view_perfil_atleta')
        .select('*')
        .eq('atleta_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as AthleteProfile;
    },
    enabled: !!user?.id,
  });

  // Mock data for modalities - replace with actual API call
  const modalities: Modality[] = [
    { id: 1, nome: "Corrida 100m", status: "pendente", data_inscricao: "2024-03-10" },
    { id: 2, nome: "Salto em Distância", status: "confirmado", data_inscricao: "2024-03-09" },
    { id: 3, nome: "Arremesso de Peso", status: "rejeitado", data_inscricao: "2024-03-08" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">
          {error ? `Erro ao carregar perfil: ${error.message}` : 'Perfil não encontrado'}
        </p>
      </div>
    );
  }

  const handleWithdraw = (modalityId: number) => {
    console.log('Withdrawing from modality:', modalityId);
    // Implement withdrawal logic here
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-12 gap-6">
            {/* Profile Image and ID Section */}
            <div className="md:col-span-3 flex flex-col items-center space-y-4">
              <img
                src={getProfileImage(profile.genero)}
                alt="Profile"
                className="w-48 h-48 rounded-full object-cover border-4 border-olimpics-green-primary"
              />
              <div className="text-center">
                <div className="bg-olimpics-green-primary text-white px-4 py-2 rounded-lg shadow-lg">
                  <p className="text-sm font-medium">ID DO ATLETA</p>
                  <p className="text-xl font-bold">{profile.numero_identificador}</p>
                </div>
              </div>
            </div>

            {/* Main Information Section */}
            <div className="md:col-span-9 grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-olimpics-green-primary">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </h3>
                <div className="space-y-3">
                  <p className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.nome_completo}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.tipo_documento}: {profile.numero_documento}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.telefone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.email}</span>
                  </p>
                </div>
              </div>

              {/* Branch and Payment Information */}
              <div className="space-y-4">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-olimpics-green-primary">
                    <Building2 className="h-5 w-5" />
                    Informações da Filial
                  </h3>
                  <div className="mt-2 space-y-2">
                    <p className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profile.filial_nome}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profile.filial_cidade}, {profile.filial_estado}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-olimpics-green-primary">
                    <CreditCard className="h-5 w-5" />
                    Informações de Pagamento
                  </h3>
                  <div className="mt-2 space-y-2">
                    <p className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">R$ {profile.pagamento_valor.toFixed(2)}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(profile.pagamento_status)}`}>
                        {profile.pagamento_status.toUpperCase()}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(profile.pagamento_data_criacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modalities Table */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-olimpics-green-primary">
            Modalidades Inscritas
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modalidade</TableHead>
                <TableHead>Data de Inscrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modalities.map((modality) => (
                <TableRow key={modality.id}>
                  <TableCell>{modality.nome}</TableCell>
                  <TableCell>
                    {format(new Date(modality.data_inscricao), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getModalityStatusIcon(modality.status)}
                      <span className="capitalize">{modality.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={modality.status !== 'pendente'}
                      onClick={() => handleWithdraw(modality.id)}
                    >
                      Desistir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}