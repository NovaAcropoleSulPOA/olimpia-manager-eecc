
import React from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Info, Loader2, ChevronDown, ChevronUp, UserPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import AthleteSchedule from "@/components/AthleteSchedule";
import { EnrollmentList } from "./enrollment/EnrollmentList";
import { AvailableModalities } from "./enrollment/AvailableModalities";

interface Modality {
  id: number;
  nome: string;
  categoria?: string;
  tipo_modalidade: string;
  vagas_ocupadas: number;
  limite_vagas: number;
  grupo?: string;
  faixa_etaria: string;
}

export default function AthleteRegistrations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEnrollmentsOpen, setIsEnrollmentsOpen] = React.useState(true);
  const currentEventId = localStorage.getItem('currentEventId');

  const { data: athleteProfile } = useQuery({
    queryKey: ['athlete-profile', user?.id, currentEventId],
    queryFn: async () => {
      if (!user?.id || !currentEventId) return null;
      console.log('Fetching athlete profile for user:', user.id, 'event:', currentEventId);
      
      const { data, error } = await supabase
        .from('view_perfil_atleta')
        .select('*')
        .eq('atleta_id', user.id)
        .eq('evento_id', currentEventId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching athlete profile:', error);
        throw error;
      }
      return data;
    },
    enabled: !!user?.id && !!currentEventId,
  });

  const getAgeGroup = (birthDate: string | null): 'infantil' | 'adulto' | 'all' => {
    if (!birthDate) return 'all';
    
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    
    // Adjust age if birthday hasn't occurred this year
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 < 15 ? 'infantil' : 'adulto';
    }
    
    return age < 15 ? 'infantil' : 'adulto';
  };

  const filterModalitiesByGender = (modalities: Modality[] | null | undefined) => {
    const gender = athleteProfile?.genero?.toLowerCase();
    if (!gender || !Array.isArray(modalities)) return [];

    // Get age group based on birth date
    const ageGroup = getAgeGroup(athleteProfile?.data_nascimento);
    console.log('User age group:', ageGroup);

    return modalities.filter(modality => {
      // First filter by gender
      const category = modality.categoria?.toLowerCase();
      const genderMatch = gender === 'masculino' ? 
        (category === 'masculino' || category === 'misto') :
        gender === 'feminino' ? 
          (category === 'feminino' || category === 'misto') : 
          true;

      // Then filter by age group
      const ageMatch = ageGroup === 'all' ? true : modality.faixa_etaria === ageGroup;

      return genderMatch && ageMatch;
    });
  };

  const { data: registeredModalities, isLoading: registrationsLoading } = useQuery({
    queryKey: ['athlete-modalities', user?.id, currentEventId],
    queryFn: async () => {
      if (!user?.id || !currentEventId) return [];
      console.log('Fetching modalities for athlete:', user.id, 'event:', currentEventId);
      
      const { data, error } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          id,
          status,
          data_inscricao,
          modalidade:modalidades (
            nome,
            categoria,
            tipo_modalidade
          )
        `)
        .eq('atleta_id', user.id)
        .eq('evento_id', currentEventId);
      
      if (error) {
        console.error('Error fetching athlete modalities:', error);
        throw error;
      }

      console.log('Retrieved athlete modalities:', data);
      return data;
    },
    enabled: !!user?.id && !!currentEventId,
  });

  const { data: allModalities, isLoading: modalitiesLoading } = useQuery({
    queryKey: ['modalities', athleteProfile?.genero, athleteProfile?.data_nascimento],
    queryFn: async () => {
      console.log('Fetching modalities');
      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, categoria, tipo_modalidade, vagas_ocupadas, limite_vagas, grupo, faixa_etaria, status')
        .eq('evento_id', currentEventId)
        .in('status', ['Ativa', 'Em análise']);
      
      if (error) {
        console.error('Error fetching modalities:', error);
        throw error;
      }
      
      // Remove any duplicates by ID
      const uniqueModalities = Array.from(
        new Map(data.map(item => [item.id, item])).values()
      );
      
      console.log('Total modalities before filtering:', uniqueModalities.length);
      
      const filteredByVacancies = uniqueModalities.filter(modality => 
        modality.vagas_ocupadas < modality.limite_vagas
      );

      const filteredModalities = filterModalitiesByGender(filteredByVacancies);
      console.log('Total modalities after filtering:', filteredModalities.length);
      
      return filteredModalities.sort((a, b) => {
        if (a.grupo === b.grupo) {
          return a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' });
        }
        return (a.grupo || '').localeCompare(b.grupo || '', 'pt-BR', { sensitivity: 'base' });
      });
    },
    enabled: !!athleteProfile && !!currentEventId,
  });

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
      queryClient.invalidateQueries({ queryKey: ['personal-schedule-activities'] });
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

  const registerMutation = useMutation({
    mutationFn: async (modalityId: number) => {
      if (!user?.id || !currentEventId) throw new Error('User not authenticated or no event selected');
      
      const { error } = await supabase
        .from('inscricoes_modalidades')
        .insert([{
          atleta_id: user.id,
          modalidade_id: modalityId,
          evento_id: currentEventId, // Add the event_id here
          status: 'pendente',
          data_inscricao: new Date().toISOString()
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-modalities'] });
      queryClient.invalidateQueries({ queryKey: ['modalities'] });
      queryClient.invalidateQueries({ queryKey: ['personal-schedule-activities'] });
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  const groupedModalities = allModalities?.reduce((groups: Record<string, any[]>, modality) => {
    const grupo = modality.grupo || 'Outras Modalidades';
    if (!groups[grupo]) {
      groups[grupo] = [];
    }
    groups[grupo].push(modality);
    return groups;
  }, {});

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      <Alert className="bg-olimpics-green-primary/10 border-olimpics-green-primary text-olimpics-text shadow-sm transition-all duration-200 hover:bg-olimpics-green-primary/15">
        <Info className="h-5 w-5 text-olimpics-green-primary" />
        <AlertDescription className="text-sm">
          As inscrições nas modalidades devem ser realizadas nesta página! Após a confirmação da inscrição em uma modalidade pelo Representante de Delegação, o atleta não poderá cancelar sua participação nesta modalidade diretamente pelo sistema. Caso seja necessário cancelar uma inscrição já aprovada, o atleta deverá entrar em contato com o seu respectivo Representante de Delegação para solicitar qualquer alteração.
        </AlertDescription>
      </Alert>
      
      <Collapsible
        open={isEnrollmentsOpen}
        onOpenChange={setIsEnrollmentsOpen}
        className="w-full space-y-4"
      >
        <div className="relative overflow-hidden rounded-lg bg-[#FEF7CD] p-1 animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-olimpics-green-primary/5 to-olimpics-green-secondary/5" />
          <Card className="transition-all duration-300 hover:shadow-xl border-2 border-olimpics-green-primary/20 bg-white/95 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <div className="flex items-center gap-3">
                <UserPlus className="h-6 w-6 text-olimpics-green-primary animate-pulse" />
                <CardTitle className="text-2xl font-bold text-olimpics-text flex items-center gap-2">
                  Área de Inscrições
                  <span className="text-sm font-normal text-gray-500">
                    ({registeredModalities?.length || 0} modalidades)
                  </span>
                </CardTitle>
              </div>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-9 p-0 hover:bg-olimpics-green-primary/10"
                >
                  {isEnrollmentsOpen ? (
                    <ChevronUp className="h-4 w-4 text-olimpics-text" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-olimpics-text" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent className="transition-all duration-300">
              <CardContent>
                <div className="mb-6 text-center">
                  <h3 className="text-lg font-semibold text-olimpics-green-primary mb-2">
                    Inscreva-se Agora nas Modalidades Olímpicas!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Escolha suas modalidades e faça parte desta celebração do esporte e filosofia
                  </p>
                </div>

                <EnrollmentList
                  registeredModalities={registeredModalities || []}
                  withdrawMutation={withdrawMutation}
                />

                <AvailableModalities
                  groupedModalities={groupedModalities || {}}
                  registeredModalities={registeredModalities || []}
                  registerMutation={registerMutation}
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </div>
      </Collapsible>

      <AthleteSchedule />

    </div>
  );
}
