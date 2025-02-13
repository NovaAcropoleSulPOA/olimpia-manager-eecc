
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Event } from "@/lib/types/database";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EventCardProps {
  event: Event & {
    isRegistered: boolean;
    roles: Array<{ nome: string; codigo: string }>;
    isOpen: boolean;
    isAdmin: boolean;
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
  const isDisabled = (event.status_evento === 'encerrado' || event.status_evento === 'suspenso') 
    && !event.isRegistered 
    && !event.isAdmin;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'encerrado':
        return 'bg-red-100 text-red-800';
      case 'suspenso':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getButtonLabel = () => {
    if (event.isRegistered) return 'Acessar evento';
    if (isDisabled) return event.status_evento === 'encerrado' ? 'Inscrições encerradas' : 'Evento suspenso';
    return 'Quero me cadastrar';
  };

  return (
    <Card 
      className={`
        relative overflow-hidden transition-all duration-200 hover:shadow-lg mx-2
        ${event.isRegistered ? 'ring-2 ring-olimpics-green-primary' : ''}
      `}
    >
      <CardContent className="p-6">
        {/* Status Badge */}
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status_evento)}`}>
          {event.status_evento.charAt(0).toUpperCase() + event.status_evento.slice(1)}
        </div>

        {/* Status Alert */}
        {(event.status_evento === 'encerrado' || event.status_evento === 'suspenso') && !event.isRegistered && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {event.status_evento === 'encerrado' 
                ? 'Este evento está encerrado para novas inscrições.' 
                : 'Este evento está temporariamente suspenso.'}
            </AlertDescription>
          </Alert>
        )}

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
        {!event.isRegistered && !isDisabled && (
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
          disabled={isDisabled}
        >
          {getButtonLabel()}
        </Button>
      </CardContent>
    </Card>
  );
};
