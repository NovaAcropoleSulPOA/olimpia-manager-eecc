
import React from 'react';
import { Shield, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AccessProfileProps {
  papeis?: string[];
  onPasswordChange: () => void;
}

export default function AccessProfile({ papeis, onPasswordChange }: AccessProfileProps) {
  return (
    <div className="space-y-6">
      {papeis && papeis.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-olimpics-green-primary">
            <Shield className="h-5 w-5" />
            Perfis de Acesso
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {papeis.map((role, index) => (
              <Badge 
                key={index}
                variant="secondary" 
                className="bg-olimpics-green-primary/10 text-olimpics-green-primary border-olimpics-green-primary/20"
              >
                {role}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={onPasswordChange}
        variant="outline"
        className="w-full flex items-center gap-2"
      >
        <Lock className="h-4 w-4" />
        Alterar Senha
      </Button>
    </div>
  );
}
