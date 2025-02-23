
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function DashboardHeader({ onRefresh, isRefreshing }: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-olimpics-text">
        Dashboard do Organizador
      </h1>
      <Button 
        onClick={onRefresh} 
        disabled={isRefreshing}
        className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary text-white"
      >
        {isRefreshing ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Atualizando...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar Dados
          </>
        )}
      </Button>
    </div>
  );
}
