import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

interface PendingUser {
  id: string;
  nome_completo: string;
  email: string;
  telefone: string;
  filial: {
    nome: string;
  };
  papeis: string[];
}

export default function OrganizerDashboard() {
  const { data: pendingUsers, isLoading, refetch } = useQuery({
    queryKey: ['pending-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('view_usuarios_pendentes')
        .select(`
          id,
          nome_completo,
          email,
          telefone,
          filial:filial_id (
            nome
          ),
          papeis
        `);

      if (error) {
        console.error('Error fetching pending users:', error);
        throw error;
      }

      // Log the data to see its structure
      console.log('Fetched pending users:', data);

      // Ensure the data matches the PendingUser interface
      return (data as any[]).map(user => ({
        id: user.id,
        nome_completo: user.nome_completo,
        email: user.email,
        telefone: user.telefone,
        filial: {
          nome: user.filial?.nome || 'N/A'
        },
        papeis: user.papeis || []
      })) as PendingUser[];
    },
  });

  const handleApprove = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ confirmado: true })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Usuário aprovado com sucesso!');
      refetch();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Erro ao aprovar usuário');
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success('Usuário rejeitado com sucesso!');
      refetch();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Erro ao rejeitar usuário');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Aprovação de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {pendingUsers?.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{user.nome_completo}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Telefone: {user.telefone}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Filial: {user.filial?.nome}
                        </p>
                        <div className="flex gap-2">
                          {user.papeis?.map((role, index) => (
                            <span
                              key={index}
                              className="text-xs bg-olimpics-green-primary/10 text-olimpics-green-primary px-2 py-1 rounded"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleApprove(user.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleReject(user.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}