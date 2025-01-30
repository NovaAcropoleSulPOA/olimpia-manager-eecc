import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { activateUser } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

interface AthleteRegistrationCardProps {
  registration: {
    id: string;
    nome_atleta: string;
    email: string;
    confirmado: boolean;
    telefone: string;
    filial: string;
    modalidades: Array<{
      id: string;
      modalidade: string;
      status: string;
      justificativa_status: string;
    }>;
    status_inscricao: 'pendente' | 'confirmado' | 'rejeitado' | 'cancelado';
    status_pagamento: string;
    numero_documento: string;
    tipo_documento: string;
    numero_identificador: string;
    genero: string;
  };
  onStatusChange: (modalityId: string, status: string, justification: string) => Promise<void>;
  onPaymentStatusChange: (athleteId: string, status: string) => Promise<void>;
}

export function AthleteRegistrationCard({ registration, onStatusChange, onPaymentStatusChange }: AthleteRegistrationCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleActivateUser = async () => {
    try {
      setIsLoading(true);
      await activateUser(registration.id);
      toast.success('Usuário ativado com sucesso!');
      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['athlete-registrations'] });
      await queryClient.invalidateQueries({ queryKey: ['branch-analytics'] });
    } catch (error) {
      console.error('Error activating user:', error);
      toast.error('Erro ao ativar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-500';
      case 'rejeitado':
        return 'bg-red-500';
      case 'cancelado':
        return 'bg-gray-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{registration.nome_atleta}</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{registration.filial}</Badge>
          <Badge variant={registration.status_pagamento === 'confirmado' ? 'default' : 'destructive'}>
            Pagamento {registration.status_pagamento}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm">
          <p><strong>Email:</strong> {registration.email}</p>
          <p><strong>Telefone:</strong> {registration.telefone}</p>
          <p><strong>Documento:</strong> {registration.tipo_documento} - {registration.numero_documento}</p>
          <p><strong>Identificador:</strong> {registration.numero_identificador}</p>
          <p><strong>Gênero:</strong> {registration.genero}</p>
        </div>
        {registration.modalidades.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Modalidades</h4>
            <div className="flex flex-wrap gap-2">
              {registration.modalidades.map((mod) => (
                <Badge key={mod.id} className={getStatusColor(mod.status)}>
                  {mod.modalidade}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          Ver Detalhes
        </Button>
        {!registration.confirmado && (
          <Button 
            onClick={handleActivateUser} 
            disabled={isLoading}
            className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
          >
            {isLoading ? 'Ativando...' : 'Ativar Usuário'}
          </Button>
        )}
      </CardFooter>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Atleta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Informações Pessoais</h4>
                <p><strong>Nome:</strong> {registration.nome_atleta}</p>
                <p><strong>Email:</strong> {registration.email}</p>
                <p><strong>Telefone:</strong> {registration.telefone}</p>
                <p><strong>Documento:</strong> {registration.tipo_documento} - {registration.numero_documento}</p>
                <p><strong>Identificador:</strong> {registration.numero_identificador}</p>
                <p><strong>Gênero:</strong> {registration.genero}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Informações da Inscrição</h4>
                <p><strong>Filial:</strong> {registration.filial}</p>
                <p><strong>Status do Pagamento:</strong> {registration.status_pagamento}</p>
                <p><strong>Status da Conta:</strong> {registration.confirmado ? 'Ativado' : 'Pendente'}</p>
              </div>
            </div>

            {registration.modalidades.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Modalidades Inscritas</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Modalidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Justificativa</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registration.modalidades.map((mod) => (
                      <TableRow key={mod.id}>
                        <TableCell>{mod.modalidade}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(mod.status)}>
                            {mod.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{mod.justificativa_status || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onStatusChange(mod.id, 'confirmado', '')}
                              disabled={mod.status === 'confirmado'}
                            >
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onStatusChange(mod.id, 'rejeitado', 'Não atende aos requisitos')}
                              disabled={mod.status === 'rejeitado'}
                            >
                              Rejeitar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="mt-4">
              <h4 className="font-semibold mb-2">Gerenciar Pagamento</h4>
              <div className="flex gap-2">
                <Button
                  onClick={() => onPaymentStatusChange(registration.id, 'confirmado')}
                  disabled={registration.status_pagamento === 'confirmado'}
                >
                  Confirmar Pagamento
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onPaymentStatusChange(registration.id, 'pendente')}
                  disabled={registration.status_pagamento === 'pendente'}
                >
                  Marcar como Pendente
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}