
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Event } from "@/lib/types/database";
import { EventCard } from "./EventCard";

interface Modality {
  id: number;
  nome: string;
  categoria: string;
  tipo_modalidade: string;
  faixa_etaria: string;
  limite_vagas: number;
  vagas_ocupadas: number;
}

interface EventWithExtras extends Event {
  modalidades: Modality[];
  isRegistered: boolean;
  roles: Array<{ nome: string }>;
  isOpen: boolean;
  isAdmin: boolean;
}

interface EventCarouselProps {
  events: EventWithExtras[];
  selectedRole: 'ATL' | 'PGR';
  onRoleChange: (value: 'ATL' | 'PGR') => void;
  onEventAction: (eventId: string) => void;
}

export const EventCarousel = ({
  events,
  selectedRole,
  onRoleChange,
  onEventAction,
}: EventCarouselProps) => {
  return (
    <div className="relative w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {events.map((event) => (
            <CarouselItem key={event.id} className="md:basis-1/3">
              <EventCard
                event={event}
                selectedRole={selectedRole}
                onRoleChange={onRoleChange}
                onEventAction={() => onEventAction(event.id)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};
