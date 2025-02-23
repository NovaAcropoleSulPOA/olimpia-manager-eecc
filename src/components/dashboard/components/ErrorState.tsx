
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-red-500 mb-2">Erro ao carregar dados</p>
        <Button variant="outline" onClick={onRetry}>
          Tentar Novamente
        </Button>
      </div>
    </div>
  );
}
