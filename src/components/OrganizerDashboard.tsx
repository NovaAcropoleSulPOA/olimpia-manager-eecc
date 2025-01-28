import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  fetchBranchAnalytics, 
  fetchAthleteRegistrations,
  updateModalityStatus,
  type AthleteRegistration,
  type BranchAnalytics 
} from "@/lib/api";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AthleteRegistrationCard } from './AthleteRegistrationCard';

const COLORS = [
  "#009B40",
  "#EE7E01",
  "#4CAF50",
  "#2196F3",
  "#9C27B0",
  "#FF5722",
];

const DashboardOverview = ({ branchAnalytics }: { branchAnalytics: BranchAnalytics[] }) => {
  const totalAthletes = branchAnalytics?.reduce((acc, branch) => acc + branch.total_inscritos, 0) || 0;
  const totalRevenue = branchAnalytics?.reduce((acc, branch) => acc + branch.valor_total_arrecadado, 0) || 0;
  const totalRegistrations = branchAnalytics?.reduce((acc, branch) => acc + branch.total_inscricoes, 0) || 0;
  const averageScore = branchAnalytics?.reduce((acc, branch) => acc + branch.media_pontuacao_atletas, 0) || 0;

  const registrationStatusData = branchAnalytics?.map(branch => ({
    name: branch.filial,
    Confirmadas: branch.inscricoes_confirmadas,
    Pendentes: branch.inscricoes_pendentes,
    Canceladas: branch.inscricoes_canceladas,
    Recusadas: branch.inscricoes_recusadas,
  }));

  const popularModalitiesData = branchAnalytics?.flatMap(branch => {
    const modalidades = branch.modalidades_populares as Record<string, number>;
    return Object.entries(modalidades).map(([modalidade, count]) => ({
      name: modalidade,
      value: count as number,
    }));
  }).reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.name);
    if (existing) {
      existing.value += curr.value;
    } else {
      acc.push(curr);
    }
    return acc;
  }, [] as { name: string; value: number }[]) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Atletas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAthletes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Inscrições</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegistrations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Arrecadado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Pontuação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(averageScore / (branchAnalytics?.length || 1)).toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status das Inscrições por Filial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={registrationStatusData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Confirmadas" stackId="a" fill="#4CAF50" />
                  <Bar dataKey="Pendentes" stackId="a" fill="#FFC107" />
                  <Bar dataKey="Canceladas" stackId="a" fill="#F44336" />
                  <Bar dataKey="Recusadas" stackId="a" fill="#9C27B0" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modalidades Mais Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={popularModalitiesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {popularModalitiesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes por Filial</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="w-full">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Filial</th>
                    <th className="text-right p-2">Atletas</th>
                    <th className="text-right p-2">Inscrições</th>
                    <th className="text-right p-2">Valor Arrecadado</th>
                    <th className="text-right p-2">Modalidades Ativas</th>
                    <th className="text-right p-2">Pontuação Média</th>
                  </tr>
                </thead>
                <tbody>
                  {branchAnalytics?.map((branch) => (
                    <tr key={branch.filial_id} className="border-b">
                      <td className="p-2">
                        <div className="font-medium">{branch.filial}</div>
                        <div className="text-sm text-gray-500">
                          {branch.cidade}, {branch.estado}
                        </div>
                      </td>
                      <td className="text-right p-2">{branch.total_inscritos}</td>
                      <td className="text-right p-2">{branch.total_inscricoes}</td>
                      <td className="text-right p-2">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(branch.valor_total_arrecadado)}
                      </td>
                      <td className="text-right p-2">{branch.modalidades_ativas}</td>
                      <td className="text-right p-2">{branch.media_pontuacao_atletas.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

const RegistrationsManagement = () => {
  const { data: registrations, isLoading, refetch } = useQuery({
    queryKey: ['athlete-registrations'],
    queryFn: fetchAthleteRegistrations,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [validationFilter, setValidationFilter] = useState<string>('all');

  const updateModalityStatusMutation = useMutation({
    mutationFn: async ({ modalityId, status, justification }: { modalityId: string; status: string; justification: string }) => {
      return updateModalityStatus(modalityId, status, justification);
    },
    onSuccess: () => {
      refetch();
      toast.success('Status da modalidade atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating modality status:', error);
      toast.error('Erro ao atualizar status da modalidade');
    },
  });

  const filteredRegistrations = registrations?.filter(registration => {
    const matchesSearch = 
      registration.nome_atleta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.filial.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPayment = paymentFilter === 'all' || registration.status_pagamento === paymentFilter;
    const matchesValidation = validationFilter === 'all' || 
      (validationFilter === 'validated' && registration.confirmado) ||
      (validationFilter === 'unvalidated' && !registration.confirmado);
    
    return matchesSearch && matchesPayment && matchesValidation;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Atletas</CardTitle>
        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 mt-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome, email ou filial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <Label htmlFor="payment-status">Status Pagamento</Label>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger id="payment-status" className="w-[180px]">
                <SelectValue placeholder="Filtrar por pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="validation-status">Status de Validação</Label>
            <Select value={validationFilter} onValueChange={setValidationFilter}>
              <SelectTrigger id="validation-status" className="w-[180px]">
                <SelectValue placeholder="Filtrar por validação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="validated">Validado</SelectItem>
                <SelectItem value="unvalidated">Não Validado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRegistrations?.map((registration) => (
            <AthleteRegistrationCard
              key={registration.id}
              registration={registration}
              onStatusChange={(modalityId, status, justification) =>
                updateModalityStatusMutation.mutateAsync({ modalityId, status, justification })
              }
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function OrganizerDashboard() {
  const { data: branchAnalytics, isLoading } = useQuery({
    queryKey: ['branch-analytics'],
    queryFn: fetchBranchAnalytics,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="registrations">Gerenciamento de Inscrições</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <DashboardOverview branchAnalytics={branchAnalytics} />
        </TabsContent>
        <TabsContent value="registrations">
          <RegistrationsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
