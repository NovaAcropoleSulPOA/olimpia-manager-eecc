
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { format } from "date-fns";
import { Event } from "@/lib/types/database";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface EventCardProps {
  event: Event & {
    isRegistered: boolean;
    roles: Array<{ nome: string; codigo: string }>;
    isOpen: boolean;
  };
  selectedRole: 'ATL' | 'PGR';
  onRoleChange: (value: 'ATL' | 'PGR') => void;
  onEventAction: () => void;
}

export const EventCard = ({ 
  event, 
  selectedRole, 
  onRoleChange, 
  onEventAction 
}: EventCardProps) => {
  return (
    <Card 
      className={`
        relative overflow-hidden transition-all duration-200 hover:shadow-lg mx-2
        ${event.isRegistered ? 'ring-2 ring-olimpics-green-primary' : ''}
      `}
    >
      <CardContent className="p-6">
        <div className="aspect-square rounded-lg mb-4 relative overflow-hidden bg-olimpics-green-primary/10">
          {event.foto_evento ? (
            <img
              src={event.foto_evento}
              alt={event.nome}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Trophy className="w-16 h-16 text-olimpics-green-primary/50" />
            </div>
          )}
        </div>
        <h3 className="font-semibold text-lg mb-2">{event.nome}</h3>
        <p className="text-sm text-gray-500 mb-4">{event.descricao}</p>
        <div className="space-y-1 text-sm text-gray-500 mb-4">
          <p>Início: {format(new Date(event.data_inicio_inscricao), 'dd/MM/yyyy')}</p>
          <p>Término: {format(new Date(event.data_fim_inscricao), 'dd/MM/yyyy')}</p>
          <p className="text-xs uppercase font-medium mt-2">{event.tipo}</p>
          {event.isRegistered && event.roles.length > 0 && (
            <p className="text-xs font-medium text-olimpics-green-primary mt-1">
              Papéis: {event.roles.map(role => role.nome).join(', ')}
            </p>
          )}
        </div>
        {!event.isRegistered && event.isOpen && (
          <div className="mb-4">
            <RadioGroup
              value={selectedRole}
              onValueChange={(value) => onRoleChange(value as 'ATL' | 'PGR')}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ATL" id={`atleta-${event.id}`} />
                <Label htmlFor={`atleta-${event.id}`}>Atleta</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PGR" id={`publico-${event.id}`} />
                <Label htmlFor={`publico-${event.id}`}>Público Geral</Label>
              </div>
            </RadioGroup>
          </div>
        )}
        <Button
          onClick={onEventAction}
          variant={event.isRegistered ? "default" : "outline"}
          className="w-full"
          disabled={!event.isOpen && !event.isRegistered}
        >
          {event.isRegistered 
            ? 'Acessar evento' 
            : event.isOpen 
              ? 'Quero me cadastrar'
              : 'Inscrições encerradas'}
        </Button>
      </CardContent>
    </Card>
  );
};
