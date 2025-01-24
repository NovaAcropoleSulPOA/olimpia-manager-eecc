<lov-code>
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Trophy, DollarSign, Building } from 'lucide-react';
import { toast } from 'sonner';

interface Athlete {
  id: string;
  nome_completo: string;
  telefone: string;
  foto_perfil: string | null;
  filiais: {
    nome: string;
  };
  inscricoes: Array<{
    status: string;
    modalidade: {
      nome: string;
    };
  }>;
}

interface ModalityStats {
  name: string;
  count: number;
}

interface BranchStats {
  branch: string;
  Pendente: number;
  Confirmada: number;
  Recusada: number;
  Cancelada: number;
}

export default function OrganizerDashboard() {
  const { data: athletes, isLoading } = useQuery({
    queryKey: ['athletes'],
    queryFn: async () => {
      console.log('Fetching athletes data');
      const { data: athleteRoles, error: rolesError } = await supabase
        .from('papeis_usuarios')
        .select('usuario_id')
        .eq('perfil_id', 1); // Assuming 1 is the ID for 'Atleta' role

      if (rolesError) {
        console.error('Error fetching athlete roles:', rolesError);
        toast.error('Erro ao carregar papéis dos atletas');
        throw rolesError;
      }

     