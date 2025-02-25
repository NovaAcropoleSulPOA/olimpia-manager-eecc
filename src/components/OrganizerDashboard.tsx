
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ListChecks } from "lucide-react";
import { EmptyState } from "./dashboard/components/EmptyState";
import { LoadingState } from "./dashboard/components/LoadingState";
import { ErrorState } from "./dashboard/components/ErrorState";
import { DashboardHeader } from "./dashboard/components/DashboardHeader";
import { NoEventSelected } from "./dashboard/components/NoEventSelected";
import { AthletesTab } from "./dashboard/tabs/AthletesTab";
import { EnrollmentsTab } from "./dashboard/tabs/EnrollmentsTab";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const currentEventId = localStorage.getItem('currentEventId');
  
  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  const {
    isRefreshing,
    branches,
    athletes,
    confirmedEnrollments,
    isLoading,
    error,
    handleRefresh
  } = useDashboardData(currentEventId);

  if (!currentEventId) {
    return <NoEventSelected />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    console.error('Error fetching data:', error);
    toast.error('Erro ao carregar dados');
    return <ErrorState onRetry={handleRefresh} />;
  }

  if (!athletes || athletes.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <DashboardHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      <Tabs defaultValue="athletes" className="w-full">
        <TabsList className="w-full border-b mb-8 bg-background flex justify-start space-x-2 p-0">
          <TabsTrigger 
            value="athletes"
            className="flex items-center gap-2 px-6 py-3 text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none"
          >
            <Users className="h-5 w-5" />
            Gerenciar Atletas
          </TabsTrigger>
          <TabsTrigger 
            value="enrollments"
            className="flex items-center gap-2 px-6 py-3 text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none"
          >
            <ListChecks className="h-5 w-5" />
            Inscrições por Modalidade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="athletes" className="mt-6">
          <AthletesTab
            athletes={athletes || []}
            branches={branches || []}
            currentUserId={user?.id}
            currentEventId={currentEventId}
            filters={{
              nameFilter,
              branchFilter,
              paymentStatusFilter
            }}
            onFilterChange={{
              setNameFilter,
              setBranchFilter,
              setPaymentStatusFilter
            }}
          />
        </TabsContent>

        <TabsContent value="enrollments" className="mt-6">
          <EnrollmentsTab enrollments={confirmedEnrollments || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
