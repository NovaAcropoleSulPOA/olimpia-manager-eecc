
import { supabase } from '@/lib/supabase';

export const DEFAULT_EVENT_ID = 'e88fc492-9b35-49f9-a88e-5b7f65d10b2d';

export const generateIdentifier = async (): Promise<string> => {
  const { count } = await supabase
    .from('pagamentos')
    .select('*', { count: 'exact', head: true })
    .eq('evento_id', DEFAULT_EVENT_ID);

  const nextNumber = (count || 0) + 1;
  return nextNumber.toString().padStart(3, '0');
};
