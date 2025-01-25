import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ModalityRegistrationRequired = () => {
  const navigate = useNavigate();

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-center text-red-600">
          Registro de Modalidade Necessário
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-4">
          Para continuar usando o sistema, você precisa se registrar em pelo menos uma modalidade.
        </p>
        <Button 
          onClick={() => navigate('/modalities')}
          className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
        >
          Registrar Modalidade
        </Button>
      </CardContent>
    </Card>
  );
};

export default ModalityRegistrationRequired;