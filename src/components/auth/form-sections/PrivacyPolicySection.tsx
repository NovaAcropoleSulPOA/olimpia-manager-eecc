
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import { Loader2 } from "lucide-react";

interface PrivacyPolicySectionProps {
  form: UseFormReturn<any>;
}

export const PrivacyPolicySection = ({ form }: PrivacyPolicySectionProps) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const { data: privacyPolicy, isLoading } = useQuery({
    queryKey: ['privacy-policy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('termos_privacidade')
        .select('termo_texto')
        .eq('ativo', true)
        .order('data_criacao', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  return (
    <>
      <FormField
        control={form.control}
        name="acceptPrivacyPolicy"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <div className="text-sm text-muted-foreground">
                Li e concordo com a{" "}
                <button
                  type="button"
                  className="text-olimpics-green-primary hover:underline"
                  onClick={() => setDialogOpen(true)}
                >
                  Política de Privacidade
                </button>
              </div>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Política de Privacidade</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] mt-4 rounded-md border p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {privacyPolicy?.termo_texto ? (
                  <ReactMarkdown>{privacyPolicy.termo_texto}</ReactMarkdown>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma política de privacidade encontrada.
                  </p>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
