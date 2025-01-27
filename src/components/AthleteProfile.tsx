import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Loader2, User, MapPin, Phone, Mail, Building2,
  Upload, FileText
} from 'lucide-react';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB in bytes

const getProfileImage = (gender: string) => {
  switch (gender?.toLowerCase()) {
    case 'masculino':
      return "/lovable-uploads/71dd91ef-fe30-4b2b-9292-5c7ecebb1b69.png";
    case 'feminino':
      return "/lovable-uploads/781f97ba-e496-4392-92b0-8ea401f0aa3e.png";
    default:
      return "/lovable-uploads/7f5d4c54-bc15-4310-ac7a-ecd055bda99b.png";
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

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Perfil do Atleta</CardTitle>
          <CardDescription>Suas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-12 gap-6">
            {/* Profile Image Section */}
            <div className="md:col-span-3 flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="h-48 w-48 rounded-full overflow-hidden border-4 border-olimpics-green-primary">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={getProfileImage(user?.genero || '')}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
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
                <div className="bg-olimpics-green-primary text-white px-4 py-2 rounded-lg shadow-lg">
                  <p className="text-sm font-medium">ID DO ATLETA</p>
                  <p className="text-xl font-bold">{user?.numero_identificador}</p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="md:col-span-9 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-olimpics-green-primary">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Nome Completo</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{user?.nome_completo}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Documento</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {user?.tipo_documento}: {user?.numero_documento}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{user?.email}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Telefone</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{user?.telefone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-olimpics-green-primary">
                  <Building2 className="h-5 w-5" />
                  Informações da Filial
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Nome da Filial</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{user?.filial_nome}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Localização</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {user?.filial_cidade}, {user?.filial_estado}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}