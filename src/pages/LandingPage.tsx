import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flame, MapPin, Calendar, Coins } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Login from "./Login";

const LandingPage = () => {
  const navigate = useNavigate();
  const videoUrl = ""; // Replace with actual YouTube URL when provided

  return (
    <div className="min-h-screen bg-gradient-to-b from-olimpics-background to-white">
      {/* Hero Section with Login Integration */}
      <div className="relative min-h-screen bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary">
        <div className="absolute inset-0 bg-black/40" />
        <img
          src="/lovable-uploads/7f5d4c54-bc15-4310-ac7a-ecd055bda99b.png"
          alt="Nova Acrópole Background"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
        />
        
        <div className="container relative z-10 mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left side - Event Info */}
          <div className="md:w-1/2 text-white text-center md:text-left">
            <img
              src="/lovable-uploads/781f97ba-e496-4392-92b0-8ea401f0aa3e.png"
              alt="Olympic Flame"
              className="w-24 h-24 mb-6 mx-auto md:mx-0"
            />
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Olimpíadas Estaduais RS 2025
            </h1>
            <p className="text-xl md:text-2xl italic mb-8">
              "Mais rápidos, mais altos, mais fortes, estamos unidos!"
            </p>
            <p className="text-xl md:text-2xl font-semibold mb-4">
              Areté
            </p>
          </div>

          {/* Right side - Login Form */}
          <div className="md:w-1/2 max-w-[400px] w-full backdrop-blur-sm bg-white/95 rounded-lg shadow-xl">
            <Login />
          </div>
        </div>
      </div>

      {/* Event Info Cards */}
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
    </div>
  );
};

export default LandingPage;