export interface ExtractedResult {
  posicao: number;
  jogadores: string[];  // 1 ou 2 nomes (modo SOLO ou DUO)
  abates: number;
}

const MODELOS_PREFERIDOS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-pro-vision",
];

/** Busca a lista de modelos disponíveis para a chave e retorna o melhor compatível */
const detectarModelo = async (apiKey: string): Promise<{ model: string; version: string }> => {
  for (const version of ["v1beta", "v1", "v1alpha"]) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`
      );
      if (!res.ok) continue;
      const data = await res.json();
      const nomes: string[] = (data.models || []).map((m: any) =>
        m.name.replace("models/", "")
      );
      for (const preferido of MODELOS_PREFERIDOS) {
        const encontrado = nomes.find((n) => n.startsWith(preferido));
        if (encontrado) {
          console.log(`[Gemini] Usando modelo: ${encontrado} (API ${version})`);
          return { model: encontrado, version };
        }
      }
    } catch {
      continue;
    }
  }
  throw new Error(
    "Nenhum modelo Gemini compatível encontrado para sua chave de API. Verifique se a chave é válida e tem acesso à Gemini API."
  );
};

const prompt = `
  Você é um especialista em analisar screenshots de partidas do jogo Free Fire.
  A imagem pode conter o resultado de uma única dupla (DUO) ou uma tabela/leaderboard com várias duplas.

  Extraia as informações de CADA EQUIPE identificada na imagem e retorne APENAS um array JSON puro, sem markdown, sem blocos de código.

  Cada objeto do array deve ter:
  - "posicao": O número da classificação (1, 2, 3...). Se não estiver visível, use a ordem da tabela.
  - "jogadores": Um array com os nomes dos jogadores da dupla. Se for dupla, inclua os 2 nomes. Se for solo, inclua 1 nome. Não invente nomes ausentes.
  - "abates": O número TOTAL de abates/kills da dupla. Se a imagem mostrar abates por jogador separadamente, some os dois valores.

  Importante:
  - Cada LINHA da tabela representa uma DUPLA (equipe), não um jogador individual.
  - Não separe os jogadores de uma mesma dupla em objetos diferentes.
  - Se o nome estiver borrado, tente o mais próximo possível.
  - Retorne SOMENTE o array JSON, nada mais.
`;

/**
 * Extrai dados de resultado de partida a partir de uma imagem usando Gemini via REST API.
 */
export const extrairDadosDaPartida = async (
  base64Image: string,
  apiKey: string,
  mimeType: string = "image/png"
): Promise<ExtractedResult[]> => {
  const { model, version } = await detectarModelo(apiKey);
  const API_URL = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;

  const imageData = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: imageData,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
    },
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", errorText);
    throw new Error(`Erro na API Gemini (${response.status}): ${errorText}`);
  }

  const json = await response.json();
  const text: string = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!text) throw new Error("A IA não retornou nenhum dado.");

  const clean = text.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(clean);
    // Normaliza resultados: garante que "jogadores" seja sempre array
    return parsed.map((r: any) => ({
      posicao: Number(r.posicao ?? r.placement ?? 0),
      jogadores: Array.isArray(r.jogadores)
        ? r.jogadores
        : Array.isArray(r.playerNames)
        ? r.playerNames
        : [String(r.nome ?? r.jogadores ?? "")],
      abates: Number(r.abates ?? r.kills ?? 0),
    })) as ExtractedResult[];
  } catch {
    console.error("Resposta da IA (não parseável):", clean);
    throw new Error("Não foi possível interpretar a resposta da IA. Tente com uma imagem mais nítida.");
  }
};
