import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

// Configurações do Supabase (lendo do .env)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY; // Usando a chave pública (garanta que as políticas RLS permitam inserção ou use a Service Role)

// NOTA: Para migração via script, o ideal seria a SERVICE_ROLE_KEY se o RLS estiver ativo.
// Como não tenho a Service Role aqui, vou assumir que a chave pública pode inserir se as políticas permitirem ou se o RLS estiver desativado temporariamente.
// No nosso caso, as políticas criadas no SQL anterior são apenas de SELECT. 
// Para o script funcionar, vamos precisar de permissão de escrita.

const supabase = createClient(supabaseUrl!, supabaseKey!);

const backupPath = "C:\\Users\\leocl\\Downloads\\trz-reports-backup-2026-04-14T11_17_06.892Z.json";

async function migrar() {
    console.log("Iniciando migração...");

    if (!fs.existsSync(backupPath)) {
        console.error("Arquivo de backup não encontrado:", backupPath);
        return;
    }

    const data = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    console.log(`Total de torneios no backup: ${data.length}`);

    for (const torneio of data) {
        console.log(`Processando torneio: ${torneio.tournament} (ID: ${torneio.id})`);

        // 1. Inserir ou buscar torneio
        const { data: torneioData, error: torneioError } = await supabase
            .from('torneios')
            .upsert({
                external_id: torneio.id,
                data_torneio: torneio.createdAt,
                nome: torneio.tournament,
                modo: torneio.mode,
                configuracao_json: torneio.config
            }, { onConflict: 'external_id' })
            .select()
            .single();

        if (torneioError) {
            console.error(`Erro ao inserir torneio ${torneio.id}:`, torneioError.message);
            continue;
        }

        const internalTorneioId = torneioData.id;

        // 2. Preparar resultados para inserção em lote
        const resultadosParaInserir = torneio.entries.map((entry: any) => ({
            torneio_id: internalTorneioId,
            identificador_equipe: entry.id,
            jogadores: entry.matchResult.playerNames || [],
            kills: entry.matchResult.kills || 0,
            posicao: entry.matchResult.placement,
            premio_total: entry.earnings.total || 0,
            premio_kill: entry.earnings.killPrize || 0,
            premio_posicao: entry.earnings.placementPrize || 0
        }));

        // Inserir resultados do torneio
        const { error: resultadosError } = await supabase
            .from('resultados')
            .insert(resultadosParaInserir);

        if (resultadosError) {
            console.error(`Erro ao inserir resultados do torneio ${torneio.id}:`, resultadosError.message);
        } else {
            console.log(`Inseridos ${resultadosParaInserir.length} resultados para o torneio ${torneio.id}`);
        }
    }

    console.log("Migração concluída!");
}

migrar().catch(console.error);
