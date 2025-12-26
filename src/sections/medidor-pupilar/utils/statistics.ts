/**
 * Funções utilitárias de estatística para processamento de landmarks faciais.
 * Usa mediana com remoção de outliers via IQR (Interquartile Range) para
 * estabilização robusta dos dados.
 */

/**
 * Calcula a mediana de um array de números.
 * A mediana é o valor central quando os dados estão ordenados.
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}

/**
 * Calcula os quartis (Q1, mediana, Q3) de um array de números.
 * Q1 = 25º percentil, Q3 = 75º percentil
 */
export function quartiles(values: number[]): { q1: number; median: number; q3: number } {
  if (values.length === 0) {
    return { q1: 0, median: 0, q3: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  // Mediana
  const med = median(sorted);

  // Para Q1 e Q3, usamos o método de quartis inclusivos
  const lowerHalf = sorted.slice(0, Math.floor(n / 2));
  const upperHalf = sorted.slice(Math.ceil(n / 2));

  const q1 = median(lowerHalf);
  const q3 = median(upperHalf);

  return { q1, median: med, q3 };
}

/**
 * Remove outliers de um array usando o método IQR.
 * Valores fora do intervalo [Q1 - multiplier*IQR, Q3 + multiplier*IQR] são removidos.
 *
 * @param values - Array de números
 * @param multiplier - Multiplicador do IQR (padrão: 1.5, comum em estatística)
 * @returns Array filtrado sem outliers
 */
export function removeOutliersIQR(values: number[], multiplier = 1.5): number[] {
  if (values.length < 4) {
    // Com poucos dados, não há como calcular quartis significativos
    return values;
  }

  const { q1, q3 } = quartiles(values);
  const iqr = q3 - q1;

  // Se IQR é zero (todos valores iguais ou muito próximos), retorna todos
  if (iqr === 0) {
    return values;
  }

  const lowerBound = q1 - multiplier * iqr;
  const upperBound = q3 + multiplier * iqr;

  return values.filter((v) => v >= lowerBound && v <= upperBound);
}

/**
 * Calcula a mediana após remover outliers via IQR.
 * Esta é a função principal para estabilização de landmarks.
 *
 * @param values - Array de valores de coordenadas (x, y ou z)
 * @param multiplier - Multiplicador do IQR para remoção de outliers
 * @returns Mediana dos valores filtrados
 */
export function medianWithIQR(values: number[], multiplier = 1.5): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];

  const filtered = removeOutliersIQR(values, multiplier);

  // Se todos os valores foram removidos (improvável), usa mediana original
  if (filtered.length === 0) {
    return median(values);
  }

  return median(filtered);
}

/**
 * Calcula a distância euclidiana 2D entre dois pontos.
 */
export function distance2D(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calcula a distância euclidiana 3D entre dois pontos.
 */
export function distance3D(
  p1: { x: number; y: number; z: number },
  p2: { x: number; y: number; z: number }
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calcula a média de um array de números.
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calcula o desvio padrão de um array de números.
 */
export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;

  const avg = mean(values);
  const squaredDiffs = values.map((v) => (v - avg) ** 2);
  const variance = mean(squaredDiffs);

  return Math.sqrt(variance);
}

/**
 * Calcula a confiança baseada na variabilidade dos dados.
 * Menor desvio padrão = maior confiança.
 *
 * @param values - Array de valores
 * @param expectedRange - Range esperado dos valores para normalização
 * @returns Confiança entre 0 e 100
 */
export function calculateVariabilityConfidence(
  values: number[],
  expectedRange: number
): number {
  if (values.length < 2) return 100;

  const stdDev = standardDeviation(values);

  // Normaliza o desvio padrão pelo range esperado
  // Se stdDev é 0, confiança é 100%
  // Se stdDev é maior que 10% do range, confiança diminui
  const normalizedStdDev = stdDev / expectedRange;
  const confidence = Math.max(0, 100 - normalizedStdDev * 1000);

  return Math.round(confidence);
}
