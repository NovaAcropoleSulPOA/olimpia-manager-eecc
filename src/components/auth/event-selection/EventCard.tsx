
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Event } from "@/lib/types/database";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{event.nome}</CardTitle>
        <CardDescription>{event.descricao}</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
      <CardFooter>
        <Button
          onClick={onEventAction}
          className="w-full"
          variant={event.isRegistered ? "outline" : "default"}
        >
          {event.isRegistered ? 'Acessar' : 'Inscrever-se'}
        </Button>
      </CardFooter>
    </Card>
  );
};
