
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Event } from "@/lib/types/database";
import { EventCard } from "./EventCard";

interface EventCarouselProps {
  events: Array<Event & {
    isRegistered: boolean;
    roles: Array<{ nome: string; codigo: string }>;
    isOpen: boolean;
    isAdmin: boolean;
  }>;
  selectedRole: 'ATL' | 'PGR';
  onRoleChange: (value: 'ATL' | 'PGR') => void;
  onEventAction: (eventId: string) => void;
  userProfileType?: string | null;
}

export const EventCarousel = ({
  events,
  selectedRole,
  onRoleChange,
  onEventAction,
  userProfileType,
}: EventCarouselProps) => {
  // If user is a minor (C+7 or C-6), we force the role to be 'ATL'
  const isMinor = userProfileType && ['C+7', 'C-6'].includes(userProfileType);
  if (isMinor && selectedRole !== 'ATL') {
    onRoleChange('ATL');
  }

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
                onRoleChange={isMinor ? undefined : onRoleChange}
                onEventAction={() => onEventAction(event.id)}
                forceAthleteRole={isMinor}
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
