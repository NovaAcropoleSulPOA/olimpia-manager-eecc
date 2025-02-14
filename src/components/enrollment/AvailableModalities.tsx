
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
import { Modality, RegisteredModality } from "@/types/modality";

interface AvailableModalitiesProps {
  groupedModalities: Record<string, Modality[]>;
  registeredModalities: RegisteredModality[];
  registerMutation: UseMutationResult<void, Error, number, unknown>;
  userGender: string;
}

export const AvailableModalities = ({
  groupedModalities,
  registeredModalities,
  registerMutation,
  userGender,
}: AvailableModalitiesProps) => {
  // Improved function to check if a modality is registered
  const isModalityRegistered = (modalityId: number): boolean => {
    return registeredModalities.some(
      registration => registration.modalidade.id === modalityId
    );
  };

  // Check if modality category matches user gender
  const isModalityAllowedForGender = (modalityCategory: string): boolean => {
    const category = modalityCategory?.toLowerCase() || '';
    const gender = userGender?.toLowerCase() || '';

    if (!category || !gender) return false;

    if (gender === 'masculino') {
      return category === 'masculino' || category === 'misto';
    } else if (gender === 'feminino') {
      return category === 'feminino' || category === 'misto';
    }

    return false;
  };

  // Filter and process modalities
  const processedGroups = Object.entries(groupedModalities).reduce<Record<string, Modality[]>>(
    (acc, [grupo, modalities]) => {
      // Filter out modalities that are already registered or don't match gender
      const availableModalities = modalities.filter(
        modality => 
          !isModalityRegistered(modality.id) && 
          isModalityAllowedForGender(modality.categoria || '')
      );

      // Only include groups that have available modalities
      if (availableModalities.length > 0) {
        acc[grupo] = availableModalities;
      }

      return acc;
    },
    {}
  );

  // If there are no available modalities at all, show a message
  if (Object.keys(processedGroups).length === 0) {
    return (
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold text-olimpics-text">
          Modalidades Disponíveis
        </h2>
        <div className="text-center p-4 text-gray-500">
          Não há novas modalidades disponíveis para inscrição no momento.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-xl font-bold text-olimpics-text">
        Modalidades Disponíveis
      </h2>
      <Accordion type="single" collapsible className="space-y-4">
        {Object.entries(processedGroups).map(([grupo, modalities]) => (
          <AccordionItem
            key={grupo}
            value={grupo}
            className="border rounded-lg px-4 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-olimpics-text">{grupo}</h3>
                <span className="text-sm text-gray-500">
                  ({modalities.length} modalidades)
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
                      <TableHead className="font-semibold">Vagas</TableHead>
                      <TableHead className="font-semibold">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modalities.map((modality) => (
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
                          {modality.vagas_ocupadas}/{modality.limite_vagas}
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
        ))}
      </Accordion>
    </div>
  );
};
