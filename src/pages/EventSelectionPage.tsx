
import React, { useEffect } from 'react';
import { EventSelection } from '@/components/auth/EventSelection';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { differenceInYears } from 'date-fns';

export default function EventSelectionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const { data: userAge } = useQuery({
    queryKey: ['user-age', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        navigate('/', { replace: true });
        return null;
      }

      // Using maybeSingle() instead of single() to handle null case gracefully
      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('data_nascimento')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user birth date:', error);
        toast.error('Erro ao buscar informações do usuário');
        return null;
      }

      if (!userData?.data_nascimento) {
        return null;
      }

      const age = differenceInYears(new Date(), new Date(userData.data_nascimento));
      console.log('Calculated user age:', age);
      return age;
    },
    enabled: !!user?.id,
    retry: 1 // Only retry once to avoid excessive retries on permanent errors
  });

  const handleEventSelect = (eventId: string) => {
    localStorage.setItem('currentEventId', eventId);
    toast.success('Evento selecionado com sucesso!');
    navigate('/athlete-profile');
  };

  // If there's no user, redirect to landing page
  if (!user) {
    return null;
  }

  const isUnder13 = userAge !== null && userAge < 13;

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: 'url(/lovable-uploads/7f5d4c54-bc15-4310-ac7a-ecd055bda99b.png)',
        backgroundColor: 'rgba(0, 155, 64, 0.05)',
        backgroundBlendMode: 'overlay',
        boxShadow: 'inset 0 0 0 2000px rgba(0, 155, 64, 0.05)'
      }}
    >
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8 bg-olimpics-green-primary text-white py-2 px-4 rounded-lg inline-block mx-auto">
          Selecione um Evento
        </h1>
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
          <EventSelection
            selectedEvents={[]}
            onEventSelect={handleEventSelect}
            mode="login"
            isUnderAge={isUnder13}
          />
        </div>
      </div>
    </div>
  );
}
