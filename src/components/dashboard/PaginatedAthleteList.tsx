
import { AthleteRegistrationCard } from "@/components/AthleteRegistrationCard";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AthleteManagement } from "@/lib/api";
import { useState } from "react";

interface PaginatedAthleteListProps {
  athletes: AthleteManagement[];
  onStatusChange: (modalityId: string, status: string, justification: string) => Promise<void>;
  onPaymentStatusChange: (athleteId: string, status: string) => Promise<void>;
  currentUserId?: string;
  itemsPerPage?: number;
}

export function PaginatedAthleteList({
  athletes,
  onStatusChange,
  onPaymentStatusChange,
  currentUserId,
  itemsPerPage = 9
}: PaginatedAthleteListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(athletes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAthletes = athletes.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentAthletes.map((athlete) => (
          <AthleteRegistrationCard
            key={athlete.id}
            registration={athlete}
            onStatusChange={onStatusChange}
            onPaymentStatusChange={onPaymentStatusChange}
            isCurrentUser={currentUserId === athlete.id}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={page === currentPage}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  aria-disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {athletes.length === 0 && (
        <div className="col-span-full text-center py-8 text-muted-foreground">
          Nenhum atleta encontrado com os filtros selecionados.
        </div>
      )}
    </div>
  );
}
