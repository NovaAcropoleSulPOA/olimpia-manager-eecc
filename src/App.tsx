import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PendingApproval from "./pages/PendingApproval";
import RejectedAccess from "./pages/RejectedAccess";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pending-approval" element={<PendingApproval />} />
              <Route path="/rejected" element={<RejectedAccess />} />
              <Route path="/athlete" element={<Navigate to="/dashboard" replace />} />
              <Route path="/judge" element={<Navigate to="/dashboard" replace />} />
              <Route path="/organizer" element={<Navigate to="/dashboard" replace />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;