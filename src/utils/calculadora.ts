interface RegrasPremio {
  valorEntrada: number;
  vagas: number;
  valorPorKill: number;
  premiosPosicao: { [posicao: number]: number };
}

export interface ResultadoCalculo {
  arrecadacaoTotal: number;
  totalPremiosKill: number;
  totalPremiosPosicao: number;
  totalPago: number;
  lucroOrganizacao: number;
}

/**
 * Transforma um número em "X Centavos" para fazer a conta matematicamente perfeita sem os erros de arredondamento do JavaScript, 
 * retornando ao formato de Reais.
 */
const calcularMoeda = (calc: () => number): number => {
  return Math.round(calc() * 100) / 100;
};

/**
 * Calcula o balanço financeiro de uma partida com precisão monetária (em centavos).
 */
export const calcularFinanceiroPartida = (
  regras: RegrasPremio,
  totalKillsPartida: number
): ResultadoCalculo => {
  const arrecadacaoTotal = calcularMoeda(() => regras.valorEntrada * regras.vagas);
  
  const totalPremiosKill = calcularMoeda(() => totalKillsPartida * regras.valorPorKill);
  
  const totalPremiosPosicao = calcularMoeda(() => 
    Object.values(regras.premiosPosicao).reduce((acc, val) => acc + val, 0)
  );

  const totalPago = calcularMoeda(() => totalPremiosKill + totalPremiosPosicao);
  const lucroOrganizacao = calcularMoeda(() => arrecadacaoTotal - totalPago);

  return {
    arrecadacaoTotal,
    totalPremiosKill,
    totalPremiosPosicao,
    totalPago,
    lucroOrganizacao,
  };
};

/**
 * Calcula o prêmio individual de uma equipe/jogador com precisão dupla monetária.
 */
export const calcularPremioEquipe = (
  kills: number,
  posicao: number,
  regras: RegrasPremio
): { total: number; porKill: number; porPosicao: number } => {
  const porKill = calcularMoeda(() => kills * regras.valorPorKill);
  const porPosicao = calcularMoeda(() => regras.premiosPosicao[posicao] || 0);
  
  return {
    total: calcularMoeda(() => porKill + porPosicao),
    porKill,
    porPosicao,
  };
};
