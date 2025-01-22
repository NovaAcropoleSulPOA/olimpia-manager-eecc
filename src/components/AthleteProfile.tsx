import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, User, MapPin, Phone, Mail, List, Plus, CheckCircle, FileText } from 'lucide-react';
import AthleteScores from './AthleteScores';

interface Modality {
  id: number;
  nome: string;
  tipo_pontuacao: 'tempo' | 'distancia' | 'pontos';
  tipo_modalidade: 'individual' | 'coletivo';
  categoria: 'misto' | 'masculino' | 'feminino';
}

interface Inscription {
  id: number;
  status: 'Pendente' | 'Confirmada' | 'Recusada' | 'Cancelada';
  data_inscricao: string;
  modalidade: Modality;
}

interface Score {
  id: number;
  valor: number;
  modalidade: Modality;
}

interface Branch {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
}

interface Payment {
  id: number;
  status: 'pendente' | 'confirmado' | 'rejeitado';
  data_criacao: string;
  data_validacao?: string | null;
  comprovante_url?: string | null;
}

export default function AthleteProfile() {
  const { user } = useAuth();
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [availableModalities, setAvailableModalities] = useState<Modality[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchInscriptions(),
        fetchAvailableModalities(),
        fetchScores(),
        fetchBranch(),
        fetchPaymentInfo(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentInfo = async () => {
    try {
      console.log('Fetching payment info for athlete:', user?.id);
      const { data, error } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('atleta_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      console.log('Fetched payment info:', data);
      setPayment(data);
    } catch (error) {
      console.error('Error fetching payment info:', error);
      toast.error('Erro ao carregar informações de pagamento');
    }
  };

  const fetchInscriptions = async () => {
    try {
      console.log('Fetching inscriptions for athlete:', user?.id);
      const { data, error } = await supabase
        .from('inscricoes')
        .select(`
          id,
          status,
          data_inscricao,
          modalidade:modalidades (
            id,
            nome,
            tipo_pontuacao,
            tipo_modalidade,
            categoria
          )
        `)
        .eq('atleta_id', user?.id);
  
      if (error) throw error;
  
      const formattedData = data.map(insc => ({
        id: insc.id,
        status: insc.status,
        data_inscricao: insc.data_inscricao,
        modalidade: insc.modalidade
      }));
  
      console.log('Fetched inscriptions:', formattedData);
      setInscriptions(formattedData || []);
    } catch (error) {
      console.error('Error fetching inscriptions:', error);
      toast.error('Erro ao carregar inscrições');
    }
  };  

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-olimpics-green-primary" />
            Perfil do Atleta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{user?.nome_completo}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{user?.telefone}</span>
            </div>
            {branch && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{branch.nome} - {branch.cidade}/{branch.estado}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-olimpics-green-primary" />
            Informações de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payment ? (
            <div className="grid gap-4">
              <div>
                <strong>Status:</strong> {payment.status === 'confirmado' ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Confirmado
                  </span>
                ) : (
                  <span className="text-yellow-600">{payment.status}</span>
                )}
              </div>
              <div>
                <strong>Data de Criação:</strong> {new Date(payment.data_criacao).toLocaleDateString()}
              </div>
              {payment.data_validacao && (
                <div>
                  <strong>Data de Validação:</strong> {new Date(payment.data_validacao).toLocaleDateString()}
                </div>
              )}
              {payment.comprovante_url && (
                <div>
                  <a
                    href={payment.comprovante_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Ver Comprovante
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma informação de pagamento disponível.</p>
          )}
        </CardContent>
      </Card>

      <AthleteScores scores={scores} />
    </div>
  );
}