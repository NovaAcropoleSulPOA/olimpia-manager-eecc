
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; 
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AthleteScoreFormProps {
  athleteId: string;
  modalityId: number;
  eventId: string | null;
  judgeId: string;
}

// Form schema
const scoreFormSchema = z.object({
  score: z.coerce.number()
    .min(0, 'A pontuação não pode ser negativa')
    .max(10000, 'Pontuação máxima excedida'),
  position: z.coerce.number()
    .min(1, 'A posição deve ser um número positivo')
    .max(1000, 'Posição máxima excedida'),
  medal: z.enum(['Ouro', 'Prata', 'Bronze', '']).optional(),
  unit: z.string().min(1, 'A unidade de medida é obrigatória'),
  batch: z.string().optional(),
  observations: z.string().optional(),
});

type ScoreFormValues = z.infer<typeof scoreFormSchema>;

export function AthleteScoreForm({ 
  athleteId, 
  modalityId, 
  eventId, 
  judgeId 
}: AthleteScoreFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch athlete details
  const { data: athlete, isLoading: isLoadingAthlete } = useQuery({
    queryKey: ['athlete', athleteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome_completo, email, telefone, filial_id, filiais(nome)')
        .eq('id', athleteId)
        .single();
      
      if (error) {
        console.error('Error fetching athlete:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!athleteId,
  });

  // Fetch existing score for this athlete in this modality
  const { data: existingScore, isLoading: isLoadingScore } = useQuery({
    queryKey: ['athleteScore', athleteId, modalityId, eventId],
    queryFn: async () => {
      if (!eventId) return null;
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('*')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('atleta_id', athleteId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching score:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!athleteId && !!modalityId && !!eventId,
  });

  // Set up the form with default values from existing score
  const form = useForm<ScoreFormValues>({
    resolver: zodResolver(scoreFormSchema),
    defaultValues: {
      score: existingScore?.valor_pontuacao || 0,
      position: existingScore?.posicao_final || 0,
      medal: (existingScore?.medalha as 'Ouro' | 'Prata' | 'Bronze' | '') || '',
      unit: existingScore?.unidade || 'pontos',
      batch: existingScore?.bateria || '',
      observations: existingScore?.observacoes || '',
    },
  });

  // Update form values when existing score loads
  React.useEffect(() => {
    if (existingScore) {
      form.reset({
        score: existingScore.valor_pontuacao || 0,
        position: existingScore.posicao_final || 0,
        medal: (existingScore.medalha as 'Ouro' | 'Prata' | 'Bronze' | '') || '',
        unit: existingScore.unidade || 'pontos',
        batch: existingScore.bateria || '',
        observations: existingScore.observacoes || '',
      });
    }
  }, [existingScore, form]);

  // Submit score mutation
  const submitScoreMutation = useMutation({
    mutationFn: async (values: ScoreFormValues) => {
      if (!eventId) throw new Error('Evento não selecionado');
      
      const medal = values.medal === '' ? null : values.medal;
      
      // Check medal-position consistency
      if (medal === 'Ouro' && values.position !== 1) {
        throw new Error('A medalha de Ouro só pode ser atribuída à posição 1');
      } else if (medal === 'Prata' && values.position !== 2) {
        throw new Error('A medalha de Prata só pode ser atribuída à posição 2');
      } else if (medal === 'Bronze' && values.position !== 3) {
        throw new Error('A medalha de Bronze só pode ser atribuída à posição 3');
      }
      
      const { data, error } = await supabase.rpc('register_score', {
        p_evento_id: eventId,
        p_modalidade_id: modalityId,
        p_atleta_id: athleteId,
        p_juiz_id: judgeId,
        p_valor_pontuacao: values.score,
        p_posicao_final: values.position,
        p_medalha: medal,
        p_unidade: values.unit,
        p_bateria: values.batch || null,
        p_observacoes: values.observations || null
      });
      
      if (error) {
        console.error('Error saving score:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Pontuação registrada',
        description: 'A pontuação foi salva com sucesso!'
      });
      queryClient.invalidateQueries({ queryKey: ['athleteScore', athleteId, modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['scores', modalityId, eventId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar a pontuação',
        variant: 'destructive'
      });
    }
  });

  const onSubmit = (values: ScoreFormValues) => {
    submitScoreMutation.mutate(values);
  };

  if (isLoadingAthlete || isLoadingScore) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!athlete) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Atleta não encontrado</p>
      </div>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">
          Registrar Pontuação: {athlete.nome_completo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pontuação</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pontos">Pontos</SelectItem>
                        <SelectItem value="segundos">Segundos</SelectItem>
                        <SelectItem value="metros">Metros</SelectItem>
                        <SelectItem value="quilos">Quilos</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Colocação</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="medal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medalha</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma medalha (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Sem medalha</SelectItem>
                        <SelectItem value="Ouro">Ouro (1º lugar)</SelectItem>
                        <SelectItem value="Prata">Prata (2º lugar)</SelectItem>
                        <SelectItem value="Bronze">Bronze (3º lugar)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      A medalha deve corresponder à colocação (1º, 2º ou 3º lugar)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="batch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bateria/Fase</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Eliminatória, Final" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observações sobre a performance (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={submitScoreMutation.isPending}
              >
                {submitScoreMutation.isPending ? 'Salvando...' : 'Salvar Pontuação'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
