
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { updateUserProfiles, swapUserProfile } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserProfileModalProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Profile {
  id: number;
  nome: string;
  evento_id: string;
}

interface UserProfile {
  perfil_id: number;
  perfis: {
    id: number;
    nome: string;
  };
}

const EXCLUSIVE_PROFILES = ['Atleta', 'Público Geral'];

export const UserProfileModal = ({ user, open, onOpenChange }: UserProfileModalProps) => {
  const queryClient = useQueryClient();
  const [selectedProfiles, setSelectedProfiles] = useState<number[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentEventId = localStorage.getItem('currentEventId');

  const { data: availableProfiles, isLoading } = useQuery<Profile[]>({
    queryKey: ['profiles', currentEventId],
    queryFn: async () => {
      console.log('Fetching available profiles for event:', currentEventId);
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('evento_id', currentEventId)
        .order('nome');
      
      if (error) throw error;
      console.log('Available profiles:', data);
      return data || [];
    },
    enabled: open && !!currentEventId
  });

  const { data: userProfiles = [] } = useQuery<UserProfile[]>({
    queryKey: ['user-profiles', user?.id, currentEventId],
    queryFn: async () => {
      if (!user?.id || !currentEventId) return [];
      
      console.log('Fetching user profiles for:', { userId: user.id, eventId: currentEventId });
      const { data: rawData, error } = await supabase
        .from('papeis_usuarios')
        .select('perfil_id, perfis:perfil_id(id, nome)')
        .eq('usuario_id', user.id)
        .eq('evento_id', currentEventId);
        
      if (error) throw error;
      if (!rawData) return [];

      console.log('User profiles data:', rawData);
      
      const typedData = rawData as unknown as Array<{
        perfil_id: number;
        perfis: { id: number; nome: string } | null;
      }>;
      
      return typedData.map(item => ({
        perfil_id: item.perfil_id,
        perfis: {
          id: item.perfis?.id ?? 0,
          nome: item.perfis?.nome ?? ''
        }
      }));
    },
    enabled: open && !!user?.id && !!currentEventId
  });

  useEffect(() => {
    if (userProfiles) {
      setSelectedProfiles(userProfiles.map(p => p.perfil_id));
    }
  }, [userProfiles]);

  // Find the user's current exclusive profile (if any)
  const currentExclusiveProfile = userProfiles.find(p => 
    EXCLUSIVE_PROFILES.includes(p.perfis.nome)
  );

  // Filter available profiles based on current exclusive profile
  const filteredProfiles = availableProfiles?.filter(profile => {
    if (EXCLUSIVE_PROFILES.includes(profile.nome)) {
      // If user has an exclusive profile, only show that one
      if (currentExclusiveProfile) {
        return profile.nome === currentExclusiveProfile.perfis.nome;
      }
    }
    return true;
  });

  const handleProfileToggle = (profileId: number) => {
    setSelectedProfiles(current =>
      current.includes(profileId)
        ? current.filter(id => id !== profileId)
        : [...current, profileId]
    );
    
    // Clear any previous errors when making new selections
    if (error) setError(null);
  };

  const handleSave = async () => {
    if (selectedProfiles.length === 0) {
      toast.error("O usuário deve ter pelo menos um perfil atribuído");
      return;
    }

    setIsUpdating(true);
    setError(null);
    
    try {
      // Check if we're swapping exclusive profiles
      const isSwappingExclusiveProfile = 
        currentExclusiveProfile && 
        !selectedProfiles.includes(currentExclusiveProfile.perfil_id);
      
      // If we're swapping exclusive profiles, we need to find the new exclusive profile
      if (isSwappingExclusiveProfile && availableProfiles) {
        const newExclusiveProfileId = selectedProfiles.find(id => {
          const profileName = availableProfiles.find(p => p.id === id)?.nome;
          return profileName && EXCLUSIVE_PROFILES.includes(profileName);
        });
        
        if (newExclusiveProfileId && currentExclusiveProfile) {
          console.log('Swapping exclusive profiles:', {
            from: currentExclusiveProfile.perfil_id,
            to: newExclusiveProfileId
          });
          
          await swapUserProfile(
            user.id, 
            currentEventId!, 
            newExclusiveProfileId, 
            currentExclusiveProfile.perfil_id
          );
          
          // Remove both old and new profile IDs from the selected profiles
          // as they'll be handled by the swap function
          const remainingProfiles = selectedProfiles.filter(
            id => id !== currentExclusiveProfile.perfil_id && id !== newExclusiveProfileId
          );
          
          // If there are remaining profiles, update them
          if (remainingProfiles.length > 0) {
            await updateUserProfiles(user.id, selectedProfiles);
          }
        } else {
          // Regular update if no new exclusive profile is found
          await updateUserProfiles(user.id, selectedProfiles);
        }
      } else {
        // Regular update for non-exclusive profile changes
        await updateUserProfiles(user.id, selectedProfiles);
      }
      
      // Invalidate both queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
      await queryClient.invalidateQueries({ queryKey: ['user-profiles', user?.id, currentEventId] });
      
      // Dispatch custom event to notify that profiles have been updated
      window.dispatchEvent(new CustomEvent('profile-updated'));
      
      toast.success("Perfis atualizados com sucesso!");
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating profiles:', error);
      setError(error.message || "Erro ao atualizar perfis");
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
          <DialogDescription>
            Selecione os perfis que deseja atribuir ao usuário.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              {filteredProfiles?.map((profile) => (
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
