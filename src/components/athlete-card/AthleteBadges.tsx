
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Hash, UserPlus2 } from "lucide-react";

interface AthleteBadgesProps {
  numeroIdentificador?: string;
  isDependent: boolean;
  isExempt: boolean;
}

export const AthleteBadges: React.FC<AthleteBadgesProps> = ({
  numeroIdentificador,
  isDependent,
  isExempt
}) => {
  return (
    <>
      {numeroIdentificador && (
        <Badge 
          variant="outline" 
          className="ml-2 text-lg font-mono bg-olimpics-orange-primary text-white hover:bg-olimpics-orange-secondary"
        >
          <Hash className="h-4 w-4 mr-1" />
          {numeroIdentificador}
        </Badge>
      )}
      {isDependent && (
        <Badge variant="secondary" className="bg-blue-500 text-white">
          <UserPlus2 className="h-3 w-3 mr-1" />
          Dependente
        </Badge>
      )}
      {isExempt && (
        <Badge variant="secondary" className="bg-green-500 text-white">
          Isento
        </Badge>
      )}
    </>
  );
};
