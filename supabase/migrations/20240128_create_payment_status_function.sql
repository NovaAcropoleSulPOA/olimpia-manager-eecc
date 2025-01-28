-- Create function to update payment status
create or replace function public.atualizar_status_pagamento(
  atleta_id uuid,
  novo_status text
)
returns void
language plpgsql
security definer
as $$
begin
  -- Validate status
  if novo_status not in ('pendente', 'confirmado', 'cancelado') then
    raise exception 'Status inválido. Use: pendente, confirmado ou cancelado';
  end if;

  -- Update payment status
  update public.registros_atletas
  set 
    status_pagamento = novo_status,
    updated_at = now()
  where id = atleta_id;

  -- Raise exception if athlete not found
  if not found then
    raise exception 'Atleta não encontrado';
  end if;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.atualizar_status_pagamento(uuid, text) to authenticated;