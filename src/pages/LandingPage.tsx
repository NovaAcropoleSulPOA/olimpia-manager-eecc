import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flame, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Login from "./Login";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { 
  PersonStanding, 
  Waves, 
  Volleyball, 
  Dumbbell, 
  Target, 
  Sword, 
  BookOpen, 
  Disc 
} from 'lucide-react';

const modalities = [
  { name: 'Natação', icon: Waves, color: 'bg-blue-500' },
  { name: 'Corrida', icon: PersonStanding, color: 'bg-green-500' },
  { name: 'Vôlei', icon: Volleyball, color: 'bg-yellow-500' },
  { name: 'Levantamento de Peso', icon: Dumbbell, color: 'bg-red-500' },
  { name: 'Arco e Flecha', icon: Target, color: 'bg-purple-500' },
  { name: 'Esgrima', icon: Sword, color: 'bg-indigo-500' },
  { name: 'Poesia', icon: BookOpen, color: 'bg-pink-500' },
  { name: 'Lançamento de Disco', icon: Disc, color: 'bg-orange-500' }
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-olimpics-background to-white">
      <div className="relative min-h-screen bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary">
        <div className="absolute inset-0 bg-black/40" />
        <div className="container relative z-10 mx-auto px-4 py-8 flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Left side - Event Info */}
          <div className="md:w-1/2 text-white">
            {/* Centered Olympic Flame and Areté */}
            <div className="flex flex-col items-center mb-12">
              <div className="relative w-32 h-32 mb-4">
                <Flame className="w-full h-full text-olimpics-orange-primary animate-pulse" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-olimpics-orange-primary mb-2">
                Areté
              </h2>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center md:text-left">
              Olimpíadas Estaduais da Nova Acrópole 2025 - Porto Alegre
            </h1>
            <p className="text-xl md:text-2xl italic mb-12 text-center md:text-left">
              "Mais rápidos, mais altos, mais fortes, estamos unidos!"
            </p>

            {/* Enhanced Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
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
          </div>

          {/* Right side - Login Form */}
          <div className="md:w-1/2 max-w-[400px] w-full backdrop-blur-sm bg-white/95 rounded-lg shadow-xl">
            <Login />
          </div>
        </div>

        {/* Modality Showcase Section */}
        <div className="relative z-10 container mx-auto px-4 py-16 mt-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Modalidades Olímpicas
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Descubra todas as modalidades disponíveis em nossa competição
            </p>
          </div>

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent>
              {modalities.map((modality, index) => (
                <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/4">
                  <div className="p-1">
                    <Card className={cn(
                      "relative overflow-hidden group cursor-pointer transition-all duration-300 transform hover:-translate-y-2",
                      "border-none shadow-lg hover:shadow-xl",
                      "bg-gradient-to-br from-white/90 to-white/80 backdrop-blur"
                    )}>
                      <div className="p-6 flex flex-col items-center text-center space-y-4">
                        <div className={cn(
                          "p-4 rounded-full transition-transform duration-300 group-hover:scale-110",
                          modality.color + "/10"
                        )}>
                          {React.createElement(modality.icon, {
                            className: cn("w-8 h-8", modality.color.replace('bg-', 'text-')),
                          })}
                        </div>
                        <h3 className="font-semibold text-lg text-olimpics-text">
                          {modality.name}
                        </h3>
                      </div>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>

          <div className="text-center mt-12">
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
      </div>
    </div>
  );
};

export default LandingPage;
