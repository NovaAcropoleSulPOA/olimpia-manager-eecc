
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EnrollmentTableProps } from "../types/enrollmentTypes";

export const EnrollmentTable = ({ users }: EnrollmentTableProps) => {
  return (
    <div className="mt-4 rounded-lg border overflow-hidden">
      <Table className="print-table">
        <TableHeader>
          <TableRow className="bg-olimpics-green-primary/5">
            <TableHead className="font-semibold">Nome</TableHead>
            <TableHead className="font-semibold">Documento</TableHead>
            <TableHead className="font-semibold">Contato</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Filial</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow key={`${user.numero_documento}-${index}`}>
              <TableCell className="font-medium">
                {user.nome_atleta}
              </TableCell>
              <TableCell>
                {user.tipo_documento}: {user.numero_documento}
              </TableCell>
              <TableCell>{user.telefone}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.filial}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
