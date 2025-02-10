
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FilialSectionProps } from "../types/enrollmentTypes";
import { EnrollmentTable } from "./EnrollmentTable";

export const FilialSection = ({
  filial,
  users,
  modalidade,
  isExpanded,
  onToggle
}: FilialSectionProps) => {
  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={onToggle}
    >
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-2">
            <span className="font-medium print-subheader">{filial}</span>
            <Badge variant="outline" className="no-print">
              {users.length} atletas
            </Badge>
          </div>
          <ChevronDown className="h-4 w-4 no-print" />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="print-show">
        <EnrollmentTable users={users} />
      </CollapsibleContent>
    </Collapsible>
  );
};
