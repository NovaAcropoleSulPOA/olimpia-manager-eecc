import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Trophy, DollarSign, Building } from 'lucide-react';
import { toast } from 'sonner';

interface Filial {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
}

interface Modalidade {
  id: number;
  nome: string;
}

interface Inscricao {
  status: 'Pendente' | 'Confirmada' | 'Recusada' | 'Cancelada';
  modalidade: Modalidade;
}

interface Athlete {
  id: string;
  nome_completo: string;
  telefone: string;
  foto_perfil: string | null;
  filial_id: string;
  filial: Filial;
  inscricoes: Inscricao[];
}

export default function OrganizerDashboard() {
  const { data: athletes, isLoading } = useQuery({
    queryKey: ['athletes'],
    queryFn: async () => {
      console.log('Fetching athletes data');
      const { data: athleteRoles, error: rolesError } = await supabase
        .from('papeis_usuarios')
        .select('usuario_id')
        .eq('perfil_id', 1);

      if (rolesError) {
        console.error('Error fetching athlete roles:', rolesError);
        toast.error('Erro ao carregar papéis dos atletas');
        throw rolesError;
      }

      const athleteIds = athleteRoles.map(role => role.usuario_id);

      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          id,
          nome_completo,
          telefone,
          foto_perfil,
          filial_id,
          filial:filiais!filial_id (
            id,
            nome,
            cidade,
            estado
          ),
          inscricoes (
            status,
            modalidade:modalidade_id (
              id,
              nome
            )
          )
        `)
        .in('id', athleteIds)
        .returns<Athlete[]>();

      if (error) {
        console.error('Error fetching athletes:', error);
        toast.error('Erro ao carregar dados dos atletas');
        throw error;
      }

      return data;
    }
  });

  const { data: modalityStats } = useQuery({
    queryKey: ['modality-stats'],
    queryFn: async () => {
      console.log('Fetching modality stats');
      const { data, error } = await supabase
        .from('inscricoes')
        .select(`
          modalidade:modalidade_id (nome),
          status
        `)
        .eq('status', 'Confirmada')
        .returns<{ modalidade: { nome: string } }[]>();

      if (error) {
        console.error('Error fetching modality stats:', error);
        throw error;
      }

      if (!data) return [];

      const stats = data.reduce((acc: Record<string, number>, curr) => {
        const modalityName = curr.modalidade?.nome;
        if (modalityName) {
          acc[modalityName] = (acc[modalityName] || 0) + 1;
        }
        return acc;
      }, {});

      return Object.entries(stats)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    }
  });

  const { data: branchStats } = useQuery({
    queryKey: ['branch-stats'],
    queryFn: async () => {
      console.log('Fetching branch stats');
      const { data, error } = await supabase
        .from('inscricoes')
        .select(`
          status,
          atleta:atleta_id (
            filial:filiais!filial_id (nome)
          )
        `)
        .returns<{ status: string; atleta: { filial: { nome: string } } }[]>();

      if (error) {
        console.error('Error fetching branch stats:', error);
        throw error;
      }

      if (!data) return [];

      const stats = data.reduce((acc: Record<string, Record<string, number>>, curr) => {
        const branchName = curr.atleta?.filial?.nome ?? 'Sem Filial';
        if (!acc[branchName]) {
          acc[branchName] = {
            Pendente: 0,
            Confirmada: 0,
            Recusada: 0,
            Cancelada: 0
          };
        }
        acc[branchName][curr.status]++;
        return acc;
      }, {});

      return Object.entries(stats).map(([branch, statuses]) => ({
        branch,
        ...statuses
      }));
    }
  });

  const confirmedCount = athletes?.reduce((acc, athlete) => {
    return acc + athlete.inscricoes.filter(insc => insc.status === 'Confirmada').length;
  }, 0) || 0;

  const totalRevenue = confirmedCount * 180;

  const uniqueBranchesCount = athletes ? new Set(athletes.map(a => a.filial?.nome)).size : 0;

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Atletas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{athletes?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inscrições Confirmadas</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalRevenue.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Sedes</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueBranchesCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Modalidades Mais Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modalityStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status por Sede</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="branch" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Confirmada" stackId="a" fill="#10B981" />
                  <Bar dataKey="Pendente" stackId="a" fill="#F59E0B" />
                  <Bar dataKey="Recusada" stackId="a" fill="#EF4444" />
                  <Bar dataKey="Cancelada" stackId="a" fill="#6B7280" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}