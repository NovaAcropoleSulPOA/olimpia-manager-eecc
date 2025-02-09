
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InputMask from 'react-input-mask';
import { UseFormReturn } from 'react-hook-form';
import { UseQueryResult } from '@tanstack/react-query';

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

      <FormField
        control={form.control}
        name="telefone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-left w-full">Telefone com DDD</FormLabel>
            <FormControl>
              <InputMask
                mask="(99) 99999-9999"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              >
                {(inputProps: any) => (
                  <Input
                    {...inputProps}
                    type="tel"
                    placeholder="(XX) XXXXX-XXXX"
                    className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary"
                  />
                )}
              </InputMask>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
