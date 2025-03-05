
import { useQuery } from '@tanstack/react-query';
import { fetchBranches } from '@/lib/api';

export const useBranchData = () => {
  const { 
    data: branches,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['branches'],
    queryFn: fetchBranches,
    retry: 1,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching branches:', error);
      }
    }
  });

  return {
    branches,
    isLoading,
    error
  };
};
