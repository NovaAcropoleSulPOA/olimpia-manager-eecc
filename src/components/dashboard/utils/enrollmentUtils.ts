
import { EnrolledUser, GroupedEnrollments } from "../types/enrollmentTypes";

export const groupEnrollmentsByModalityAndFilial = (enrollments: EnrolledUser[]): GroupedEnrollments => {
  return enrollments.reduce((acc: GroupedEnrollments, enrollment) => {
    const { modalidade_nome, filial } = enrollment;
    
    if (!acc[modalidade_nome]) {
      acc[modalidade_nome] = {};
    }
    
    if (!acc[modalidade_nome][filial]) {
      acc[modalidade_nome][filial] = [];
    }
    
    acc[modalidade_nome][filial].push(enrollment);
    return acc;
  }, {});
};

export const filterEnrollments = (users: EnrolledUser[], searchTerm: string) => {
  if (!searchTerm) return users;
  const term = searchTerm.toLowerCase();
  return users.filter(user => 
    user.nome_atleta.toLowerCase().includes(term) ||
    user.email.toLowerCase().includes(term) ||
    user.numero_documento.toLowerCase().includes(term)
  );
};
