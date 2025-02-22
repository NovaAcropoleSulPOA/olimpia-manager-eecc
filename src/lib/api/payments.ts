
import { supabase } from '../supabase';

export const updatePaymentAmount = async (
  athleteId: string,
  amount: number
): Promise<void> => {
  console.log('Updating payment amount:', { athleteId, amount });
  
  try {
    const { error } = await supabase
      .from('pagamentos')
      .update({ valor: amount })
      .eq('atleta_id', athleteId);

    if (error) {
      console.error('Error updating payment amount:', error);
      throw new Error(error.message);
    }

    return Promise.resolve();
  } catch (error) {
    console.error('Error in updatePaymentAmount:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (
  athleteId: string,
  status: string
): Promise<void> => {
  console.log('Updating payment status:', { athleteId, status });
  
  try {
    const { error } = await supabase
      .rpc('atualizar_status_pagamento', {
        p_atleta_id: athleteId,
        p_novo_status: status
      });

    if (error) {
      console.error('Error updating payment status:', error);
      throw new Error(error.message);
    }

    return Promise.resolve();
  } catch (error) {
    console.error('Error in updatePaymentStatus:', error);
    throw error;
  }
};
