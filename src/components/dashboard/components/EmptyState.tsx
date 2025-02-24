
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center">
      <p className="text-muted-foreground mb-2">Nenhum dado disponível no momento</p>
      <p className="text-sm text-muted-foreground mb-4">
        Verifique se existem inscrições registradas no sistema
      </p>
      <Button
        variant="outline"
        onClick={() => {
          window.location.reload();
        }}
      >
        Atualizar Dados
      </Button>
    </div>
  );
}
