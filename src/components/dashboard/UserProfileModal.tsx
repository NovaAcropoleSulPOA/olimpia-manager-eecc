
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { updateUserProfiles } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface UserProfileModalProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserProfileModal = ({ user, open, onOpenChange }: UserProfileModalProps) => {
  const queryClient = useQueryClient();
  const [selectedProfiles, setSelectedProfiles] = useState<number[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentEventId = localStorage.getItem('currentEventId');

  const { data: availableProfiles, isLoading } = useQuery({
    queryKey: ['profiles', currentEventId],
    queryFn: async () => {
      console.log('Fetching profiles for event:', currentEventId);
      
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('evento_id', currentEventId)
        .order('nome');
      
      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }
      
      console.log('Available profiles:', data);
      return data;
    },
    enabled: open && !!currentEventId
  });

  const { data: userProfiles } = useQuery({
    queryKey: ['user-profiles', user?.id, currentEventId],
    queryFn: async () => {
      if (!user?.id || !currentEventId) return [];
      
      const { data, error } = await supabase
        .from('papeis_usuarios')
        .select('perfil_id')
        .eq('usuario_id', user.id)
        .eq('evento_id', currentEventId);
        
      if (error) {
        console.error('Error fetching user profiles:', error);
        throw error;
      }
      
      console.log('User profiles:', data);
      return data.map(p => p.perfil_id);
    },
    enabled: open && !!user?.id && !!currentEventId
  });

  useEffect(() => {
    if (userProfiles) {
      console.log('Setting selected profiles:', userProfiles);
      setSelectedProfiles(userProfiles);
    }
  }, [userProfiles]);

  const handleProfileToggle = (profileId: number) => {
    setSelectedProfiles(current =>
      current.includes(profileId)
        ? current.filter(id => id !== profileId)
        : [...current, profileId]
    );
  };

  const handleSave = async () => {
    if (selectedProfiles.length === 0) {
      toast.error("O usuário deve ter pelo menos um perfil atribuído");
      return;
    }

    setIsUpdating(true);
    try {
      console.log('Updating profiles for user:', user.id);
      console.log('Selected profiles:', selectedProfiles);
      console.log('Current event:', currentEventId);

      await updateUserProfiles(user.id, selectedProfiles);
      
      await queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
      await queryClient.invalidateQueries({ queryKey: ['profiles'] });
      
      toast.success("Perfis atualizados com sucesso!");
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating profiles:', error);
      toast.error(error.message || "Erro ao atualizar perfis");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Perfis - {user?.nome_completo}</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {availableProfiles?.map((profile) => (
                <div key={profile.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`profile-${profile.id}`}
                    checked={selectedProfiles.includes(profile.id)}
                    onCheckedChange={() => handleProfileToggle(profile.id)}
                  />
                  <label
                    htmlFor={`profile-${profile.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {profile.nome}
                  </label>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUpdating}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isUpdating || selectedProfiles.length === 0}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
