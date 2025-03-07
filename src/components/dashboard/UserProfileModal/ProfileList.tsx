
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface Profile {
  id: number;
  nome: string;
}

interface ProfileListProps {
  profiles: Profile[] | undefined;
  isLoading: boolean;
  selectedProfiles: number[];
  onToggle: (profileId: number) => void;
}

export const ProfileList = ({ 
  profiles, 
  isLoading, 
  selectedProfiles, 
  onToggle 
}: ProfileListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {profiles?.map((profile) => (
        <div key={profile.id} className="flex items-center space-x-2">
          <Checkbox
            id={`profile-${profile.id}`}
            checked={selectedProfiles.includes(profile.id)}
            onCheckedChange={() => onToggle(profile.id)}
          />
          <label
            htmlFor={`profile-${profile.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {profile.nome}
          </label>
        </div>
      ))}
      
      {profiles?.length === 0 && (
        <div className="text-sm text-muted-foreground italic">
          Nenhum perfil disponível para este evento.
        </div>
      )}
    </div>
  );
};
