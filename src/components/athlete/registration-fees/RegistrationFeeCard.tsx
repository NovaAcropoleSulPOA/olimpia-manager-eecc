import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Phone, User, Calendar } from 'lucide-react';
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
  return <Card className={cn("relative overflow-hidden transition-all", isUserFee && "ring-2 ring-olimpics-orange-primary")}>
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{fee.perfil?.nome || 'Taxa de Inscrição'}</h3>
            <p className="text-2xl font-bold">
              {fee.isento ? <span className="text-olimpics-green-primary">Isento</span> : `R$ ${fee.valor.toFixed(2)}`}
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          {fee.data_limite_inscricao && <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Data limite: {format(new Date(fee.data_limite_inscricao), 'dd/MM/yyyy')}</span>
            </div>}

          {fee.contato_nome && <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Contato: {fee.contato_nome}</span>
            </div>}

          {fee.contato_telefone && <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>Telefone: {fee.contato_telefone}</span>
            </div>}

          {fee.pix_key && <div className="space-y-2">
              <p className="text-sm font-medium">Chave PIX:</p>
              <code className="bg-muted px-2 py-1 rounded text-sm block break-all">
                {fee.pix_key}
              </code>
            </div>}

          {fee.qr_code_image && <div className="space-y-2">
              <p className="text-sm font-medium">QR Code PIX:</p>
              <img src={fee.qr_code_image} alt="QR Code PIX" className="max-w-[200px] mx-auto" />
            </div>}

          {fee.qr_code_codigo && <div className="space-y-2">
              <p className="text-sm font-medium">Código PIX:</p>
              <code className="bg-muted px-2 py-1 rounded text-sm block break-all">
                {fee.qr_code_codigo}
              </code>
            </div>}

          {fee.link_formulario && <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.open(fee.link_formulario, '_blank')} className="w-full text-olimpics-background bg-orange-600 hover:bg-orange-500">
                <LinkIcon className="h-4 w-4" />
                Formulário de pagamento
              </Button>
            </div>}
        </div>
      </CardContent>
    </Card>;
}