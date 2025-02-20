
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Phone, User, Calendar, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { Fee } from './types';

interface RegistrationFeeCardProps {
  fee: Fee;
  isUserFee: boolean;
}

export function RegistrationFeeCard({
  fee,
  isUserFee
}: RegistrationFeeCardProps) {
  const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return null;
    return phone.replace(/\D/g, '');
  };

  const openWhatsApp = (phone: string) => {
    const formattedPhone = formatPhoneNumber(phone);
    if (formattedPhone) {
      window.open(`https://wa.me/55${formattedPhone}`, '_blank');
    }
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all",
        isUserFee ? "ring-2 ring-olimpics-orange-primary bg-orange-50/80 shadow-lg" : "hover:shadow-md"
      )}
    >
      {isUserFee && (
        <div className="absolute top-0 right-0 left-0 bg-olimpics-orange-primary text-white py-1.5 px-3 text-center text-sm font-medium">
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Sua taxa de inscrição
          </div>
        </div>
      )}
      
      <CardContent className={cn(
        "p-4 space-y-4",
        isUserFee && "pt-12" // Add padding top when there's a banner
      )}>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className={cn(
              "font-semibold",
              isUserFee ? "text-xl" : "text-lg"
            )}>{fee.perfil?.nome || 'Taxa de Inscrição'}</h3>
            <p className={cn(
              "font-bold",
              isUserFee ? "text-3xl text-olimpics-orange-primary" : "text-2xl"
            )}>
              {fee.isento ? (
                <span className="text-olimpics-green-primary">Isento</span>
              ) : (
                `R$ ${fee.valor.toFixed(2)}`
              )}
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          {fee.data_limite_inscricao && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Data limite: {format(new Date(fee.data_limite_inscricao), 'dd/MM/yyyy')}</span>
            </div>
          )}

          {fee.contato_nome && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Contato: {fee.contato_nome}</span>
            </div>
          )}

          {fee.contato_telefone && (
            <div 
              className={cn(
                "flex items-center gap-2 text-sm cursor-pointer transition-colors",
                "hover:text-olimpics-orange-primary group"
              )}
              onClick={() => openWhatsApp(fee.contato_telefone || '')}
            >
              <Phone className="h-4 w-4 text-muted-foreground group-hover:text-olimpics-orange-primary" />
              <span className="underline">{fee.contato_telefone}</span>
            </div>
          )}

          {fee.pix_key && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Chave PIX:</p>
              <code className="bg-muted px-2 py-1 rounded text-sm block break-all">
                {fee.pix_key}
              </code>
            </div>
          )}

          {fee.qr_code_image && (
            <div className="space-y-2">
              <p className="text-sm font-medium">QR Code PIX:</p>
              <img src={fee.qr_code_image} alt="QR Code PIX" className="max-w-[200px] mx-auto" />
            </div>
          )}

          {fee.qr_code_codigo && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Código PIX:</p>
              <code className="bg-muted px-2 py-1 rounded text-sm block break-all">
                {fee.qr_code_codigo}
              </code>
            </div>
          )}

          {fee.link_formulario && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(fee.link_formulario, '_blank')} 
                className={cn(
                  "w-full",
                  isUserFee 
                    ? "bg-olimpics-orange-primary text-white hover:bg-olimpics-orange-secondary" 
                    : "text-olimpics-background bg-orange-600 hover:bg-orange-500"
                )}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Formulário de pagamento
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
