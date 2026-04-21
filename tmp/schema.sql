
-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Torneios
CREATE TABLE IF NOT EXISTS public.torneios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    lucro_alvo DECIMAL(10,2) DEFAULT 0,
    lucro_real DECIMAL(10,2) DEFAULT 0,
    arrecadacao DECIMAL(10,2) DEFAULT 0,
    premios_pagos DECIMAL(10,2) DEFAULT 0,
    total_kills INTEGER DEFAULT 0,
    configuracao JSONB DEFAULT '{}'
);

-- 2. Resultados
CREATE TABLE IF NOT EXISTS public.resultados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_torneio UUID REFERENCES public.torneios(id) ON DELETE CASCADE,
    jogadores JSONB NOT NULL,
    eliminacoes INTEGER DEFAULT 0,
    posicao INTEGER NOT NULL,
    total_ganho DECIMAL(10,2) DEFAULT 0,
    premio_eliminacoes DECIMAL(10,2) DEFAULT 0,
    premio_posicao DECIMAL(10,2) DEFAULT 0,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Regras
CREATE TABLE IF NOT EXISTS public.regras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    ordem INTEGER NOT NULL,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Restrições (Restricoes)
CREATE TABLE IF NOT EXISTS public.restricoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    icone TEXT,
    descricao TEXT NOT NULL,
    itens JSONB DEFAULT '[]',
    ordem INTEGER NOT NULL,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Horários (Horarios)
CREATE TABLE IF NOT EXISTS public.horarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hora TEXT NOT NULL,
    status TEXT DEFAULT 'Disponivel',
    preenchido INTEGER DEFAULT 0,
    vagas INTEGER DEFAULT 48,
    ordem INTEGER NOT NULL,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Configurações (Configuracoes)
CREATE TABLE IF NOT EXISTS public.configuracoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chave TEXT UNIQUE NOT NULL,
    valor JSONB NOT NULL,
    data_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.torneios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir leitura pública de torneios') THEN
        CREATE POLICY "Permitir leitura pública de torneios" ON public.torneios FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir leitura pública de resultados') THEN
        CREATE POLICY "Permitir leitura pública de resultados" ON public.resultados FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir leitura pública de regras') THEN
        CREATE POLICY "Permitir leitura pública de regras" ON public.regras FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir leitura pública de restricoes') THEN
        CREATE POLICY "Permitir leitura pública de restricoes" ON public.restricoes FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir leitura pública de horarios') THEN
        CREATE POLICY "Permitir leitura pública de horarios" ON public.horarios FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir leitura pública de configuracoes') THEN
        CREATE POLICY "Permitir leitura pública de configuracoes" ON public.configuracoes FOR SELECT USING (true);
    END IF;
END $$;
