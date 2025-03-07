
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AthleteCardProps {
  athlete: any;
  isSelected?: boolean;
  onClick?: () => void;
}

export function AthleteCard({ athlete, isSelected, onClick }: AthleteCardProps) {
  return (
    <Card 
      className={`
        cursor-pointer hover:border-primary/50 transition-colors
        ${isSelected ? 'border-primary' : ''}
      `}
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base">{athlete.atleta_nome}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-sm text-muted-foreground">
          <p>{athlete.tipo_documento}: {athlete.numero_documento}</p>
          {athlete.numero_identificador && (
            <p>ID: {athlete.numero_identificador}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
