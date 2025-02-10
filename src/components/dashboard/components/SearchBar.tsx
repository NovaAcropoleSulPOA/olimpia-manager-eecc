
import { Search, Printer, FoldVertical, UnfoldVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchBarProps } from "../types/enrollmentTypes";

export const SearchBar = ({
  searchTerm,
  onSearchChange,
  onToggleAll,
  onPrint,
  allSectionsExpanded
}: SearchBarProps) => {
  return (
    <div className="flex items-center justify-between gap-4 no-print">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input
          placeholder="Buscar por nome, email ou documento..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onToggleAll}
          className="flex items-center gap-2"
        >
          {allSectionsExpanded ? (
            <>
              <FoldVertical className="h-4 w-4" />
              Recolher Tudo
            </>
          ) : (
            <>
              <UnfoldVertical className="h-4 w-4" />
              Expandir Tudo
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onPrint}
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Imprimir Lista
        </Button>
      </div>
    </div>
  );
};
