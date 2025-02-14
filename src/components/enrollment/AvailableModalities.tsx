
import React from 'react';
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { UseMutationResult } from "@tanstack/react-query";

interface Modality {
  id: number;
  nome: string;
  categoria?: string;
  tipo_modalidade: string;
  vagas_ocupadas: number;
  limite_vagas: number;
  grupo?: string;
}

interface AvailableModalitiesProps {
  groupedModalities: Record<string, Modality[]>;
  registeredModalities: any[];
  registerMutation: UseMutationResult<void, Error, number, unknown>;
}

export const AvailableModalities = ({
  groupedModalities,
  registeredModalities,
  registerMutation,
}: AvailableModalitiesProps) => {
  // Function to check if a modality is already registered
  const isModalityRegistered = (modalityId: number): boolean => {
    return registeredModalities.some(
      registration => registration.modalidade.id === modalityId
    );
  };

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-xl font-bold text-olimpics-text">
        Modalidades Disponíveis
      </h2>
      <Accordion type="single" collapsible className="space-y-4">
        {groupedModalities && Object.entries(groupedModalities).map(([grupo, modalities]) => {
          // Filter out already registered modalities before checking if there are available ones
          const availableModalities = modalities.filter(
            modality => !isModalityRegistered(modality.id)
          );

          // Don't show the group if there are no available modalities
          if (availableModalities.length === 0) return null;

          return (
            <AccordionItem
              key={grupo}
              value={grupo}
              className="border rounded-lg px-4 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-olimpics-text">{grupo}</h3>
                  <span className="text-sm text-gray-500">
                    ({availableModalities.length} modalidades)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-olimpics-green-primary/5 hover:bg-olimpics-green-primary/10">
                        <TableHead className="font-semibold">Modalidade</TableHead>
                        <TableHead className="font-semibold">Tipo</TableHead>
                        <TableHead className="font-semibold">Categoria</TableHead>
                        <TableHead className="font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableModalities.map((modality) => (
                        <TableRow
                          key={modality.id}
                          className="transition-colors hover:bg-gray-50"
                        >
                          <TableCell className="font-medium">
                            {modality.nome}
                          </TableCell>
                          <TableCell className="capitalize">
                            {modality.tipo_modalidade}
                          </TableCell>
                          <TableCell className="capitalize">
                            {modality.categoria}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="default"
                              size="sm"
                              disabled={registerMutation.isPending}
                              onClick={() => registerMutation.mutate(modality.id)}
                              className="bg-olimpics-green-primary hover:bg-olimpics-green-primary/90 transition-all duration-200"
                            >
                              {registerMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processando...
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-1" />
                                  Inscrever
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};
