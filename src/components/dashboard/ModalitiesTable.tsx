import { BranchAnalytics } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ModalitiesTableProps {
  data: BranchAnalytics[];
}

interface GroupedData {
  filial: string;
  modalidades: {
    nome: string;
    total: number;
  }[];
  totalInscritos: number;
}

export function ModalitiesTable({ data }: ModalitiesTableProps) {
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);

  // Transform and group data by branch
  const groupedData: GroupedData[] = data.reduce((acc: GroupedData[], branch) => {
    if (!branch.modalidades_populares) return acc;

    const modalidades = Object.entries(branch.modalidades_populares as Record<string, {
      Masculino?: number;
      Feminino?: number;
      Misto?: number;
    }>).map(([nome, categorias]) => ({
      nome,
      total: (categorias.Masculino || 0) + (categorias.Feminino || 0) + (categorias.Misto || 0)
    }));

    const totalInscritos = modalidades.reduce((sum, mod) => sum + mod.total, 0);

    acc.push({
      filial: branch.filial,
      modalidades: modalidades.sort((a, b) => b.total - a.total),
      totalInscritos
    });

    return acc;
  }, []).sort((a, b) => b.totalInscritos - a.totalInscritos);

  // Prepare data for the stacked bar chart
  const chartData = groupedData.map(branch => {
    const modalityData = branch.modalidades.reduce((acc, mod) => {
      acc[mod.nome] = mod.total;
      return acc;
    }, { filial: branch.filial } as Record<string, any>);
    return modalityData;
  });

  // Get unique modality names for chart configuration
  const modalityNames = Array.from(
    new Set(
      groupedData.flatMap(branch => 
        branch.modalidades.map(mod => mod.nome)
      )
    )
  );

  // Generate random colors for each modality
  const COLORS = [
    '#009B40', '#EE7E01', '#4CAF50', '#2196F3', 
    '#9C27B0', '#FF5722', '#795548', '#607D8B'
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border">
          <p className="font-bold text-olimpics-text mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            entry.value > 0 && (
              <p
                key={index}
                style={{ color: entry.color }}
                className="text-sm"
              >
                {`${entry.name}: ${entry.value} inscritos`}
              </p>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-olimpics-text">
          Inscrições por Modalidade e Filial
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Stacked Bar Chart */}
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="filial" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {modalityNames.map((modality, index) => (
                  <Bar
                    key={modality}
                    dataKey={modality}
                    stackId="a"
                    fill={COLORS[index % COLORS.length]}
                    name={modality}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Expandable Branch Details */}
          <div className="space-y-4">
            {groupedData.map((branch) => (
              <Collapsible
                key={branch.filial}
                open={expandedBranch === branch.filial}
                onOpenChange={() => 
                  setExpandedBranch(
                    expandedBranch === branch.filial ? null : branch.filial
                  )
                }
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">{branch.filial}</span>
                      <Badge variant="outline" className="bg-olimpics-green-primary/10">
                        {branch.totalInscritos} inscritos
                      </Badge>
                    </div>
                    {expandedBranch === branch.filial ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 space-y-2">
                    {branch.modalidades.map((modalidade) => (
                      <div
                        key={modalidade.nome}
                        className="flex justify-between items-center py-2"
                      >
                        <span>{modalidade.nome}</span>
                        <Badge>
                          {modalidade.total} inscritos
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}