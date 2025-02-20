
import React from 'react';
import PersonalInfo from './athlete/PersonalInfo';
import PaymentAndBranchInfo from './athlete/PaymentAndBranchInfo';
import AccessProfile from './athlete/AccessProfile';
import ProfileImage from './athlete/ProfileImage';
import AthleteScores from './AthleteScores';
import AthleteRegistrations from './AthleteRegistrations';
import AthleteSchedule from './AthleteSchedule';
import { Card } from './ui/card';
import { AthleteProfileData } from '@/types/athlete';
import { RegistrationFees } from './athlete/RegistrationFees';

interface AthleteProfileProps {
  profile: AthleteProfileData;
  isPublicUser?: boolean;
}

export default function AthleteProfile({ profile, isPublicUser = false }: AthleteProfileProps) {
  const currentEventId = localStorage.getItem('currentEventId');
  const currentProfileId = profile.papeis?.[0]?.id;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <ProfileImage
              photoUrl={profile.foto_perfil}
              userName={profile.nome_completo}
              role={profile.papeis?.[0]?.nome}
            />
            <div className="flex-1 space-y-6">
              <PersonalInfo profile={profile} />
              <PaymentAndBranchInfo profile={profile} />
              <AccessProfile profile={profile} />
            </div>
          </div>
        </Card>

        <div className="md:col-span-1">
          <RegistrationFees 
            eventId={currentEventId} 
            currentProfileId={currentProfileId}
          />
        </div>
      </div>

      <AthleteRegistrations userId={profile.id} />
      <AthleteSchedule userId={profile.id} />
      <AthleteScores scores={[]} />
    </div>
  );
}
