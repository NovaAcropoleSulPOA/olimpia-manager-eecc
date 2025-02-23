
import { Button } from "@/components/ui/button";

export function NoEventSelected() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-2">Nenhum evento selecionado</p>
        <Button
          variant="outline"
          onClick={() => {
            window.location.href = '/event-selection';
          }}
        >
          Selecionar Evento
        </Button>
      </div>
    </div>
  );
}
