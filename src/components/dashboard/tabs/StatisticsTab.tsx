
import { BranchAnalytics } from "@/types/api";
import { SummaryCards } from "../charts/SummaryCards";
import { ModalitiesChart } from "../charts/ModalitiesChart";
import { PaymentStatusPieChart } from "../charts/PaymentStatusPieChart";
import { BranchRegistrationsChart } from "../charts/BranchRegistrationsChart";
import { 
  calculateTotals, 
  transformModalitiesData, 
  transformPaymentStatusData, 
  transformBranchRegistrationsData 
} from "../charts/dataTransformers";
import { ChartConfig } from "@/components/ui/chart/types";

// Define a consistent color palette
const CHART_COLORS = {
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#EF4444',
  blue: '#6366F1',
  purple: '#8B5CF6',
  pink: '#EC4899'
};

const PAYMENT_STATUS_COLORS = {
  'confirmado': CHART_COLORS.green,
  'pendente': CHART_COLORS.yellow,
  'cancelado': CHART_COLORS.red
};

// Chart config that matches the ChartConfig type
const CHART_CONFIG: ChartConfig = {
  modalities: {
    color: CHART_COLORS.blue,
    label: 'Modalidades'
  },
  confirmado: {
    color: CHART_COLORS.green,
    label: 'Confirmado'
  },
  pendente: {
    color: CHART_COLORS.yellow,
    label: 'Pendente'
  },
  cancelado: {
    color: CHART_COLORS.red,
    label: 'Cancelado'
  },
  categories: {
    color: CHART_COLORS.purple,
    label: 'Categorias'
  },
  total: {
    color: CHART_COLORS.blue,
    label: 'Total'
  }
};

interface StatisticsTabProps {
  data: BranchAnalytics[];
  currentBranchId?: string;
}

export function StatisticsTab({ data, currentBranchId }: StatisticsTabProps) {
  console.log("StatisticsTab data:", data);
  console.log("currentBranchId:", currentBranchId);
  
  // Check if data is valid and properly structured 
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg text-muted-foreground">Não há dados estatísticos disponíveis</p>
        <p className="text-sm text-muted-foreground">Verifique se existem inscrições registradas para este evento</p>
      </div>
    );
  }

  // Filter data by branch if we're in delegation view
  const filteredData = currentBranchId 
    ? data.filter(item => item.filial_id === currentBranchId)
    : data;
    
  console.log("Filtered data for statistics:", filteredData);

  // If no data after filtering, show no data message
  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg text-muted-foreground">Não há dados estatísticos disponíveis para esta filial</p>
        <p className="text-sm text-muted-foreground">Verifique se existem inscrições confirmadas para esta filial</p>
      </div>
    );
  }

  // Calculate totals
  const totals = calculateTotals(filteredData);
  console.log("Calculated totals:", totals);

  // Transform data for charts
  const modalitiesData = transformModalitiesData(filteredData);
  console.log("Modalities chart data:", modalitiesData);

  const paymentStatusData = transformPaymentStatusData(filteredData, PAYMENT_STATUS_COLORS);
  console.log("Payment status chart data:", paymentStatusData);

  const branchRegistrationsData = transformBranchRegistrationsData(filteredData);
  console.log("Branch registrations chart data:", branchRegistrationsData);

  return (
    <div className="space-y-8">
      {/* Summary Cards Section */}
      <SummaryCards totals={totals} />

      {/* Branch Registrations Chart - Now takes full width */}
      <BranchRegistrationsChart 
        data={branchRegistrationsData} 
        chartColors={CHART_COLORS} 
        chartConfig={CHART_CONFIG} 
      />

      {/* Charts Section - Now 2 columns */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Popular Modalities Chart */}
        <ModalitiesChart 
          data={modalitiesData} 
          chartColors={CHART_COLORS} 
          chartConfig={CHART_CONFIG} 
        />

        {/* Payment Status Chart */}
        <PaymentStatusPieChart 
          data={paymentStatusData} 
          chartConfig={CHART_CONFIG} 
          title="Status de Pagamento"
          description="Distribuição dos pagamentos por status"
        />
      </div>
    </div>
  );
}
