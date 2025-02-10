
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

interface ModalityCount {
  nome: string;
  total: number;
}

interface GroupedData {
  filial: string;
  modalidades: ModalityCount[];
  totalInscritos: number;
}

export function ModalitiesTable({ data }: ModalitiesTableProps) {
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);

  // Transform and group data by branch
  const groupedData: GroupedData[] = data.reduce((acc: GroupedData[], branch) => {
    if (!branch.modalidades_populares) return acc;

    console.log('Processing branch data:', branch.filial, branch.modalidades_populares);

    // Parse the modalidades_populares JSON if it's a string
    let modalidadesPopulares = branch.modalidades_populares;
    if (typeof modalidadesPopulares === 'string') {
      try {
        modalidadesPopulares = JSON.parse(modalidadesPopulares);
      } catch (e) {
        console.error('Error parsing modalidades_populares:', e);
        return acc;
      }
    }

    // Extract modalities and their totals
    const modalidades: ModalityCount[] = [];
    if (Array.isArray(modalidadesPopulares)) {
      modalidadesPopulares.forEach(item => {
        if (item.modalidade && typeof item.total_inscritos === 'number') {
          modalidades.push({
            nome: item.modalidade,
            total: item.total_inscritos
          });
        }
      });
    }

    const totalInscritos = modalidades.reduce((sum, mod) => sum + mod.total, 0);

    acc.push({
      filial: branch.filial,
      modalidades: modalidades.sort((a, b) => b.total - a.total),
      totalInscritos
    });

    return acc;
  }, []).sort((a, b) => b.totalInscritos - a.totalInscritos);

  console.log('Grouped data:', groupedData);

  // Prepare data for the stacked bar chart
  const chartData = groupedData.map(branch => {
    const modalityData = {
      filial: branch.filial,
      ...branch.modalidades.reduce((acc, mod) => ({
        ...acc,
        [mod.nome]: mod.total
      }), {})
    };
    console.log('Chart data for branch:', branch.filial, modalityData);
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

  // Generate colors for each modality
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
                {`${entry.name}: ${entry.value} ${entry.value === 1 ? 'inscrito' : 'inscritos'}`}
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
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="filial" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ 
                    fontSize: 11,
                    fill: '#4b5563',
                    dy: 10
                  }}
                  tickMargin={35}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#4b5563' }}
                  tickFormatter={(value) => `${value}`}
                  label={{
                    value: 'Número de Inscritos',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: 12 }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ 
                    paddingBottom: '20px',
                    fontSize: '12px'
                  }}
                />
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

          {/* Branch Details */}
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
                        {branch.totalInscritos} {branch.totalInscritos === 1 ? 'inscrição(ões)' : 'inscrições nas modalidades'}
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
                        className="flex justify-between items-center py-2 px-4 bg-white rounded-lg shadow-sm"
                      >
                        <span className="text-olimpics-text">
                          🏅 {modalidade.nome}
                        </span>
                        <Badge variant="secondary">
                          {modalidade.total} {modalidade.total === 1 ? 'inscrito' : 'inscritos'}
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
