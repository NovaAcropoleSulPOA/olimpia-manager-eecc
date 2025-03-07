
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface DialogActionsProps {
  onCancel: () => void;
  onSave: () => void;
  isUpdating: boolean;
  disabled: boolean;
}

export const DialogActions = ({ 
  onCancel, 
  onSave, 
  isUpdating, 
  disabled 
}: DialogActionsProps) => {
  return (
    <div className="flex justify-end space-x-2">
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={isUpdating}
      >
        Cancelar
      </Button>
      <Button
        onClick={onSave}
        disabled={isUpdating || disabled}
      >
        {isUpdating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          'Salvar'
        )}
      </Button>
    </div>
  );
};
