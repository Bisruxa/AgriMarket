
import { Clock, CheckCircle, XCircle } from 'lucide-react';

export const getStatusBadge = (status: string, t?: any) => {
  switch(status) {
    case 'approved':
      return (
        <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" /> 
          {t?.status?.approved || 'Approved'}
        </span>
      );
    case 'rejected':
      return (
        <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
          <XCircle className="w-3 h-3" /> 
          {t?.status?.rejected || 'Rejected'}
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3" /> 
          {t?.status?.pending || 'Pending'}
        </span>
      );
  }
};

// Also export as a component if you prefer
interface StatusBadgeProps {
  status: string;
  t?: any;
}

export const StatusBadge = ({ status, t }: StatusBadgeProps) => {
  return getStatusBadge(status, t);
};