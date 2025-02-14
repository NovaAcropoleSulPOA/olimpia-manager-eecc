
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Event } from "@/lib/types/database";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  event: Event & {
    isRegistered: boolean;
    roles?: Array<{ nome: string; codigo: string }>;
    isOpen: boolean;
    isAdmin: boolean;
  };
  selectedRole: 'ATL' | 'PGR';
  onRoleChange?: (value: 'ATL' | 'PGR') => void;
  onEventAction: () => void;
  forceAthleteRole?: boolean;
}

export const EventCard = ({ 
  event, 
  selectedRole, 
  onRoleChange, 
  onEventAction,
  forceAthleteRole = false
}: EventCardProps) => {
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        {event.foto_evento && (
          <div className="w-full h-40 rounded-t-lg overflow-hidden mb-4">
            <img 
              src={event.foto_evento} 
              alt={event.nome} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{event.nome}</CardTitle>
            <CardDescription className="mt-2">{event.descricao}</CardDescription>
          </div>
          <Badge variant={event.isOpen ? "default" : "secondary"}>
            {event.isOpen ? "Aberto" : "Fechado"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div className="text-sm text-gray-500">
            <p>Início das inscrições: {new Date(event.data_inicio_inscricao).toLocaleDateString()}</p>
            <p>Fim das inscrições: {new Date(event.data_fim_inscricao).toLocaleDateString()}</p>
          </div>
          {!event.isRegistered && !forceAthleteRole && (
            <RadioGroup
              value={selectedRole}
              onValueChange={onRoleChange}
              className="flex flex-col space-y-1.5"
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
          )}
          {(event.isRegistered || forceAthleteRole) && (
            <div className="text-sm text-gray-500">
              {forceAthleteRole ? 'Perfil: Atleta' : 'Já inscrito neste evento'}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onEventAction}
          className="w-full"
          variant={event.isRegistered ? "outline" : "default"}
          disabled={!event.isOpen && !event.isRegistered}
        >
          {event.isRegistered ? 'Acessar' : 'Inscrever-se'}
        </Button>
      </CardFooter>
    </Card>
  );
};
