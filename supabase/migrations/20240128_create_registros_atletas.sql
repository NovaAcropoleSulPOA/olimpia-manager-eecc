-- Create the registros_atletas table
create table if not exists public.registros_atletas (
  id uuid default gen_random_uuid() primary key,
  nome_atleta text not null,
  email text not null,
  telefone text not null,
  filial text not null,
  modalidades text[] not null default '{}',
  status_inscricao text not null default 'Pendente' 
    check (status_inscricao in ('Pendente', 'Confirmada', 'Cancelada', 'Recusada')),
  status_pagamento text not null default 'pendente'
    check (status_pagamento in ('pendente', 'confirmado', 'cancelado')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add useful indexes
create index if not exists idx_registros_atletas_email on public.registros_atletas(email);
create index if not exists idx_registros_atletas_status on public.registros_atletas(status_inscricao, status_pagamento);

-- Enable RLS
alter table public.registros_atletas enable row level security;

-- Allow read access to all authenticated users
create policy "Allow read access to all authenticated users"
  on public.registros_atletas
  for select
  to authenticated
  using (true);

-- Allow insert for authenticated users
create policy "Allow insert for authenticated users"
  on public.registros_atletas
  for insert
  to authenticated
  with check (true);

-- Allow update for authenticated users
create policy "Allow update for authenticated users"
  on public.registros_atletas
  for update
  to authenticated
  using (true)
  with check (true);

-- Create trigger to update updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger handle_registros_atletas_updated_at
  before update on public.registros_atletas
  for each row
  execute function public.handle_updated_at();

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.registros_atletas to anon, authenticated;
grant all on public.registros_atletas_id_seq to anon, authenticated;