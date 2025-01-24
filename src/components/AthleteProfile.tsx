import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  Loader2, User, MapPin, Phone, Mail, Plus, Upload,
  Waves, PersonStanding, Volleyball, Target, BookOpen
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface Modalidade {
  id: number;
  nome: string;
  tipo_modalidade: string;
  categoria: string;
  status: string;
}

interface Inscricao {
  id: number;
  status: 'Pendente' | 'Confirmada' | 'Recusada' | 'Cancelada';
  modalidade: Modalidade;
}

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB in bytes

const getSportIcon = (modalidade: string) => {
  const iconMap: Record<string, JSX.Element> = {
    'Natação': <Waves className="h-6 w-6" />,
    'Corrida': <PersonStanding className="h-6 w-6" />,
    'Vôlei': <Volleyball className="h-6 w-6" />,
    'Tiro com Arco': <Target className="h-6 w-6" />,
    'Poesia': <BookOpen className="h-6 w-6" />
  };
  return iconMap[modalidade] || <Target className="h-6 w-6" />;
};

const getStatusColor = (status: string) => {
  const colors = {
    'Pendente': 'bg-yellow-100 text-yellow-800',
    'Confirmada': 'bg-green-100 text-green-800',
    'Recusada': 'bg-red-100 text-red-800',
    'Cancelada': 'bg-gray-100 text-gray-800'
  };
  return colors[status as keyof typeof colors] || colors['Pendente'];
};

export default function AthleteProfile() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Fetch athlete's registrations
  const { data: inscricoes, isLoading: isLoadingInscricoes } = useQuery({
    queryKey: ['inscricoes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inscricoes')
        .select(`
          id,
          status,
          modalidade:modalidade_id (
            id,
            nome,
            tipo_modalidade,
            categoria,
            status
          )
        `)
        .eq('atleta_id', user?.id)
        .returns<Inscricao[]>();

      if (error) {
        console.error('Error fetching registrations:', error);
        toast.error('Erro ao carregar inscrições');
        throw error;
      }

      return data;
    },
    enabled: !!user?.id
  });

  // Fetch available modalities
  const { data: modalidades, isLoading: isLoadingModalidades } = useQuery({
    queryKey: ['modalidades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modalidades')
        .select('*')
        .eq('status', 'Ativa')
        .returns<Modalidade[]>();

      if (error) {
        console.error('Error fetching modalities:', error);
        toast.error('Erro ao carregar modalidades');
        throw error;
      }

      return data;
    }
  });

  // Fetch payment status
  const { data: pagamento } = useQuery({
    queryKey: ['pagamento', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('atleta_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Error fetching payment:', error);
        toast.error('Erro ao carregar status do pagamento');
        throw error;
      }

      return data;
    },
    enabled: !!user?.id
  });

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
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(`${user?.id}/${file.name}`, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(data.path);

      await supabase
        .from('usuarios')
        .update({ foto_perfil: publicUrl })
        .eq('id', user?.id);

      setProfileImage(publicUrl);
      toast.success('Foto de perfil atualizada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao atualizar a foto de perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (modalidadeId: number) => {
    try {
      const { error } = await supabase
        .from('inscricoes')
        .insert({
          atleta_id: user?.id,
          modalidade_id: modalidadeId,
          status: 'Pendente'
        });

      if (error) throw error;

      toast.success('Inscrição realizada com sucesso!');
    } catch (error) {
      console.error('Error registering:', error);
      toast.error('Erro ao realizar inscrição');
    }
  };

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
                      {profileImage || user?.foto_perfil ? (
                        <img 
                          src={profileImage || user?.foto_perfil} 
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
                    <p className="text-sm text-muted-foreground">
                      {user?.numero_identificador} - {user?.filial?.nome}
                    </p>
                    <Badge 
                      variant={pagamento?.status === 'confirmado' ? 'default' : 'destructive'}
                      className="mt-2"
                    >
                      {pagamento?.status === 'confirmado' ? 'Pagamento Confirmado' : 'Pagamento Pendente'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Localização</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.filial?.cidade}, {user?.filial?.estado}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Telefone</p>
                      <p className="text-sm text-muted-foreground">{user?.telefone}</p>
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
                {isLoadingInscricoes || isLoadingModalidades ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {modalidades?.map((modalidade) => {
                        const inscricao = inscricoes?.find(
                          (i) => i.modalidade.id === modalidade.id
                        );

                        return (
                          <div
                            key={modalidade.id}
                            className={cn(
                              "flex items-center justify-between p-4 rounded-lg",
                              modalidade.id % 2 === 0 ? "bg-muted" : "bg-background"
                            )}
                          >
                            <div className="flex items-center space-x-4">
                              {getSportIcon(modalidade.nome)}
                              <div>
                                <span className="font-medium">{modalidade.nome}</span>
                                <div className="text-sm text-muted-foreground">
                                  {modalidade.tipo_modalidade} • {modalidade.categoria}
                                </div>
                              </div>
                            </div>
                            {inscricao ? (
                              <Badge className={getStatusColor(inscricao.status)}>
                                {inscricao.status}
                              </Badge>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRegistration(modalidade.id)}
                                disabled={modalidade.status !== 'Ativa'}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Inscrever-se
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
