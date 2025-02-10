
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ModalitySectionProps } from "../types/enrollmentTypes";
import { filterEnrollments } from "../utils/enrollmentUtils";
import { FilialSection } from "./FilialSection";

export const ModalitySection = ({
  modalidade,
  filiais,
  searchTerm,
  isExpanded,
  expandedFilial,
  allSectionsExpanded,
  onModalityToggle,
  onFilialToggle,
}: ModalitySectionProps) => {
  const totalEnrollments = Object.values(filiais).flat().length;

  return (
    <Card className="overflow-hidden">
      <Collapsible
        open={isExpanded}
        onOpenChange={onModalityToggle}
      >
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-olimpics-green-primary/5 hover:bg-olimpics-green-primary/10 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-olimpics-text flex items-center gap-2 print-header">
                {modalidade}
                <Badge variant="secondary" className="ml-2 no-print">
                  {totalEnrollments} inscritos
                </Badge>
              </CardTitle>
              <ChevronDown className="h-5 w-5 no-print" />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent className="print-show">
          <CardContent className="p-6">
            <div className="space-y-4">
              {Object.entries(filiais).map(([filial, users]) => {
                const filteredUsers = filterEnrollments(users, searchTerm);
                if (filteredUsers.length === 0) return null;

                return (
                  <FilialSection
                    key={filial}
                    filial={filial}
                    users={filteredUsers}
                    modalidade={modalidade}
                    isExpanded={expandedFilial === `${modalidade}-${filial}` || allSectionsExpanded}
                    onToggle={() => onFilialToggle(`${modalidade}-${filial}`)}
                  />
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
