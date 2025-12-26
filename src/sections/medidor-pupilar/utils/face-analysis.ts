/**
 * Funções de análise facial: cálculo de DP e classificação de formato do rosto.
 * Usa landmarks do MediaPipe FaceLandmarker (478 pontos).
 */

import { distance2D } from './statistics';

// ----------------------------------------------------------------------
// Tipos
// ----------------------------------------------------------------------

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

export type FaceShapeType = 'oval' | 'round' | 'square' | 'heart' | 'oblong';

export interface FaceMeasurements {
  faceWidth: number; // Largura máxima do rosto (nas maçãs do rosto)
  faceHeight: number; // Altura do rosto (testa ao queixo)
  foreheadWidth: number; // Largura da testa
  jawWidth: number; // Largura do maxilar
  cheekboneWidth: number; // Largura nas maçãs do rosto
  aspectRatio: number; // Proporção altura/largura
}

export interface FaceShapeResult {
  classification: FaceShapeType;
  confidence: number;
  measurements: FaceMeasurements;
}

export interface DPResult {
  value: number;
  confidence: number;
}

// ----------------------------------------------------------------------
// Constantes de Landmarks do MediaPipe FaceLandmarker
// ----------------------------------------------------------------------

export const LANDMARKS = {
  // Íris (para cálculo de DP)
  LEFT_IRIS_CENTER: 468,
  RIGHT_IRIS_CENTER: 473,
  LEFT_IRIS_LEFT: 469,
  LEFT_IRIS_RIGHT: 471,
  RIGHT_IRIS_LEFT: 474,
  RIGHT_IRIS_RIGHT: 476,

  // Contorno facial (face oval) - 36 pontos
  FACE_OVAL: [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152,
    148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
  ],

  // Testa (pontos superiores)
  FOREHEAD_TOP: 10, // Centro topo da testa
  FOREHEAD_LEFT: 338, // Esquerda da testa
  FOREHEAD_RIGHT: 109, // Direita da testa

  // Queixo
  CHIN: 152, // Ponto mais baixo do queixo

  // Maçãs do rosto (cheekbones)
  CHEEKBONE_LEFT: 234, // Maçã esquerda
  CHEEKBONE_RIGHT: 454, // Maçã direita

  // Maxilar (jaw)
  JAW_LEFT: 172, // Lado esquerdo do maxilar
  JAW_RIGHT: 397, // Lado direito do maxilar
  JAW_ANGLE_LEFT: 136, // Ângulo do maxilar esquerdo
  JAW_ANGLE_RIGHT: 365, // Ângulo do maxilar direito

  // Pontos laterais extremos
  FACE_LEFT: 234, // Ponto mais à esquerda
  FACE_RIGHT: 454, // Ponto mais à direita
};

// Configurações
export const CAPTURE_CONFIG = {
  TARGET_SAMPLES: 90,
  MIN_VALID_SAMPLES: 60,
  MAX_CAPTURE_TIME_MS: 5000,
  MIN_DETECTION_CONFIDENCE: 0.85,
  MAX_Z_DIFF_FOR_FRONTAL: 0.03,
};

// Diâmetro médio da íris humana em mm (calibrado)
const AVG_IRIS_DIAMETER_MM = 12.5;

// Range normal de DP para adultos (mm)
const DP_MIN = 50;
const DP_MAX = 80;

// ----------------------------------------------------------------------
// Funções de Validação
// ----------------------------------------------------------------------

/**
 * Verifica se um frame é válido para coleta.
 * Critérios: confiança mínima, rosto frontal, landmarks da íris válidos.
 */
export function isValidFrame(
  landmarks: NormalizedLandmark[],
  detectionConfidence: number
): { valid: boolean; isFrontal: boolean; reason?: string } {
  // 1. Verificar confiança mínima
  if (detectionConfidence < CAPTURE_CONFIG.MIN_DETECTION_CONFIDENCE) {
    return { valid: false, isFrontal: false, reason: 'Confiança baixa' };
  }

  // 2. Verificar se temos landmarks suficientes
  if (landmarks.length < 478) {
    return { valid: false, isFrontal: false, reason: 'Landmarks insuficientes' };
  }

  // 3. Verificar se o rosto está frontal (diferença de Z entre pupilas)
  const leftIris = landmarks[LANDMARKS.LEFT_IRIS_CENTER];
  const rightIris = landmarks[LANDMARKS.RIGHT_IRIS_CENTER];

  if (!leftIris || !rightIris) {
    return { valid: false, isFrontal: false, reason: 'Íris não detectadas' };
  }

  const zDiff = Math.abs(leftIris.z - rightIris.z);
  const isFrontal = zDiff <= CAPTURE_CONFIG.MAX_Z_DIFF_FOR_FRONTAL;

  if (!isFrontal) {
    return { valid: false, isFrontal: false, reason: 'Rosto não frontal' };
  }

  // 4. Verificar se landmarks da íris são válidos (não NaN)
  const irisIndices = [
    LANDMARKS.LEFT_IRIS_CENTER,
    LANDMARKS.RIGHT_IRIS_CENTER,
    LANDMARKS.LEFT_IRIS_LEFT,
    LANDMARKS.LEFT_IRIS_RIGHT,
    LANDMARKS.RIGHT_IRIS_LEFT,
    LANDMARKS.RIGHT_IRIS_RIGHT,
  ];

  for (const idx of irisIndices) {
    const lm = landmarks[idx];
    if (!lm || Number.isNaN(lm.x) || Number.isNaN(lm.y) || Number.isNaN(lm.z)) {
      return { valid: false, isFrontal: true, reason: 'Landmarks de íris inválidos' };
    }
  }

  return { valid: true, isFrontal: true };
}

/**
 * Verifica se o rosto está centralizado no frame.
 * Considera o centro do rosto em relação ao centro da imagem.
 */
export function isFaceCentered(
  landmarks: NormalizedLandmark[],
  tolerance = 0.2
): boolean {
  if (landmarks.length < 478) return false;

  // Usar o centro do rosto (entre os olhos)
  const leftIris = landmarks[LANDMARKS.LEFT_IRIS_CENTER];
  const rightIris = landmarks[LANDMARKS.RIGHT_IRIS_CENTER];

  if (!leftIris || !rightIris) return false;

  const faceCenter = {
    x: (leftIris.x + rightIris.x) / 2,
    y: (leftIris.y + rightIris.y) / 2,
  };

  // Centro do frame é (0.5, 0.5) em coordenadas normalizadas
  const distanceFromCenter = Math.sqrt(
    (faceCenter.x - 0.5) ** 2 + (faceCenter.y - 0.5) ** 2
  );

  return distanceFromCenter <= tolerance;
}

// ----------------------------------------------------------------------
// Cálculo de DP
// ----------------------------------------------------------------------

/**
 * Calcula a distância pupilar (DP) a partir dos landmarks.
 * Usa a proporção do diâmetro da íris como referência de escala.
 */
export function calculateDP(landmarks: NormalizedLandmark[]): DPResult {
  if (landmarks.length < 478) {
    return { value: 0, confidence: 0 };
  }

  const leftIrisCenter = landmarks[LANDMARKS.LEFT_IRIS_CENTER];
  const rightIrisCenter = landmarks[LANDMARKS.RIGHT_IRIS_CENTER];
  const leftIrisLeft = landmarks[LANDMARKS.LEFT_IRIS_LEFT];
  const leftIrisRight = landmarks[LANDMARKS.LEFT_IRIS_RIGHT];
  const rightIrisLeft = landmarks[LANDMARKS.RIGHT_IRIS_LEFT];
  const rightIrisRight = landmarks[LANDMARKS.RIGHT_IRIS_RIGHT];

  // Calcular diâmetros das íris
  const leftIrisDiameter = distance2D(leftIrisLeft, leftIrisRight);
  const rightIrisDiameter = distance2D(rightIrisLeft, rightIrisRight);
  const avgIrisDiameter = (leftIrisDiameter + rightIrisDiameter) / 2;

  // Evitar divisão por zero
  if (avgIrisDiameter === 0) {
    return { value: 0, confidence: 0 };
  }

  // Calcular distância pupilar
  const pupilDistance = distance2D(leftIrisCenter, rightIrisCenter);

  // Converter para mm usando proporção com diâmetro médio da íris
  const dpMm = (pupilDistance / avgIrisDiameter) * AVG_IRIS_DIAMETER_MM;

  // Calcular confiança
  let confidence = 100;

  // 1. Verificar se está olhando reto (penalidade: -25%)
  const zDiff = Math.abs(leftIrisCenter.z - rightIrisCenter.z);
  if (zDiff >= 0.03) {
    confidence -= 25;
  }

  // 2. Verificar se DP está no range normal (penalidade: -15%)
  if (dpMm < DP_MIN || dpMm > DP_MAX) {
    confidence -= 15;
  }

  // 3. Verificar simetria da detecção de íris (penalidade: -20%)
  const irisDiameterRatio =
    Math.min(leftIrisDiameter, rightIrisDiameter) /
    Math.max(leftIrisDiameter, rightIrisDiameter);
  if (irisDiameterRatio < 0.85) {
    confidence -= 20;
  }

  return {
    value: Math.round(dpMm * 10) / 10,
    confidence: Math.max(0, confidence),
  };
}

// ----------------------------------------------------------------------
// Classificação de Formato do Rosto
// ----------------------------------------------------------------------

/**
 * Calcula as medidas do rosto a partir dos landmarks.
 */
export function calculateFaceMeasurements(
  landmarks: NormalizedLandmark[]
): FaceMeasurements {
  if (landmarks.length < 478) {
    return {
      faceWidth: 0,
      faceHeight: 0,
      foreheadWidth: 0,
      jawWidth: 0,
      cheekboneWidth: 0,
      aspectRatio: 0,
    };
  }

  // Pontos de referência
  const foreheadTop = landmarks[LANDMARKS.FOREHEAD_TOP];
  const foreheadLeft = landmarks[LANDMARKS.FOREHEAD_LEFT];
  const foreheadRight = landmarks[LANDMARKS.FOREHEAD_RIGHT];
  const chin = landmarks[LANDMARKS.CHIN];
  const cheekboneLeft = landmarks[LANDMARKS.CHEEKBONE_LEFT];
  const cheekboneRight = landmarks[LANDMARKS.CHEEKBONE_RIGHT];
  const jawLeft = landmarks[LANDMARKS.JAW_ANGLE_LEFT];
  const jawRight = landmarks[LANDMARKS.JAW_ANGLE_RIGHT];

  // Calcular medidas
  const faceHeight = distance2D(foreheadTop, chin);
  const faceWidth = distance2D(cheekboneLeft, cheekboneRight);
  const foreheadWidth = distance2D(foreheadLeft, foreheadRight);
  const jawWidth = distance2D(jawLeft, jawRight);
  const cheekboneWidth = faceWidth; // Mesmo que faceWidth

  // Proporção
  const aspectRatio = faceWidth > 0 ? faceHeight / faceWidth : 0;

  return {
    faceWidth,
    faceHeight,
    foreheadWidth,
    jawWidth,
    cheekboneWidth,
    aspectRatio,
  };
}

/**
 * Classifica o formato do rosto baseado nas medidas.
 *
 * Classificações:
 * - OVAL: Proporção equilibrada, testa ligeiramente mais larga que o maxilar
 * - ROUND: Proporção próxima de 1:1, bochechas cheias
 * - SQUARE: Testa, maçãs e maxilar com larguras similares, linhas angulares
 * - HEART: Testa larga, maxilar estreito, queixo pontiagudo
 * - OBLONG: Rosto alongado, proporção > 1.5
 */
export function classifyFaceShape(
  landmarks: NormalizedLandmark[]
): FaceShapeResult {
  const measurements = calculateFaceMeasurements(landmarks);

  if (measurements.faceWidth === 0 || measurements.faceHeight === 0) {
    return {
      classification: 'oval',
      confidence: 0,
      measurements,
    };
  }

  const { aspectRatio, foreheadWidth, jawWidth, cheekboneWidth } = measurements;

  // Razões para análise
  const foreheadToJawRatio = jawWidth > 0 ? foreheadWidth / jawWidth : 1;
  const cheekToJawRatio = jawWidth > 0 ? cheekboneWidth / jawWidth : 1;

  let classification: FaceShapeType = 'oval';
  let confidence = 80; // Confiança base

  // Classificação baseada em características
  if (aspectRatio > 1.5) {
    // Rosto alongado
    classification = 'oblong';
    confidence = 85;
  } else if (aspectRatio < 1.1 && Math.abs(foreheadToJawRatio - 1) < 0.1) {
    // Proporção quase 1:1, testa e maxilar similares
    classification = 'round';
    confidence = 85;
  } else if (
    aspectRatio < 1.25 &&
    Math.abs(foreheadToJawRatio - 1) < 0.15 &&
    Math.abs(cheekToJawRatio - 1) < 0.15
  ) {
    // Testa, maçãs e maxilar similares - rosto quadrado
    classification = 'square';
    confidence = 80;
  } else if (foreheadToJawRatio > 1.2) {
    // Testa significativamente mais larga que o maxilar
    classification = 'heart';
    confidence = 85;
  } else {
    // Caso padrão: oval (mais comum)
    classification = 'oval';
    confidence = 90;
  }

  return {
    classification,
    confidence,
    measurements,
  };
}

// ----------------------------------------------------------------------
// Processamento Estatístico de Landmarks
// ----------------------------------------------------------------------

/**
 * Processa múltiplas amostras de landmarks e retorna landmarks estabilizados.
 * Usa mediana com remoção de outliers para cada coordenada.
 */
export function processLandmarksSamples(
  samples: NormalizedLandmark[][],
  medianWithIQR: (values: number[]) => number
): NormalizedLandmark[] {
  if (samples.length === 0) return [];
  if (samples.length === 1) return samples[0];

  const numLandmarks = samples[0].length;
  const stabilized: NormalizedLandmark[] = [];

  for (let i = 0; i < numLandmarks; i++) {
    const xValues = samples.map((s) => s[i]?.x ?? 0);
    const yValues = samples.map((s) => s[i]?.y ?? 0);
    const zValues = samples.map((s) => s[i]?.z ?? 0);

    stabilized.push({
      x: medianWithIQR(xValues),
      y: medianWithIQR(yValues),
      z: medianWithIQR(zValues),
    });
  }

  return stabilized;
}

// ----------------------------------------------------------------------
// Labels e Descrições para UI
// ----------------------------------------------------------------------

export const FACE_SHAPE_LABELS: Record<FaceShapeType, string> = {
  oval: 'Oval',
  round: 'Redondo',
  square: 'Quadrado',
  heart: 'Coracão',
  oblong: 'Oblongo',
};

export const FACE_SHAPE_DESCRIPTIONS: Record<FaceShapeType, string> = {
  oval:
    'Formato equilibrado com testa ligeiramente mais larga que o maxilar. Considerado o formato mais versátil para armações.',
  round:
    'Rosto com proporções similares em largura e altura, bochechas cheias. Armações angulares podem adicionar definição.',
  square:
    'Testa, maçãs do rosto e maxilar com larguras similares, linhas mais angulares. Armações arredondadas podem suavizar.',
  heart:
    'Testa larga com maxilar mais estreito e queixo delicado. Armações que equilibram a parte inferior funcionam bem.',
  oblong:
    'Rosto alongado com proporção vertical acentuada. Armações mais largas podem ajudar a equilibrar as proporções.',
};

export const FACE_SHAPE_ICONS: Record<FaceShapeType, string> = {
  oval: 'mdi:face-outline',
  round: 'mdi:circle-outline',
  square: 'mdi:square-outline',
  heart: 'mdi:heart-outline',
  oblong: 'mdi:rectangle-outline',
};
