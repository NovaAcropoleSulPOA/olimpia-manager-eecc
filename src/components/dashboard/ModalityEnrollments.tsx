
import React, { useState, useRef } from 'react';
import { Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Printer } from "lucide-react";

interface EnrolledUser {
  nome_atleta: string;
  tipo_documento: string;
  numero_documento: string;
  telefone: string;
  email: string;
  filial: string;
  filial_id: string;
  modalidade_nome: string;
}

interface GroupedEnrollments {
  [modalidade: string]: {
    [filial: string]: EnrolledUser[];
  };
}

interface ModalityEnrollmentsProps {
  enrollments: EnrolledUser[];
}

export const ModalityEnrollments = ({ enrollments }: ModalityEnrollmentsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedModality, setExpandedModality] = useState<string | null>(null);
  const [expandedFilial, setExpandedFilial] = useState<string | null>(null);

  // Group enrollments by modality and then by filial
  const groupedEnrollments = enrollments.reduce((acc: GroupedEnrollments, enrollment) => {
    const { modalidade_nome, filial } = enrollment;
    
    if (!acc[modalidade_nome]) {
      acc[modalidade_nome] = {};
    }
    
    if (!acc[modalidade_nome][filial]) {
      acc[modalidade_nome][filial] = [];
    }
    
    acc[modalidade_nome][filial].push(enrollment);
    return acc;
  }, {});

  // Filter enrollments based on search term
  const filterEnrollments = (users: EnrolledUser[]) => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.nome_atleta.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.numero_documento.toLowerCase().includes(term)
    );
  };

  const handlePrint = () => {
    // Expand all sections before printing
    setExpandedModality(null);
    setExpandedFilial(null);
    window.print();
  };

  return (
    <div className="space-y-6">
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            .print-expanded {
              display: block !important;
            }
            .print-break-after {
              page-break-after: always;
            }
            [data-state="closed"] {
              display: block !important;
            }
            [data-state="closed"] > div {
              display: block !important;
            }
          }
        `}
      </style>

      <div className="flex items-center justify-between gap-4 no-print">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, email ou documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={handlePrint}
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Imprimir Lista
        </Button>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedEnrollments).map(([modalidade, filiais]) => (
          <Card key={modalidade} className="overflow-hidden">
            <Collapsible
              open={expandedModality === modalidade}
              onOpenChange={() => setExpandedModality(expandedModality === modalidade ? null : modalidade)}
            >
              <CollapsibleTrigger className="w-full">
                <CardHeader className="bg-olimpics-green-primary/5 hover:bg-olimpics-green-primary/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-olimpics-text flex items-center gap-2">
                      {modalidade}
                      <Badge variant="secondary" className="ml-2">
                        {Object.values(filiais).flat().length} inscritos
                      </Badge>
                    </CardTitle>
                    <ChevronDown className="h-5 w-5 no-print" />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent className="print-expanded">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {Object.entries(filiais).map(([filial, users]) => {
                      const filteredUsers = filterEnrollments(users);
                      if (filteredUsers.length === 0) return null;

                      return (
                        <Collapsible
                          key={filial}
                          open={expandedFilial === `${modalidade}-${filial}`}
                          onOpenChange={() => setExpandedFilial(expandedFilial === `${modalidade}-${filial}` ? null : `${modalidade}-${filial}`)}
                        >
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{filial}</span>
                                <Badge variant="outline">
                                  {filteredUsers.length} atletas
                                </Badge>
                              </div>
                              <ChevronDown className="h-4 w-4 no-print" />
                            </div>
                          </CollapsibleTrigger>

                          <CollapsibleContent className="print-expanded">
                            <div className="mt-4 rounded-lg border overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-olimpics-green-primary/5">
                                    <TableHead className="font-semibold">Nome</TableHead>
                                    <TableHead className="font-semibold">Documento</TableHead>
                                    <TableHead className="font-semibold">Contato</TableHead>
                                    <TableHead className="font-semibold">Email</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {filteredUsers.map((user, index) => (
                                    <TableRow key={`${user.numero_documento}-${index}`}>
                                      <TableCell className="font-medium">
                                        {user.nome_atleta}
                                      </TableCell>
                                      <TableCell>
                                        {user.tipo_documento}: {user.numero_documento}
                                      </TableCell>
                                      <TableCell>{user.telefone}</TableCell>
                                      <TableCell>{user.email}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
};
