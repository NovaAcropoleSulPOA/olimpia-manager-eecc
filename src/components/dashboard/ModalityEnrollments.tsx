
import React, { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { ModalitySection } from './components/ModalitySection';
import { EnrolledUser } from './types/enrollmentTypes';
import { groupEnrollmentsByModalityAndFilial } from './utils/enrollmentUtils';

interface ModalityEnrollmentsProps {
  enrollments: EnrolledUser[];
}

export const ModalityEnrollments = ({ enrollments }: ModalityEnrollmentsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedModality, setExpandedModality] = useState<string | null>(null);
  const [expandedFilial, setExpandedFilial] = useState<string | null>(null);
  const [allSectionsExpanded, setAllSectionsExpanded] = useState(false);

  const groupedEnrollments = groupEnrollmentsByModalityAndFilial(enrollments);

  const toggleAllSections = () => {
    const newExpandedState = !allSectionsExpanded;
    setAllSectionsExpanded(newExpandedState);
    
    if (newExpandedState) {
      const modalityKeys = Object.keys(groupedEnrollments);
      setExpandedModality(modalityKeys[0]);
      
      const firstModalityFilials = Object.keys(groupedEnrollments[modalityKeys[0]] || {});
      setExpandedFilial(`${modalityKeys[0]}-${firstModalityFilials[0]}`);
    } else {
      setExpandedModality(null);
      setExpandedFilial(null);
    }
  };

  const handlePrint = () => {
    setAllSectionsExpanded(true);
    const modalityKeys = Object.keys(groupedEnrollments);
    setExpandedModality(modalityKeys[0]);
    
    const firstModalityFilials = Object.keys(groupedEnrollments[modalityKeys[0]] || {});
    setExpandedFilial(`${modalityKeys[0]}-${firstModalityFilials[0]}`);
    
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="space-y-6">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .enrollment-list,
            .enrollment-list * {
              visibility: visible;
            }
            .enrollment-list {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
            .print-show {
              display: block !important;
            }
            [data-state="closed"] {
              display: block !important;
            }
            [data-state="closed"] > div {
              display: block !important;
              height: auto !important;
            }
            .print-table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 2rem;
            }
            .print-table th,
            .print-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .print-table th {
              background-color: #f5f5f5;
            }
            .print-header {
              font-size: 24px;
              margin-bottom: 1rem;
              text-align: center;
              color: black;
            }
            .print-subheader {
              font-size: 18px;
              margin: 1rem 0;
              color: black;
            }
            @page {
              size: landscape;
              margin: 2cm;
            }
          }
        `}
      </style>

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onToggleAll={toggleAllSections}
        onPrint={handlePrint}
        allSectionsExpanded={allSectionsExpanded}
      />

      <div className="space-y-4 enrollment-list">
        {Object.entries(groupedEnrollments).map(([modalidade, filiais]) => (
          <ModalitySection
            key={modalidade}
            modalidade={modalidade}
            filiais={filiais}
            searchTerm={searchTerm}
            isExpanded={expandedModality === modalidade || allSectionsExpanded}
            expandedFilial={expandedFilial}
            allSectionsExpanded={allSectionsExpanded}
            onModalityToggle={() => setExpandedModality(expandedModality === modalidade ? null : modalidade)}
            onFilialToggle={(filialKey: string) => setExpandedFilial(expandedFilial === filialKey ? null : filialKey)}
          />
        ))}
      </div>
    </div>
  );
};
