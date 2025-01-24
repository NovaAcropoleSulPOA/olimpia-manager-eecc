import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Login from "./Login";
import { cn } from "@/lib/utils";

// Updated modalities array with the correct list in alphabetical order
const modalities = [
  { name: 'Corrida', icon: "🏃" },
  { name: 'Lançamento de Dardo', icon: "🎯" },
  { name: 'Natação', icon: "🏊" },
  { name: 'Poesia Escrita', icon: "📝" },
  { name: 'Salto em Distância', icon: "🦘" },
  { name: 'Tênis de Mesa', icon: "🏓" },
  { name: 'Tiro com Arco', icon: "🎯" },
  { name: 'Vôlei', icon: "🏐" },
  { name: 'Xadrez', icon: "♟️" }
];

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLocationClick = () => {
    const address = "Av. Ipiranga, 6690 - Partenon, Porto Alegre, RS - Brasil";
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
  };

  const handleCalendarSync = () => {
    const startDate = '2025-04-11';
    const endDate = '2025-04-13';
    const title = 'Olimpíadas Estaduais da Nova Acrópole 2025 - Porto Alegre';
    const location = 'Parque Esportivo PUC-RS, Av. Ipiranga, 6690 - Partenon, Porto Alegre, RS';
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate.replace(/-/g, '')}/${endDate.replace(/-/g, '')}&location=${encodeURIComponent(location)}`;
    
    if (window.confirm('Deseja adicionar este evento ao seu calendário?')) {
      window.open(googleCalendarUrl, '_blank');
      toast.success('Redirecionando para o Google Calendar');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-olimpics-background to-white">
      <div className="relative min-h-screen bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary">
        <div className="absolute inset-0 bg-black/40" />
        <div className="container relative z-10 mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side - Event Info */}
            <div className="text-white">
              {/* Header Section */}
              <div className="flex flex-col items-center mb-12">
                <div className="relative w-32 h-32 mb-4">
                  <span className="text-8xl animate-pulse">🔥</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-olimpics-orange-primary mb-2">
                  Areté
                </h2>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center lg:text-left">
                Olimpíadas Estaduais da Nova Acrópole 2025 - Porto Alegre
              </h1>
              <p className="text-xl md:text-2xl italic mb-12 text-center lg:text-left">
                "Mais rápidos, mais altos, mais fortes, estamos unidos!"
              </p>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card 
                  className="p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 bg-white/95 backdrop-blur cursor-pointer"
                  onClick={handleLocationClick}
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="p-4 rounded-full bg-olimpics-green-primary/10">
                      <MapPin className="w-8 h-8 text-olimpics-green-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-olimpics-green-primary mb-2">Local</h3>
                      <p className="text-olimpics-text text-lg mb-2">
                        Parque Esportivo PUC-RS
                      </p>
                      <p className="text-sm text-gray-600 italic">
                        Clique para ver no mapa
                      </p>
                    </div>
                  </div>
                </Card>

                <Card 
                  className="p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 bg-white/95 backdrop-blur cursor-pointer"
                  onClick={handleCalendarSync}
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="p-4 rounded-full bg-olimpics-green-primary/10">
                      <Calendar className="w-8 h-8 text-olimpics-green-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-olimpics-green-primary mb-2">Data</h3>
                      <p className="text-olimpics-text text-lg mb-2">11, 12 e 13 de Abril</p>
                      <p className="text-sm text-gray-600 italic">
                        Clique para adicionar ao calendário
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Modalities Section */}
              <div className="bg-white/95 backdrop-blur rounded-lg p-6 shadow-lg mb-8">
                <h2 className="text-2xl font-bold text-olimpics-text mb-6 text-center">
                  Modalidades Olímpicas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modalities.map((modality, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/80 shadow-sm hover:shadow-md transition-all"
                    >
                      <span className="text-2xl">{modality.icon}</span>
                      <span className="text-olimpics-text font-medium">
                        {modality.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Button
                  size="lg"
                  className="group bg-olimpics-orange-primary hover:bg-olimpics-orange-secondary text-white"
                  onClick={() => navigate('/login')}
                >
                  Inscreva-se Agora
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>

            {/* Right side - Login Form */}
            <div className="backdrop-blur-sm bg-white/95 rounded-lg shadow-xl p-6">
              <Login />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;