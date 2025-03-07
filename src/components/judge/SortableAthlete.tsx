
import React from 'react';
import { AthleteCard } from './AthleteCard';

interface SortableAthleteProps {
  athlete: any;
  id: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function SortableAthlete({ athlete, id, isSelected, onClick }: SortableAthleteProps) {
  return (
    <div className="cursor-move">
      <AthleteCard 
        athlete={athlete} 
        isSelected={isSelected} 
        onClick={onClick} 
      />
    </div>
  );
}
