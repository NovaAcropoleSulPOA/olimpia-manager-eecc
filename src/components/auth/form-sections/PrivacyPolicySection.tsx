
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface PrivacyPolicySectionProps {
  form: UseFormReturn<any>;
}

export const PrivacyPolicySection = ({ form }: PrivacyPolicySectionProps) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const { data: privacyPolicy } = useQuery({
    queryKey: ['privacy-policy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('termos_privacidade')
        .select('*')
        .eq('ativo', true)
        .order('data_criacao', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const handleViewPdf = (pdfUrl: string) => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

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
            <div className="prose prose-sm max-w-none">
              {privacyPolicy?.termo_texto.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter className="sm:justify-start">
            {privacyPolicy?.link_pdf && (
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => handleViewPdf(privacyPolicy.link_pdf!)}
              >
                <FileText className="h-4 w-4" />
                Visualizar PDF completo
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
