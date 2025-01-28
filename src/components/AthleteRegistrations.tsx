import React from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle2, XCircle, Clock, AlertCircle,
  Plus, Loader2
} from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export default function AthleteRegistrations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch athlete's profile to get gender
  const { data: athleteProfile } = useQuery({
    queryKey: ['athlete-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('view_perfil_atleta')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Filter modalities based on athlete's gender
  const filterModalitiesByGender = (modalities: any[]) => {
    const gender = athleteProfile?.genero?.toLowerCase();
    if (!gender) return modalities;

    return modalities.filter(modality => {
      const category = modality.categoria?.toLowerCase();
      switch (gender) {
        case 'masculino':
          return category === 'masculino' || category === 'misto';
        case 'feminino':
          return category === 'feminino' || category === 'misto';
        case 'prefiro não informar':
          return category === 'misto';
        default:
          return true;
      }
    });
  };

  // Fetch all available modalities
  const { data: allModalities, isLoading: modalitiesLoading } = useQuery({
    queryKey: ['modalities', athleteProfile?.genero],
    queryFn: async () => {
      console.log('Fetching modalities');
      const { data, error } = await supabase
        .from('modalidades')
        .select('*')
        .in('status', ['Ativa', 'Em análise']);
      
      if (error) {
        console.error('Error fetching modalities:', error);
        throw error;
      }
      
      const filteredByVacancies = data.filter(modality => 
        modality.vagas_ocupadas < modality.limite_vagas
      );

      const filteredModalities = filterModalitiesByGender(filteredByVacancies);
      
      // Sort modalities alphabetically by name
      return filteredModalities.sort((a, b) => 
        a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
      );
    },
    enabled: !!athleteProfile,
  });

  // Fetch athlete's modality registrations
  const { data: registeredModalities, isLoading: registrationsLoading } = useQuery({
    queryKey: ['athlete-modalities', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          *,
          modalidade:modalidades (
            nome,
            categoria,
            tipo_modalidade
          )
        `)
        .eq('atleta_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Mutation for withdrawing from a modality
  const withdrawMutation = useMutation({
    mutationFn: async (modalityId: number) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('inscricoes_modalidades')
        .delete()
        .eq('modalidade_id', modalityId)
        .eq('atleta_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-modalities'] });
      queryClient.invalidateQueries({ queryKey: ['modalities'] });
      toast({
        title: "Desistência confirmada",
        description: "Você desistiu da modalidade com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error withdrawing from modality:', error);
      toast({
        title: "Erro ao desistir",
        description: "Não foi possível processar sua desistência. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Mutation for registering in a modality
  const registerMutation = useMutation({
    mutationFn: async (modalityId: number) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('inscricoes_modalidades')
        .insert([{
          atleta_id: user.id,
          modalidade_id: modalityId,
          status: 'pendente',
          data_inscricao: new Date().toISOString()
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-modalities'] });
      queryClient.invalidateQueries({ queryKey: ['modalities'] });
      toast({
        title: "Inscrição realizada",
        description: "Você se inscreveu na modalidade com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error registering for modality:', error);
      toast({
        title: "Erro na inscrição",
        description: "Não foi possível processar sua inscrição. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  if (modalitiesLoading || registrationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Minhas Inscrições</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modalidade</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Inscrição</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registeredModalities?.map((registration) => (
                <TableRow key={registration.modalidade_id}>
                  <TableCell>{registration.modalidade?.nome}</TableCell>
                  <TableCell className="capitalize">{registration.modalidade?.tipo_modalidade}</TableCell>
                  <TableCell className="capitalize">{registration.modalidade?.categoria}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getModalityStatusIcon(registration.status)}
                      <span className="capitalize">{registration.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(registration.data_inscricao), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={registration.status !== 'pendente' || withdrawMutation.isPending}
                      onClick={() => withdrawMutation.mutate(registration.modalidade_id)}
                    >
                      {withdrawMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        "Desistir"
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-8">
            <CardTitle className="mb-4">Modalidades Disponíveis</CardTitle>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modalidade</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allModalities?.map((modality) => {
                  const isRegistered = registeredModalities?.some(
                    reg => reg.modalidade_id === modality.id
                  );

                  if (isRegistered) return null;

                  return (
                    <TableRow key={modality.id}>
                      <TableCell>{modality.nome}</TableCell>
                      <TableCell className="capitalize">{modality.tipo_modalidade}</TableCell>
                      <TableCell className="capitalize">{modality.categoria}</TableCell>
                      <TableCell>
                        <Button
                          variant="default"
                          size="sm"
                          disabled={registerMutation.isPending}
                          onClick={() => registerMutation.mutate(modality.id)}
                        >
                          {registerMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processando...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
                              Inscrever
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}