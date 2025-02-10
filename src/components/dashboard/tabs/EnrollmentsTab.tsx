
import { ModalityEnrollments } from "../ModalityEnrollments";

interface EnrollmentsTabProps {
  enrollments: any[];
}

export const EnrollmentsTab = ({ enrollments }: EnrollmentsTabProps) => {
  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-4 text-olimpics-text">Inscrições por Modalidade</h2>
      {enrollments && enrollments.length > 0 ? (
        <ModalityEnrollments enrollments={enrollments} />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma inscrição confirmada encontrada.
        </div>
      )}
    </div>
  );
};
