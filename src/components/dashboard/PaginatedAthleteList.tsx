
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
import { useState, useEffect } from "react";

interface PaginatedAthleteListProps {
  athletes: AthleteManagement[];
  onStatusChange: (modalityId: string, status: string, justification: string) => Promise<void>;
  onPaymentStatusChange?: (athleteId: string, status: string) => Promise<void>;
  currentUserId?: string;
  itemsPerPage?: number;
}

export function PaginatedAthleteList({
  athletes,
  onStatusChange,
  onPaymentStatusChange,
  currentUserId,
  itemsPerPage = 6
}: PaginatedAthleteListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page when athletes list changes (e.g., due to filtering)
  useEffect(() => {
    setCurrentPage(1);
  }, [athletes.length]);

  const totalPages = Math.ceil(athletes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAthletes = athletes.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pageNumbers.push(1);

    // Calculate range around current page
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    // Adjust range if at edges
    if (currentPage <= 2) {
      end = Math.min(4, totalPages - 1);
    }
    if (currentPage >= totalPages - 1) {
      start = Math.max(2, totalPages - 3);
    }

    // Add ellipsis and numbers
    if (start > 2) pageNumbers.push(-1); // ellipsis
    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }
    if (end < totalPages - 1) pageNumbers.push(-1); // ellipsis

    // Always show last page
    if (totalPages > 1) pageNumbers.push(totalPages);

    return pageNumbers;
  };

  if (athletes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum atleta encontrado com os filtros selecionados.
      </div>
    );
  }

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

              {getPageNumbers().map((pageNum, idx) => (
                pageNum === -1 ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      isActive={pageNum === currentPage}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              ))}

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

      <div className="text-center text-sm text-muted-foreground">
        Mostrando {startIndex + 1}-{Math.min(endIndex, athletes.length)} de {athletes.length} atletas
      </div>
    </div>
  );
}
