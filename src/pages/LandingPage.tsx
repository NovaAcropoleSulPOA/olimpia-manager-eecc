import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flame, MapPin, Calendar } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Login from "./Login";

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
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-olimpics-background to-white">
      <div className="relative min-h-screen bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary">
        <div className="absolute inset-0 bg-black/40" />
        <div className="container relative z-10 mx-auto px-4 py-8 flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Left side - Event Info */}
          <div className="md:w-1/2 text-white">
            <div className="flex flex-col items-center md:items-start mb-6">
              <div className="relative w-24 h-24">
                <Flame className="w-full h-full text-olimpics-orange-primary animate-pulse" />
              </div>
              <p className="text-xl md:text-2xl font-semibold text-center md:text-left">
                Areté
              </p>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Olimpíadas Estaduais da Nova Acrópole 2025 - Porto Alegre
            </h1>
            <p className="text-xl md:text-2xl italic mb-8">
              "Mais rápidos, mais altos, mais fortes, estamos unidos!"
            </p>
            {/* Interactive Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card 
                className="p-4 shadow-lg hover:shadow-xl transition-shadow bg-white/90 backdrop-blur cursor-pointer"
                onClick={handleLocationClick}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-olimpics-green-primary" />
                  <div>
                    <h3 className="font-semibold text-base text-olimpics-green-primary">Local</h3>
                    <p className="text-olimpics-text text-sm">
                      Parque Esportivo PUC-RS
                    </p>
                    <p className="text-xs text-gray-600">
                      Clique para ver no mapa
                    </p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 shadow-lg hover:shadow-xl transition-shadow bg-white/90 backdrop-blur cursor-pointer"
                onClick={handleCalendarSync}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-olimpics-green-primary" />
                  <div>
                    <h3 className="font-semibold text-base text-olimpics-green-primary">Data</h3>
                    <p className="text-olimpics-text text-sm">11, 12 e 13 de Abril</p>
                    <p className="text-xs text-gray-600">
                      Clique para adicionar ao calendário
                    </p>
                  </div>
                </div>
              </Card>

            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="md:w-1/2 max-w-[400px] w-full backdrop-blur-sm bg-white/95 rounded-lg shadow-xl">
            <Login />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
