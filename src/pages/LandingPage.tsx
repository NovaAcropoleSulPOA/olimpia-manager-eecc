import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flame, MapPin, Calendar, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-olimpics-background to-white">
      {/* Hero Section */}
      <div className="relative h-[600px] bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary">
        <div className="absolute inset-0 bg-black/40" />
        <div className="container relative z-10 mx-auto px-4 h-full flex flex-col justify-center items-center text-white text-center">
          <Flame className="w-16 h-16 mb-6 animate-pulse text-olimpics-orange-primary" />
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Olimpíadas Estaduais RS 2025
          </h1>
          <p className="text-xl md:text-2xl italic mb-8">
            "Mais rápidos, mais altos, mais fortes, estamos unidos!"
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-olimpics-orange-primary hover:bg-olimpics-orange-secondary text-white"
              onClick={() => navigate("/login")}
            >
              Fazer Login
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white"
              onClick={() => navigate("/login?tab=register")}
            >
              Cadastrar-se
            </Button>
          </div>
        </div>
      </div>

      {/* Event Info Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <MapPin className="w-8 h-8 text-olimpics-green-primary" />
              <div>
                <h3 className="font-semibold text-lg text-olimpics-green-primary">Local</h3>
                <p className="text-olimpics-text">
                  Parque Esportivo PUC-RS
                </p>
                <p className="text-sm text-gray-600">
                  Av. Ipiranga, 6690 - Partenon, RS
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <Calendar className="w-8 h-8 text-olimpics-green-primary" />
              <div>
                <h3 className="font-semibold text-lg text-olimpics-green-primary">Data</h3>
                <p className="text-olimpics-text">11, 12 e 13 de Abril</p>
                <p className="text-sm text-gray-600">2025</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <Coins className="w-8 h-8 text-olimpics-green-primary" />
              <div>
                <h3 className="font-semibold text-lg text-olimpics-green-primary">Investimento</h3>
                <p className="text-olimpics-text">R$ 180,00</p>
                <p className="text-sm text-gray-600">por participante</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-olimpics-green-primary/5 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-olimpics-green-primary">
            Sobre o Evento
          </h2>
          <div className="max-w-3xl mx-auto text-center space-y-4 text-olimpics-text">
            <p>
              As Olimpíadas Estaduais RS 2025 são um evento que celebra a união entre
              esporte e filosofia, promovido pela Nova Acrópole.
            </p>
            <p>
              Inspirado nos valores olímpicos da antiguidade, o evento busca
              desenvolver não apenas as habilidades físicas, mas também as
              qualidades morais e espirituais dos participantes.
            </p>
            <Button
              className="mt-6 bg-olimpics-orange-primary hover:bg-olimpics-orange-secondary text-white"
              onClick={() => navigate("/login?tab=register")}
            >
              Participe Agora
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;