import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Payment {
  id: number;
  atleta_id: string;
  valor: number;
  status: 'pendente' | 'confirmado' | 'cancelado';
  data_criacao: string;
  data_validacao?: string;
  usuario: {
    nome_completo: string;
    email: string;
  };
}

export default function PaymentManagement() {
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: payments, isLoading, refetch } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pagamentos')
        .select(`
          *,
          usuario:atleta_id (
            nome_completo,
            email
          )
        `)
        .order('data_criacao', { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
  });

  const updatePaymentStatus = async (paymentId: number, newStatus: Payment['status']) => {
    try {
      setIsUpdating(true);
      console.log(`Updating payment ${paymentId} to status: ${newStatus}`);

      const { data, error } = await supabase
        .from('pagamentos')
        .update({ 
          status: newStatus,
          data_validacao: newStatus === 'confirmado' ? new Date().toISOString() : null
        })
        .eq('id', paymentId)
        .select('atleta_id')
        .single();

      if (error) throw error;

      // Update user confirmation status based on payment status
      const { error: userError } = await supabase
        .from('usuarios')
        .update({ 
          confirmado: newStatus === 'confirmado'
        })
        .eq('id', data.atleta_id);

      if (userError) throw userError;

      toast.success('Status do pagamento atualizado com sucesso!');
      refetch();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Erro ao atualizar status do pagamento');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-olimpics-green-primary">
        Gerenciamento de Pagamentos
      </h2>
      
      <div className="grid gap-4">
        {payments?.map((payment) => (
          <Card key={payment.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{payment.usuario.nome_completo}</span>
                {payment.status === 'confirmado' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {payment.status === 'cancelado' && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                {payment.status === 'pendente' && (
                  <Clock className="h-5 w-5 text-yellow-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Email: {payment.usuario.email}
                </p>
                <p className="text-sm text-gray-600">
                  Valor: R$ {payment.valor.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  Status: {payment.status}
                </p>
                <div className="flex gap-2 mt-4">
                  {payment.status !== 'confirmado' && (
                    <Button
                      onClick={() => updatePaymentStatus(payment.id, 'confirmado')}
                      disabled={isUpdating}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Confirmar'
                      )}
                    </Button>
                  )}
                  {payment.status !== 'cancelado' && (
                    <Button
                      onClick={() => updatePaymentStatus(payment.id, 'cancelado')}
                      disabled={isUpdating}
                      variant="destructive"
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Cancelar'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}