/**
 * Configuracoes de captura facial carregadas de variaveis de ambiente.
 * Permite ajustar parametros sem recompilar o codigo.
 */

// ----------------------------------------------------------------------

/**
 * Configuracoes de captura facial.
 * Valores padrao sao usados caso as variaveis de ambiente nao estejam definidas.
 */
export const CAPTURE_CONFIG = {
  /** Meta de amostras a coletar */
  TARGET_SAMPLES: Number(import.meta.env.VITE_FACE_CAPTURE_TARGET_SAMPLES) || 100,

  /** Minimo de amostras validas para processar */
  MIN_VALID_SAMPLES: Number(import.meta.env.VITE_FACE_CAPTURE_MIN_VALID_SAMPLES) || 60,

  /** Timeout maximo em ms */
  MAX_CAPTURE_TIME_MS: Number(import.meta.env.VITE_FACE_CAPTURE_MAX_TIME_MS) || 5000,

  /**confiança minima de deteccao (0-1) */
  MIN_DETECTION_CONFIDENCE: Number(import.meta.env.VITE_FACE_CAPTURE_MIN_CONFIDENCE) || 0.85,

  /** Maxima diferenca de Z para considerar rosto frontal */
  MAX_Z_DIFF_FOR_FRONTAL: Number(import.meta.env.VITE_FACE_CAPTURE_MAX_Z_DIFF) || 0.03,
} as const;

// Validar configuracoes em desenvolvimento
if (import.meta.env.DEV) {
  console.log('[FaceCapture] Configuracoes carregadas:', CAPTURE_CONFIG);
}
