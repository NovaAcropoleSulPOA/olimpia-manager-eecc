
import React from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

interface StatusIndicatorProps {
  status: string;
}

export const StatusIndicator = ({ status }: StatusIndicatorProps) => {
  switch (status) {
    case 'confirmado':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'rejeitado':
      return <XCircle className="h-5 w-5 text-red-600" />;
    case 'pendente':
      return <Clock className="h-5 w-5 text-yellow-600" />;
    case 'cancelado':
      return <AlertCircle className="h-5 w-5 text-gray-600" />;
    default:
      return null;
  }
};
