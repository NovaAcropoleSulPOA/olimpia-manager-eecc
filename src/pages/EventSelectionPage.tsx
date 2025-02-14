
import React from 'react';
import { EventSelection } from '@/components/auth/EventSelection';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface PerfilTipo {
  id: string;
  codigo: string;
}

interface PapelUsuario {
  perfis: {
    id: number;
    perfil_tipo_id: string;
    perfis_tipo: PerfilTipo;
  }
}

export default function EventSelectionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get user's profile type to determine if they are a child
  const { data: userProfileType } = useQuery({
    queryKey: ['user-profile-type', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      console.log('Fetching profile type for user:', user.id);

      const { data, error } = await supabase
        .from('papeis_usuarios')
        .select(`
          perfis:perfil_id (
            id,
            perfil_tipo_id,
            perfis_tipo:perfil_tipo_id (
              id,
              codigo
            )
          )
        `)
        .eq('usuario_id', user.id);

      if (error) {
        console.error('Error fetching user profile type:', error);
        throw error;
      }

      console.log('Received profile data:', data);

      if (!data || data.length === 0) {
        console.log('No profile found for user');
        return null;
      }

      // Cast data to the correct type
      const userProfiles = data as unknown as PapelUsuario[];
      console.log('Parsed profiles:', userProfiles);

      // Find child profile if it exists
      const childProfile = userProfiles.find(profile => {
        const codigo = profile.perfis?.perfis_tipo?.codigo;
        return codigo === 'C+7' || codigo === 'C-6';
      });

      // Return child profile code if found, otherwise return the first profile code
      const profileCode = childProfile?.perfis?.perfis_tipo?.codigo || 
                         userProfiles[0]?.perfis?.perfis_tipo?.codigo || 
                         null;

      console.log('Selected profile code:', profileCode);
      return profileCode;
    },
    enabled: !!user?.id
  });

  const handleEventSelect = (eventId: string) => {
    localStorage.setItem('currentEventId', eventId);
    toast.success('Evento selecionado com sucesso!');
    navigate('/athlete-profile');
  };

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
            userProfileType={userProfileType}
          />
        </div>
      </div>
    </div>
  );
}
