import { useQuery } from "@tanstack/react-query";
import { fetchBranchAnalytics, fetchAthleteRegistrations } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#009B40",
  "#EE7E01",
  "#4CAF50",
  "#2196F3",
  "#9C27B0",
  "#FF5722",
];

const DashboardOverview = ({ branchAnalytics }: { branchAnalytics: any[] }) => {
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

  const popularModalitiesData = branchAnalytics?.flatMap(branch => 
    Object.entries(branch.modalidades_populares).map(([modalidade, count]) => ({
      name: modalidade,
      value: count,
    }))
  ).reduce((acc, curr) => {
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
  const { data: registrations, isLoading } = useQuery({
    queryKey: ['athlete-registrations'],
    queryFn: fetchAthleteRegistrations,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  const handleWhatsAppClick = (phone: string) => {
    const formattedPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent('Olá! Gostaria de falar sobre sua inscrição nas Olimpíadas.');
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Inscrições</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Atleta</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Filial</TableHead>
                <TableHead>Modalidades</TableHead>
                <TableHead>Status da Inscrição</TableHead>
                <TableHead>Status do Pagamento</TableHead>
                <TableHead>Pontos Totais</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations?.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell>{registration.nome_atleta}</TableCell>
                  <TableCell>{registration.email}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleWhatsAppClick(registration.telefone)}
                      className="text-olimpics-green-primary hover:underline"
                    >
                      {registration.telefone}
                    </button>
                  </TableCell>
                  <TableCell>{registration.filial}</TableCell>
                  <TableCell>{registration.modalidades.join(', ')}</TableCell>
                  <TableCell>{registration.status_inscricao}</TableCell>
                  <TableCell>{registration.status_pagamento}</TableCell>
                  <TableCell>{registration.pontos_totais}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
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