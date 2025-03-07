
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserCog } from "lucide-react";
import { UsersTableProps } from "./types";

export const UsersTable = ({ paginatedUsers, setSelectedUser }: UsersTableProps) => {
  return (
    <div className="rounded-md border shadow-sm">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Filial</TableHead>
            <TableHead>Perfis</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/40 transition-colors">
                <TableCell className="font-medium">{user.nome_completo}</TableCell>
                <TableCell>{user.email || "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-muted/30">
                    {user.filial_nome}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.profiles?.length > 0 ? (
                      user.profiles.map((profile: any, index: number) => (
                        <Badge 
                          key={`${user.id}-${profile.perfil_id}-${index}`}
                          className="bg-olimpics-green-primary/20 text-olimpics-green-primary border-none"
                        >
                          {profile.perfil_nome}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm italic">Sem perfis</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-olimpics-green-primary/30 text-olimpics-green-primary hover:bg-olimpics-green-primary/10"
                    onClick={() => setSelectedUser(user)}
                  >
                    <UserCog className="h-4 w-4 mr-2" />
                    Gerenciar Perfis
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Nenhum usuário encontrado com os filtros selecionados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
