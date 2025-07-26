import { useState } from 'react';
import { toast } from 'sonner';
import getErrorMessage from '@/utils/getErrorMessage';

interface UseApiOptions<TResponse = any> {
  onSuccess?: (response: TResponse) => void;
  showToast?: boolean;
}

export function useApi<TArgs extends any[] = any[], TResponse = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = async (
    serviceFn: (...args: TArgs) => Promise<TResponse>,
    args: TArgs,
    options: UseApiOptions<TResponse> = {}
  ): Promise<TResponse | null> => {
    const { onSuccess, showToast = true } = options;

    setLoading(true);
    setError(null);

    try {
      const response: any = await serviceFn(...args);

      if (response.success) {
        if (showToast) toast.success(response.message);
        if (onSuccess) onSuccess(response);
        return response;
      } else {
        if (showToast) toast.error(response.message);
        return response;
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      if (showToast) toast.error(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { call, loading, error };
}
