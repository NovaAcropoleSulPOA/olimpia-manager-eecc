
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AthleteCard } from './AthleteCard';

interface SortableAthleteProps {
  athlete: any;
  id: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function SortableAthlete({ athlete, id, isSelected, onClick }: SortableAthleteProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
    >
      <AthleteCard 
        athlete={athlete} 
        isSelected={isSelected} 
        onClick={onClick} 
      />
    </div>
  );
}
