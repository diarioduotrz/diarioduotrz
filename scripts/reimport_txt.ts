import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("ERRO: Variáveis de ambiente do Supabase não encontradas!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function calcularMoeda(valor: number): number {
  return Math.round(valor * 100) / 100;
}

async function start() {
  console.log("Iniciando migração limpa...");

  // Lendo arquivo TXT
  const filePath = path.resolve(process.cwd(), "export_torneios_completo.txt");
  if (!fs.existsSync(filePath)) {
    console.error(`ERRO: Arquivo não encontrado em ${filePath}`);
    return;
  }
  const content = fs.readFileSync(filePath, "utf-8");

  // Limpar tabelas via REST
  console.log("1. Apagando tabelas antigas...");
  const { error: errDelRes } = await supabase.from('resultados').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if(errDelRes) console.log("Erro ao limpar resultados:", errDelRes);
  const { error: errDelTor } = await supabase.from('torneios').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if(errDelTor) console.log("Erro ao limpar torneios:", errDelTor);

  console.log("2. Fazendo parse do TXT...");
  const blocos = content.split("---").map(b => b.trim()).filter(b => b.length > 0);

  // O primeiro bloco é o cabeçalho (ignoramos para buildar os torneios, mas checamos para info)
  let countTorneiosCriados = 0;
  let countResultados = 0;
  let bufferTorneios: any[] = [];
  let bufferResultados: any[] = [];

  let arrecadacaoReal = 0;
  let premiosReal = 0;
  let killsReal = 0;

  for (let i = 1; i < blocos.length; i++) {
    const bloco = blocos[i];
    const lines = bloco.split("\n").map(l => l.trim()).filter(l => l);
    
    // Parse the basic variables
    let t_id = "";
    let t_data = "";
    let entrada = 0;
    let slots = 0;
    let lucroFixo = 0;

    let resultadosTorneio: any[] = [];
    
    for (const linha of lines) {
      try {
        if (linha.startsWith("tournament_id=")) t_id = linha.split("=")[1];
        else if (linha.startsWith("data=")) t_data = linha.split("=")[1];
        else if (linha.startsWith("entrada_valor=")) entrada = parseFloat(linha.split("=")[1]);
        else if (linha.startsWith("slots=")) slots = parseInt(linha.split("=")[1]);
        else if (linha.startsWith("lucro_fixo=")) lucroFixo = parseFloat(linha.split("=")[1]);
        else if (linha.startsWith("player=")) {
          resultadosTorneio.push({ identificador_equipe: linha.substring(7), kills: 0, posicao: 0, premio_total: 0 });
        }
        else if (linha.startsWith("kills=")) {
          if (resultadosTorneio.length === 0) resultadosTorneio.push({ identificador_equipe: "Desconhecido", kills: 0, posicao: 0, premio_total: 0 });
          resultadosTorneio[resultadosTorneio.length - 1].kills = parseInt(linha.split("=")[1]);
        }
        else if (linha.startsWith("colocacao=")) {
          if (resultadosTorneio.length === 0) resultadosTorneio.push({ identificador_equipe: "Desconhecido", kills: 0, posicao: 0, premio_total: 0 });
          resultadosTorneio[resultadosTorneio.length - 1].posicao = parseInt(linha.split("=")[1]);
        }
        else if (linha.startsWith("premio_total=")) {
          if (resultadosTorneio.length === 0) resultadosTorneio.push({ identificador_equipe: "Desconhecido", kills: 0, posicao: 0, premio_total: 0 });
          resultadosTorneio[resultadosTorneio.length - 1].premio_total = parseFloat(linha.split("=")[1]);
        }
      } catch (err) {
        console.error("ERRO na linha:", linha, err);
      }
    }

    if (!t_id) continue;

    // Build the Torneio
    const uuidId = Buffer.from(t_id).toString('hex').padEnd(32, '0').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
    
    const configJson = {
      entryFee: entrada,
      slotsSold: slots,
      fixedProfit: lucroFixo,
    };
    
    arrecadacaoReal += calcularMoeda(entrada * slots);

    bufferTorneios.push({
      id: uuidId,
      external_id: t_id,
      data_torneio: t_data,
      nome: `Torneio Auto Export ${new Date(t_data).toLocaleDateString("pt-BR")}`,
      modo: "Squad",
      configuracao_json: configJson
    });
    countTorneiosCriados++;

    for (const r of resultadosTorneio) {
      premiosReal += calcularMoeda(r.premio_total);
      killsReal += r.kills;
      bufferResultados.push({
        torneio_id: uuidId,
        identificador_equipe: r.identificador_equipe,
        jogadores: r.identificador_equipe.split("|"),
        kills: r.kills,
        posicao: r.posicao,
        premio_total: calcularMoeda(r.premio_total)
      });
    }

    // Insert batches of 100 
    if (bufferTorneios.length >= 100) {
      await supabase.from("torneios").insert(bufferTorneios);
      await supabase.from("resultados").insert(bufferResultados);
      countResultados += bufferResultados.length;
      bufferTorneios = [];
      bufferResultados = [];
    }
  }

  // Insert remaining
  if (bufferTorneios.length > 0) {
    await supabase.from("torneios").insert(bufferTorneios);
    await supabase.from("resultados").insert(bufferResultados);
    countResultados += bufferResultados.length;
  }
  
  premiosReal = calcularMoeda(premiosReal);

  console.log(`✅ Sucesso! Migrados ${countTorneiosCriados} Torneios e ${countResultados} Resultados.`);
  console.log(`📊 SIMULAÇÃO (Matemática Pura TXT):`);
  console.log(`Arrecadação Exata: R$ ${arrecadacaoReal.toFixed(2)}`);
  console.log(`Premios Pagos Exatos: R$ ${premiosReal.toFixed(2)}`);
  console.log(`Lucro Calculado: R$ ${(arrecadacaoReal - premiosReal).toFixed(2)}`);
  console.log(`Kills: ${killsReal}`);
}

start();
