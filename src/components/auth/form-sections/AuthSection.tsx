
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from 'react-hook-form';

interface AuthSectionProps {
  form: UseFormReturn<any>;
}

export const AuthSection = ({ form }: AuthSectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-left w-full">Senha</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="••••••"
                className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-left w-full">Confirmar Senha</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="••••••"
                className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
