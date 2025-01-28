import { supabase } from './supabase';

export const fetchAthleteRegistrations = async (userId: string) => {
  try {
    console.log('Fetching registrations for user:', userId);
    
    const { data: modalityRegistrations, error: registrationError } = await supabase
      .from('inscricoes_modalidades')
      .select(`
        status,
        modalidade_id,
        modalidades (
          id,
          nome
        )
      `)
      .eq('atleta_id', userId);

    if (registrationError) {
      console.error('Error fetching modality registrations:', registrationError);
      return null;
    }

    const modalityNames = modalityRegistrations?.map(reg => 
      reg.modalidades?.nome || 'N/A'
    ) || [];

    const { data: payments, error: paymentError } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('atleta_id', userId)
      .order('data_criacao', { ascending: false })
      .limit(1);

    if (paymentError) {
      console.error('Error fetching payment status:', paymentError);
      return null;
    }

    const { data: scores, error: scoresError } = await supabase
      .from('pontuacoes')
      .select('valor_pontuacao')
      .eq('atleta_id', userId);

    if (scoresError) {
      console.error('Error fetching scores:', scoresError);
      return null;
    }

    const registrationStatus = modalityRegistrations?.[0]?.status || 'Pendente';
    const paymentStatus = (payments?.[0]?.status || 'pendente') as 'pendente' | 'confirmado' | 'cancelado';
    const totalPoints = scores?.reduce((sum, score) => sum + (score.valor_pontuacao || 0), 0) || 0;

    return {
      modalityNames,
      registrationStatus,
      paymentStatus,
      totalPoints
    };
  } catch (error) {
    console.error('Error in fetchAthleteRegistrations:', error);
    return null;
  }
};
