
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PasswordInput } from './password/PasswordInput';
import { PasswordStrengthIndicator } from './password/PasswordStrengthIndicator';

interface AuthSectionProps {
  form: UseFormReturn<any>;
}

export const AuthSection = ({ form }: AuthSectionProps) => {
  const watchPassword = form.watch('password');

  return (
    <div className="space-y-4">
      <div>
        <PasswordInput
          form={form}
          name="password"
          label="Senha"
        />
        <PasswordStrengthIndicator password={watchPassword || ''} />
      </div>

      <PasswordInput
        form={form}
        name="confirmPassword"
        label="Confirmar Senha"
      />
    </div>
  );
};
