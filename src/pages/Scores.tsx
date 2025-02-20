
import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import AthleteScoresSection from '@/components/AthleteScoresSection';

export default function Scores() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-2xl font-bold text-olimpics-green-primary">
        Minhas Pontuações
      </h1>
      <AthleteScoresSection athleteId={user.id} />
    </div>
  );
}
