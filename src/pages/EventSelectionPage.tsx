
import React from 'react';
import { EventSelection } from '@/components/auth/EventSelection';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function EventSelectionPage() {
  const navigate = useNavigate();

  const handleEventSelect = (eventId: string) => {
    // Store the selected event in localStorage for persistence
    localStorage.setItem('currentEventId', eventId);
    toast.success('Evento selecionado com sucesso!');
    navigate('/athlete-profile');
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: 'url(/lovable-uploads/7f5d4c54-bc15-4310-ac7a-ecd055bda99b.png)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-olimpics-green-primary">
          Selecione um Evento
        </h1>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
          <EventSelection
            selectedEvents={[]}
            onEventSelect={handleEventSelect}
            mode="login"
          />
        </div>
      </div>
    </div>
  );
}
