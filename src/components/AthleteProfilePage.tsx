import React from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, MapPin, Phone, Mail, CreditCard, 
  Building2, Calendar, FileText, UserCircle,
  CheckCircle2, XCircle, Clock, AlertCircle,
  Plus, Loader2
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
  categoria: 'misto' | 'masculino' | 'feminino';
  vagas_ocupadas: number;
  limite_vagas: number;
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch athlete profile
  const { data: profile, isLoading: profileLoading } = useQuery({
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

  // Fetch all available modalities with category filtering and vacancy information
  const { data: allModalities, isLoading: modalitiesLoading } = useQuery({
    queryKey: ['modalities'],
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
      
      console.log('Fetched modalities:', data);
      // Filter modalities with available spots in JavaScript
      return data.filter(modality => 
        modality.vagas_ocupadas < modality.limite_vagas
      );
    }
  });

  // Fetch athlete's modality registrations
  const { data: registeredModalities, isLoading: registrationsLoading } = useQuery({
    queryKey: ['athlete-modalities', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      console.log('Fetching athlete modalities for user:', user.id);
      const { data, error } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          *,
          modalidade:modalidades (
            nome,
            categoria,
            limite_vagas,
            vagas_ocupadas
          )
        `)
        .eq('atleta_id', user.id);
      
      if (error) {
        console.error('Error fetching athlete modalities:', error);
        throw error;
      }
      
      console.log('Fetched athlete modalities:', data);
      return data;
    },
    enabled: !!user?.id,
  });

  // Calculate registration statistics with better organization
  const registrationStats = React.useMemo(() => {
    if (!registeredModalities) return { total: 0, confirmed: 0, pending: 0, canceled: 0, rejected: 0 };
    
    return registeredModalities.reduce((acc, reg) => {
      acc.total++;
      switch(reg.status.toLowerCase()) {
        case 'confirmado':
          acc.confirmed++;
          break;
        case 'pendente':
          acc.pending++;
          break;
        case 'cancelado':
          acc.canceled++;
          break;
        case 'rejeitado':
          acc.rejected++;
          break;
      }
      return acc;
    }, { total: 0, confirmed: 0, pending: 0, canceled: 0, rejected: 0 });
  }, [registeredModalities]);

  // Filter modalities based on athlete's gender and available spots
  const filteredModalities = React.useMemo(() => {
    if (!allModalities || !profile) return [];
    
    const allowedCategories = ['misto'];
    if (profile.genero?.toLowerCase() === 'masculino') {
      allowedCategories.push('masculino');
    } else if (profile.genero?.toLowerCase() === 'feminino') {
      allowedCategories.push('feminino');
    }
    
    return allModalities.filter(modality => 
      allowedCategories.includes(modality.categoria?.toLowerCase()) &&
      modality.vagas_ocupadas < modality.limite_vagas
    );
  }, [allModalities, profile]);

  // Mutation for withdrawing from a modality
  const withdrawMutation = useMutation({
    mutationFn: async (modalityId: number) => {
      console.log('Withdrawing from modality:', modalityId);
      if (!user?.id) throw new Error('User not authenticated');
      
      const registration = registeredModalities?.find(
        reg => reg.modalidade_id === modalityId
      );

      // If the registration was pending or confirmed, decrement vagas_ocupadas
      if (registration?.status === 'pendente' || registration?.status === 'confirmado') {
        const { data: modalityData, error: fetchError } = await supabase
          .from('modalidades')
          .select('vagas_ocupadas')
          .eq('id', modalityId)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching modality:', fetchError);
          throw new Error('Failed to fetch modality data');
        }

        if (!modalityData) {
          console.error('Modality not found:', modalityId);
          throw new Error('Modality not found');
        }

        if (modalityData.vagas_ocupadas > 0) {
          const { error: updateError } = await supabase
            .from('modalidades')
            .update({ 
              vagas_ocupadas: modalityData.vagas_ocupadas - 1
            })
            .eq('id', modalityId);

          if (updateError) {
            console.error('Error updating vacancy count:', updateError);
            throw new Error('Failed to update vacancy count');
          }
        }
      }
      
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
        variant: "default",
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
      
      // Get current modality data
      const { data: modalityData, error: fetchError } = await supabase
        .from('modalidades')
        .select('vagas_ocupadas, limite_vagas')
        .eq('id', modalityId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching modality:', fetchError);
        throw new Error('Failed to fetch modality data');
      }

      if (!modalityData) {
        console.error('Modality not found:', modalityId);
        throw new Error('Modality not found');
      }
      
      // Check if there are available spots
      if (modalityData.vagas_ocupadas >= modalityData.limite_vagas) {
        throw new Error('No available spots');
      }

      // Update vagas_ocupadas
      const { error: updateError } = await supabase
        .from('modalidades')
        .update({ 
          vagas_ocupadas: modalityData.vagas_ocupadas + 1
        })
        .eq('id', modalityId);

      if (updateError) {
        console.error('Error updating vacancy count:', updateError);
        throw new Error('Failed to update vacancy count');
      }

      const { error: insertError } = await supabase
        .from('inscricoes_modalidades')
        .insert([{
          atleta_id: user.id,
          modalidade_id: modalityId,
          status: 'pendente',
          data_inscricao: new Date().toISOString()
        }]);
      
      if (insertError) {
        // Rollback the vacancy count if inscription fails
        const { error: rollbackError } = await supabase
          .from('modalidades')
          .update({ 
            vagas_ocupadas: modalityData.vagas_ocupadas
          })
          .eq('id', modalityId);

        if (rollbackError) {
          console.error('Error rolling back vacancy count:', rollbackError);
        }
        throw new Error('Failed to register for modality');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-modalities'] });
      queryClient.invalidateQueries({ queryKey: ['modalities'] });
      toast({
        title: "Inscrição realizada",
        description: "Você se inscreveu na modalidade com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Error registering for modality:', error);
      toast({
        title: "Erro na inscrição",
        description: error.message === 'No available spots' 
          ? "Não há vagas disponíveis nesta modalidade."
          : error.message === 'Modality not found'
          ? "Modalidade não encontrada."
          : "Não foi possível processar sua inscrição. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  if (profileLoading || modalitiesLoading || registrationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Perfil não encontrado</p>
      </div>
    );
  }

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

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            {/* Updated Registration Statistics with better visual styling */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="flex flex-col items-center justify-center p-4 bg-olimpics-green-primary/10 rounded-lg">
                  <FileText className="h-8 w-8 text-olimpics-green-primary mb-2" />
                  <span className="text-2xl font-bold text-olimpics-green-primary">
                    {registrationStats.total}
                  </span>
                  <span className="text-sm text-gray-600">Total de Inscrições</span>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
                  <span className="text-2xl font-bold text-green-600">
                    {registrationStats.confirmed}
                  </span>
                  <span className="text-sm text-gray-600">Confirmadas</span>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-yellow-100 rounded-lg">
                  <Clock className="h-8 w-8 text-yellow-600 mb-2" />
                  <span className="text-2xl font-bold text-yellow-600">
                    {registrationStats.pending}
                  </span>
                  <span className="text-sm text-gray-600">Pendentes</span>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-red-100 rounded-lg">
                  <XCircle className="h-8 w-8 text-red-600 mb-2" />
                  <span className="text-2xl font-bold text-red-600">
                    {registrationStats.canceled}
                  </span>
                  <span className="text-sm text-gray-600">Canceladas</span>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-gray-600 mb-2" />
                  <span className="text-2xl font-bold text-gray-600">
                    {registrationStats.rejected}
                  </span>
                  <span className="text-sm text-gray-600">Rejeitadas</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-olimpics-green-primary">
                Modalidades Disponíveis
              </h3>
            </div>
            
            <Tabs defaultValue="todos" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="todos">Minhas Inscrições</TabsTrigger>
                {profile?.genero?.toLowerCase() !== 'feminino' && (
                  <TabsTrigger value="masculino">Masculino</TabsTrigger>
                )}
                {profile?.genero?.toLowerCase() !== 'masculino' && (
                  <TabsTrigger value="feminino">Feminino</TabsTrigger>
                )}
                <TabsTrigger value="misto">Misto</TabsTrigger>
              </TabsList>

              {['todos', 'masculino', 'feminino', 'misto'].map((category) => (
                <TabsContent key={category} value={category}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Modalidade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Vagas</TableHead>
                        <TableHead>Data de Inscrição</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(category === 'todos' 
                        ? registeredModalities || []
                        : filteredModalities.filter(modality => 
                            modality.categoria?.toLowerCase() === category
                          )
                      ).map((item) => {
                        const modality = category === 'todos'
                          ? allModalities?.find(m => m.id === item.modalidade_id)
                          : item;
                        
                        const registration = registeredModalities?.find(
                          reg => reg.modalidade_id === (category === 'todos' ? item.modalidade_id : item.id)
                        );
                        
                        if (!modality) return null;
                        
                        const availableSpots = modality.limite_vagas - modality.vagas_ocupadas;
                        
                        return (
                          <TableRow key={modality.id}>
                            <TableCell>{modality.nome}</TableCell>
                            <TableCell>
                              {registration ? (
                                <div className="flex items-center gap-2">
                                  {getModalityStatusIcon(registration.status)}
                                  <span className="capitalize">{registration.status}</span>
                                </div>
                              ) : (
                                <span className="text-gray-500">Não inscrito</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className={availableSpots === 0 ? "text-red-500" : "text-green-600"}>
                                {availableSpots} disponíveis
                              </span>
                            </TableCell>
                            <TableCell>
                              {registration?.data_inscricao ? 
                                format(new Date(registration.data_inscricao), "dd/MM/yyyy") :
                                "-"
                              }
                            </TableCell>
                            <TableCell>
                              {registration ? (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={registration.status !== 'pendente' || 
                                          withdrawMutation.isPending}
                                  onClick={() => withdrawMutation.mutate(modality.id)}
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
                              ) : (
                                <Button
                                  variant="default"
                                  size="sm"
                                  disabled={registerMutation.isPending || availableSpots <= 0}
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
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {(modalitiesLoading || registrationsLoading) && (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
