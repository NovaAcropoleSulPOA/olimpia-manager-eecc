
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaymentAmountFieldProps {
  value: string;
  disabled: boolean;
  isUpdating: boolean;
  onInputChange: (value: string) => void;
  onSave: () => void;
  onBlur: () => void;
}

export const PaymentAmountField = React.memo(({
  value,
  disabled,
  isUpdating,
  onInputChange,
  onSave,
  onBlur
}: PaymentAmountFieldProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^\d.]/g, '');
    const parts = newValue.split('.');
    if (parts.length > 2) return; // Don't allow multiple decimal points
    if (parts[1]?.length > 2) return; // Don't allow more than 2 decimal places
    onInputChange(newValue);
  };

  return (
    <div className="mt-4 flex items-center gap-2">
      <label className="text-sm text-muted-foreground">Valor do pagamento:</label>
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        className="w-[180px]"
        disabled={disabled || isUpdating}
        ref={inputRef}
      />
      {!disabled && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={isUpdating}
        >
          Salvar
        </Button>
      )}
    </div>
  );
});

PaymentAmountField.displayName = 'PaymentAmountField';
