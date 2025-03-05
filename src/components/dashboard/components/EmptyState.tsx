
import { Button } from "@/components/ui/button";
import { FileX } from "lucide-react";

interface EmptyStateProps {
  message?: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyState({ 
  message = "Nenhum dado disponível no momento",
  description = "Verifique se existem inscrições registradas no sistema",
  onAction = () => window.location.reload(),
  actionLabel = "Atualizar Dados"
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center p-8">
      <FileX className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground text-lg font-medium mb-2">{message}</p>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        {description}
      </p>
      <Button
        variant="outline"
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </div>
  );
}
