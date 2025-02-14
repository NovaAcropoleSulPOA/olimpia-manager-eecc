
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserProfileModalProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EXCLUSIVE_PROFILES = ['Atleta', 'Público Geral'];

export const UserProfileModal = ({ user, open, onOpenChange }: UserProfileModalProps) => {
  const queryClient = useQueryClient();
  const [selectedProfiles, setSelectedProfiles] = useState<number[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSwapConfirm, setShowSwapConfirm] = useState(false);
  const [pendingSwap, setPendingSwap] = useState<{
    oldProfileId: number;
    newProfileId: number;
  } | null>(null);

  const currentEventId = localStorage.getItem('currentEventId');

  const { data: availableProfiles, isLoading } = useQuery({
    queryKey: ['profiles', currentEventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('evento_id', currentEventId)
        .order('nome');
      
      if (error) throw error;
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
        .select('perfil_id, perfis(id, nome)')
        .eq('usuario_id', user.id)
        .eq('evento_id', currentEventId);
        
      if (error) throw error;
      return data;
    },
    enabled: open && !!user?.id && !!currentEventId
  });

  useEffect(() => {
    if (userProfiles) {
      setSelectedProfiles(userProfiles.map(p => p.perfil_id));
    }
  }, [userProfiles]);

  const handleProfileToggle = async (profileId: number) => {
    const profileToToggle = availableProfiles?.find(p => p.id === profileId);
    const currentExclusiveProfile = userProfiles?.find(p => 
      EXCLUSIVE_PROFILES.includes(p.perfis.nome)
    );

    if (profileToToggle && EXCLUSIVE_PROFILES.includes(profileToToggle.nome)) {
      if (currentExclusiveProfile && currentExclusiveProfile.perfil_id !== profileId) {
        // Initiate swap process
        setPendingSwap({
          oldProfileId: currentExclusiveProfile.perfil_id,
          newProfileId: profileId
        });
        setShowSwapConfirm(true);
        return;
      }
    }

    setSelectedProfiles(current =>
      current.includes(profileId)
        ? current.filter(id => id !== profileId)
        : [...current, profileId]
    );
  };

  const handleSwapConfirm = async () => {
    if (!pendingSwap || !currentEventId || !user?.id) return;

    setIsUpdating(true);
    try {
      await swapUserProfile(
        user.id,
        currentEventId,
        pendingSwap.newProfileId,
        pendingSwap.oldProfileId
      );

      await queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
      toast.success("Perfil trocado com sucesso!");
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error swapping profiles:', error);
      toast.error(error.message || "Erro ao trocar perfil");
    } finally {
      setIsUpdating(false);
      setShowSwapConfirm(false);
      setPendingSwap(null);
    }
  };

  const handleSave = async () => {
    if (selectedProfiles.length === 0) {
      toast.error("O usuário deve ter pelo menos um perfil atribuído");
      return;
    }

    const newExclusiveProfiles = selectedProfiles
      .map(id => availableProfiles?.find(p => p.id === id))
      .filter(p => p && EXCLUSIVE_PROFILES.includes(p.nome));

    if (newExclusiveProfiles.length > 1) {
      toast.error("Um usuário não pode ter os perfis 'Atleta' e 'Público Geral' simultaneamente");
      return;
    }

    setIsUpdating(true);
    try {
      await updateUserProfiles(user.id, selectedProfiles);
      await queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar Perfis - {user?.nome_completo}</DialogTitle>
            <DialogDescription>
              Nota: Os perfis 'Atleta' e 'Público Geral' são exclusivos e não podem ser atribuídos simultaneamente.
            </DialogDescription>
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

      <AlertDialog open={showSwapConfirm} onOpenChange={setShowSwapConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Troca de Perfil</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá trocar o perfil do usuário e criar um novo processo de inscrição.
              O processo anterior será cancelado e um novo processo de pagamento será iniciado.
              Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowSwapConfirm(false);
              setPendingSwap(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSwapConfirm} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
