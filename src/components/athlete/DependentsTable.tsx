
import { formatToCurrency } from "@/utils/formatters";
import { useQuery } from "@tanstack/react-query";
import { differenceInYears } from "date-fns";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Dependent {
  id: string;
  nome_completo: string;
  data_nascimento: string;
  modalidades: Array<{
    nome: string;
    valor: number;
    isento: boolean;
    status_pagamento: string;
  }>;
}

interface DependentsTableProps {
  userId: string;
  eventId: string;
}

export function DependentsTable({ userId, eventId }: DependentsTableProps) {
  const { data: dependents, isLoading } = useQuery({
    queryKey: ['dependents', userId, eventId],
    queryFn: async () => {
      console.log('Fetching dependents for user:', userId, 'event:', eventId);
      
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          id,
          nome_completo,
          data_nascimento,
          inscricoes_modalidades!inner (
            modalidade:modalidades (
              nome
            ),
            evento_id,
            status,
            modalidade_id
          ),
          pagamentos!inner (
            status,
            taxa_inscricao:taxas_inscricao (
              valor,
              isento
            )
          )
        `)
        .eq('usuario_registrador_id', userId)
        .eq('inscricoes_modalidades.evento_id', eventId)
        .eq('pagamentos.evento_id', eventId);

      if (error) {
        console.error('Error fetching dependents:', error);
        throw error;
      }

      // Transform the data to match our needs
      return (data || []).map((dependent: any) => ({
        id: dependent.id,
        nome_completo: dependent.nome_completo,
        data_nascimento: dependent.data_nascimento,
        modalidades: dependent.inscricoes_modalidades.map((inscricao: any) => ({
          nome: inscricao.modalidade.nome,
          valor: dependent.pagamentos[0]?.taxa_inscricao?.valor || 0,
          isento: dependent.pagamentos[0]?.taxa_inscricao?.isento || false,
          status_pagamento: dependent.pagamentos[0]?.status || 'pendente'
        }))
      }));
    },
    enabled: !!userId && !!eventId
  });

  if (isLoading || !dependents?.length) {
    return null;
  }

  const calculateTotal = (dependent: Dependent) => {
    return dependent.modalidades.reduce((total, mod) => {
      if (!mod.isento) {
        return total + mod.valor;
      }
      return total;
    }, 0);
  };

  const calculateTotalAmount = () => {
    return dependents.reduce((total, dependent) => {
      return total + calculateTotal(dependent);
    }, 0);
  };

  const calculateAge = (birthDate: string) => {
    return differenceInYears(new Date(), new Date(birthDate));
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Dependentes Registrados</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Idade</TableHead>
            <TableHead>Modalidades</TableHead>
            <TableHead>Status do Pagamento</TableHead>
            <TableHead className="text-right">Taxa de Inscrição</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dependents.map((dependent) => (
            <TableRow key={dependent.id}>
              <TableCell>{dependent.nome_completo}</TableCell>
              <TableCell>{calculateAge(dependent.data_nascimento)} anos</TableCell>
              <TableCell>
                <ul className="list-disc list-inside">
                  {dependent.modalidades.map((mod, index) => (
                    <li key={index}>{mod.nome}</li>
                  ))}
                </ul>
              </TableCell>
              <TableCell>
                {dependent.modalidades[0]?.status_pagamento === 'confirmado' ? (
                  <span className="text-green-600">Confirmado</span>
                ) : (
                  <span className="text-red-600">Pendente</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {dependent.modalidades[0]?.isento ? (
                  <span className="text-gray-600">Isento</span>
                ) : (
                  formatToCurrency(calculateTotal(dependent))
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption>
          <div className="flex justify-end mt-4">
            <span className="font-semibold mr-4">Total a pagar:</span>
            <span>{formatToCurrency(calculateTotalAmount())}</span>
          </div>
        </TableCaption>
      </Table>
    </div>
  );
}
