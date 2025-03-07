
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { ProfileList } from "./ProfileList";
import { DialogActions } from "./DialogActions";

interface UserProfileModalProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserProfileModal = ({ user, open, onOpenChange }: UserProfileModalProps) => {
  const {
    selectedProfiles,
    filteredProfiles,
    isLoading,
    isUpdating,
    error,
    handleProfileToggle,
    handleSave
  } = useUserProfiles(user, open, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Perfis - {user?.nome_completo}</DialogTitle>
          <DialogDescription>
            Selecione os perfis que deseja atribuir ao usuário.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <ProfileList
            profiles={filteredProfiles}
            isLoading={isLoading}
            selectedProfiles={selectedProfiles}
            onToggle={handleProfileToggle}
          />
          
          <DialogActions
            onCancel={() => onOpenChange(false)}
            onSave={handleSave}
            isUpdating={isUpdating}
            disabled={selectedProfiles.length === 0}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
