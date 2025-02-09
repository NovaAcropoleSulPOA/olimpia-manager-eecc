
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from 'react-hook-form';

interface ProfileTypeSectionProps {
  form: UseFormReturn<any>;
}

export const ProfileTypeSection = ({ form }: ProfileTypeSectionProps) => {
  return (
    <FormField
      control={form.control}
      name="profile_type"
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel>Tipo de Cadastro</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Atleta" id="atleta" />
                <Label htmlFor="atleta">Atleta</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Público Geral" id="publico" />
                <Label htmlFor="publico">Público Geral</Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
