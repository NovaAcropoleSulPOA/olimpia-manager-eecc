-- Create inscricoes_modalidades table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.inscricoes_modalidades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    atleta_id UUID NOT NULL,
    modalidade TEXT NOT NULL,
    status_pagamento TEXT NOT NULL DEFAULT 'pendente'
        CHECK (status_pagamento IN ('pendente', 'confirmado', 'cancelado')),
    status TEXT NOT NULL DEFAULT 'pendente'
        CHECK (status IN ('pendente', 'confirmado', 'cancelado', 'recusado')),
    justificativa_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_inscricoes_modalidades_atleta_id 
ON public.inscricoes_modalidades(atleta_id);

-- Enable RLS
ALTER TABLE public.inscricoes_modalidades ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
    ON public.inscricoes_modalidades
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON public.inscricoes_modalidades
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
    ON public.inscricoes_modalidades
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.inscricoes_modalidades
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();