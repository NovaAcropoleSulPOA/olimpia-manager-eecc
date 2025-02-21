
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from 'react-hook-form';
import { PhoneInput } from './phone/PhoneInput';
import { useQuery } from '@tanstack/react-query';
import { fetchBranches } from '@/lib/api';

interface ContactSectionProps {
  form: UseFormReturn<any>;
  hideEmail?: boolean;
  branches?: any[];
  isLoadingBranches?: boolean;
}

export const ContactSection = ({ 
  form, 
  hideEmail,
  branches: propBranches,
  isLoadingBranches: propIsLoadingBranches
}: ContactSectionProps) => {
  const { data: fetchedBranches = [], isLoading: isFetchingBranches } = useQuery({
    queryKey: ['branches'],
    queryFn: fetchBranches,
    select: (data) => {
      return data ? [...data].sort((a, b) => a.nome.localeCompare(b.nome)) : [];
    },
    enabled: !propBranches // Only fetch if branches were not provided as props
  });

  const branches = propBranches || fetchedBranches;
  const isLoadingBranches = propIsLoadingBranches || isFetchingBranches;

  return (
    <div className="space-y-4">
      {!hideEmail && (
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
      )}

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
