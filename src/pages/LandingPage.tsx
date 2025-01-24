import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flame, MapPin, Calendar, Coins, ArrowRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const videoUrl = ""; // Replace with actual YouTube URL when provided

  return (
    <div className="min-h-screen bg-gradient-to-b from-olimpics-background to-white">
      {/* Hero Section */}
      <div className="relative h-[600px] bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />
        <img
          src="/lovable-uploads/7f5d4c54-bc15-4310-ac7a-ecd055bda99b.png"
          alt="Nova Acrópole Background"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
        />
        <div className="container relative z-10 mx-auto px-4 h-full flex flex-col justify-center items-center text-white text-center">
          <img
            src="/lovable-uploads/781f97ba-e496-4392-92b0-8ea401f0aa3e.png"
            alt="Olympic Flame"
            className="w-24 h-24 mb-6 animate-pulse"
          />
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Olimpíadas Estaduais RS 2025
          </h1>
          <p className="text-xl md:text-2xl italic mb-8 max-w-3xl">
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
      <div className="container mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow bg-white/90 backdrop-blur">
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

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow bg-white/90 backdrop-blur">
            <div className="flex items-center gap-4">
              <Calendar className="w-8 h-8 text-olimpics-green-primary" />
              <div>
                <h3 className="font-semibold text-lg text-olimpics-green-primary">Data</h3>
                <p className="text-olimpics-text">11, 12 e 13 de Abril</p>
                <p className="text-sm text-gray-600">2025</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow bg-white/90 backdrop-blur">
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

      {/* Nova Acrópole Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <img
                src="/lovable-uploads/71dd91ef-fe30-4b2b-9292-5c7ecebb1b69.png"
                alt="Nova Acrópole Logo"
                className="w-full max-w-md mx-auto"
              />
            </div>
            <div className="md:w-1/2 space-y-4">
              <h2 className="text-3xl font-bold text-olimpics-green-primary">
                Nova Acrópole Brasil Sul
              </h2>
              <p className="text-olimpics-text">
                Uma organização internacional dedicada à promoção da Filosofia, Cultura e Voluntariado.
              </p>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-semibold text-olimpics-green-primary">Areté</h3>
                <p className="text-olimpics-text">
                  O conceito de Areté representa a excelência e a virtude, valores fundamentais que guiam nossa jornada olímpica.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Section - Conditional Rendering */}
      {videoUrl && (
        <div className="bg-olimpics-green-primary/5 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-olimpics-green-primary">
              Edição Anterior
            </h2>
            <div className="aspect-w-16 aspect-h-9 max-w-4xl mx-auto">
              <iframe
                src={videoUrl}
                title="Olimpíadas Nova Acrópole"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-olimpics-orange-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Participe desta Jornada Única!
          </h2>
          <Button
            size="lg"
            variant="outline"
            className="bg-white text-olimpics-orange-primary hover:bg-white/90"
            onClick={() => navigate("/login?tab=register")}
          >
            Inscreva-se Agora <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;