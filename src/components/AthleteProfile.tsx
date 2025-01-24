import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Loader2, User, MapPin, Phone, Mail, List, Plus, Upload,
  Waves, PersonStanding, Volleyball, Dumbbell, Target, Sword, BookOpen, Disc
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB in bytes

const getSportIcon = (sport: string) => {
  switch (sport.toLowerCase()) {
    case 'natação':
      return <Waves className="h-6 w-6" />;
    case 'corrida':
      return <PersonStanding className="h-6 w-6" />;
    case 'vôlei':
      return <Volleyball className="h-6 w-6" />;
    case 'levantamento de peso':
      return <Dumbbell className="h-6 w-6" />;
    case 'tiro com arco':
      return <Target className="h-6 w-6" />;
    case 'esgrima':
      return <Sword className="h-6 w-6" />;
    case 'poesia':
      return <BookOpen className="h-6 w-6" />;
    case 'lançamento de disco':
      return <Disc className="h-6 w-6" />;
    default:
      return <List className="h-6 w-6" />;
  }
};

export default function AthleteProfile() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error('A imagem deve ter no máximo 4MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast.success('Foto de perfil atualizada com sucesso!');
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao atualizar a foto de perfil');
      setIsLoading(false);
    }
  };

  const sports = [
    'Natação',
    'Corrida',
    'Vôlei',
    'Levantamento de Peso',
    'Tiro com Arco',
    'Esgrima',
    'Poesia',
    'Lançamento de Disco'
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Perfil do Atleta</CardTitle>
        <CardDescription>Gerencie suas informações pessoais e modalidades</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal">Informações Pessoais</TabsTrigger>
            <TabsTrigger value="sports">Modalidades</TabsTrigger>
          </TabsList>
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Suas informações básicas de contato e identificação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-muted overflow-hidden">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Profile" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <User className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="profile-image"
                      className="absolute bottom-0 right-0 rounded-full cursor-pointer"
                    >
                      <Button
                        size="icon"
                        className="rounded-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                      <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold">{user?.nome_completo}</h3>
                    <p className="text-sm text-muted-foreground">Atleta</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Localização</p>
                      <p className="text-sm text-muted-foreground">São Paulo, SP</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Telefone</p>
                      <p className="text-sm text-muted-foreground">{user?.telefone || '(11) 99999-9999'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sports">
            <Card>
              <CardHeader>
                <CardTitle>Modalidades Esportivas</CardTitle>
                <CardDescription>
                  Modalidades em que você está inscrito ou pode se inscrever
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {sports.map((sport, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg",
                          index % 2 === 0 ? "bg-muted" : "bg-background"
                        )}
                      >
                        <div className="flex items-center space-x-4">
                          {getSportIcon(sport)}
                          <span>{sport}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Inscrever-se
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}