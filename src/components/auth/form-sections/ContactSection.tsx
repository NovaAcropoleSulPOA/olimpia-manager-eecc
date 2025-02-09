
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from 'react-hook-form';
import { PhoneInput } from './phone/PhoneInput';

interface ContactSectionProps {
  form: UseFormReturn<any>;
  branches: any[];
  isLoadingBranches: boolean;
}

export const ContactSection = ({ form, branches, isLoadingBranches }: ContactSectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-left w-full">Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="seu@email.com"
                className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <PhoneInput form={form} />

      <FormField
        control={form.control}
        name="branchId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sede</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua Sede" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
