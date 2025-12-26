/**
 * Hook de captura estatística de landmarks faciais.
 *
 * Coleta múltiplas amostras de landmarks durante ~3 segundos de vídeo,
 * filtra frames de baixa qualidade, e processa estatisticamente para
 * obter medidas estabilizadas de DP e formato do rosto.
 */

import type { RefObject } from 'react';

import { useRef, useState, useEffect, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

import { medianWithIQR } from '../utils/statistics';
import { CAPTURE_CONFIG } from '../utils/capture-config';
import {
  calculateDP,
  isValidFrame,
  isFaceCentered,
  classifyFaceShape,
  processLandmarksSamples,
} from '../utils/face-analysis';

import type { FaceShapeResult, NormalizedLandmark } from '../utils/face-analysis';

// Re-exportar CAPTURE_CONFIG para manter compatibilidade
export { CAPTURE_CONFIG } from '../utils/capture-config';

// ----------------------------------------------------------------------
// Tipos
// ----------------------------------------------------------------------

export type CaptureStatus =
  | 'idle' // Aguardando iniciar
  | 'initializing' // Carregando modelo
  | 'ready' // Modelo pronto, aguardando captura
  | 'capturing' // Capturando amostras
  | 'processing' // Processando dados
  | 'success' // Sucesso
  | 'error'; // Erro

export interface FaceAnalysisResult {
  dp: {
    value: number;
    confidence: number;
    validSamples: number;
  };
  faceShape: FaceShapeResult;
  capturedAt: string;
}

export interface UseFaceCaptureReturn {
  // Estado
  status: CaptureStatus;
  progress: number; // 0-100
  validSamples: number;
  isFrontal: boolean;
  isCentered: boolean;

  // Resultado
  result: FaceAnalysisResult | null;
  error: string | null;

  // Ações
  startCapture: () => void;
  stopCapture: () => void;
  reset: () => void;
}

// ----------------------------------------------------------------------
// Hook
// ----------------------------------------------------------------------

export function useFaceCapture(
  videoRef: RefObject<HTMLVideoElement | null>
): UseFaceCaptureReturn {
  // Estado - começa como 'initializing' pois o modelo será carregado
  const [status, setStatus] = useState<CaptureStatus>('initializing');
  const [progress, setProgress] = useState(0);
  const [validSamples, setValidSamples] = useState(0);
  const [isFrontal, setIsFrontal] = useState(false);
  const [isCentered, setIsCentered] = useState(false);
  const [result, setResult] = useState<FaceAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const samplesRef = useRef<NormalizedLandmark[][]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const captureStartTimeRef = useRef<number>(0);
  const isMountedRef = useRef(true);
  const statusRef = useRef<CaptureStatus>('initializing');

  // Manter ref sincronizada com state
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Inicializar FaceLandmarker
  useEffect(() => {
    isMountedRef.current = true;
    let landmarker: FaceLandmarker | null = null;

    const initFaceLandmarker = async () => {
      if (!isMountedRef.current) return;

      try {
        console.log('[FaceCapture] Carregando modelo...');

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        if (!isMountedRef.current) return;

        landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO', // Modo vídeo para captura contínua
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });

        console.log('[FaceCapture] Modelo carregado!');

        if (isMountedRef.current) {
          faceLandmarkerRef.current = landmarker;
          setStatus('ready');
        }
      } catch (err) {
        console.error('[FaceCapture] Erro ao carregar modelo:', err);
        if (isMountedRef.current) {
          setStatus('error');
          setError('Erro ao carregar modelo de detecção facial. Recarregue a página.');
        }
      }
    };

    initFaceLandmarker();

    return () => {
      isMountedRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      landmarker?.close();
    };
  }, []);

  // Processar amostras coletadas
  const processSamples = useCallback(() => {
    const samples = samplesRef.current;

    if (samples.length < CAPTURE_CONFIG.MIN_VALID_SAMPLES) {
      setStatus('error');
      setError(
        `Amostras insuficientes (${samples.length}/${CAPTURE_CONFIG.MIN_VALID_SAMPLES}). ` +
          'Melhore a iluminação e mantenha o rosto centralizado.'
      );
      return;
    }

    setStatus('processing');

    try {
      // Processar landmarks estatisticamente
      const stabilizedLandmarks = processLandmarksSamples(samples, medianWithIQR);

      // Calcular DP
      const dpResult = calculateDP(stabilizedLandmarks);

      // Classificar formato do rosto
      const faceShapeResult = classifyFaceShape(stabilizedLandmarks);

      const analysisResult: FaceAnalysisResult = {
        dp: {
          value: dpResult.value,
          confidence: dpResult.confidence,
          validSamples: samples.length,
        },
        faceShape: faceShapeResult,
        capturedAt: new Date().toISOString(),
      };

      setResult(analysisResult);
      setStatus('success');

      console.log('[FaceCapture] Análise concluída:', analysisResult);
    } catch (err) {
      console.error('[FaceCapture] Erro ao processar:', err);
      setStatus('error');
      setError('Erro ao processar dados faciais. Tente novamente.');
    }
  }, []);

  // Loop de captura
  const captureLoop = useCallback(() => {
    if (!isMountedRef.current) return;

    const video = videoRef.current;
    const landmarker = faceLandmarkerRef.current;

    // Usar ref para evitar closure stale
    if (!video || !landmarker || statusRef.current !== 'capturing') {
      return;
    }

    // Verificar timeout
    const elapsed = Date.now() - captureStartTimeRef.current;
    if (elapsed > CAPTURE_CONFIG.MAX_CAPTURE_TIME_MS) {
      console.log('[FaceCapture] Timeout atingido');
      processSamples();
      return;
    }

    // Verificar se atingiu meta de amostras
    if (samplesRef.current.length >= CAPTURE_CONFIG.TARGET_SAMPLES) {
      console.log('[FaceCapture] Meta de amostras atingida');
      processSamples();
      return;
    }

    try {
      // Detectar face no frame atual
      const timestamp = performance.now();
      const results = landmarker.detectForVideo(video, timestamp);

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0] as NormalizedLandmark[];

        // Estimar confiança baseada na quantidade de landmarks detectados
        const detectionConfidence = landmarks.length >= 478 ? 0.95 : 0.7;

        // Validar frame
        const validation = isValidFrame(landmarks, detectionConfidence);
        setIsFrontal(validation.isFrontal);

        // Verificar centralização
        const centered = isFaceCentered(landmarks);
        setIsCentered(centered);

        if (validation.valid) {
          // Clonar landmarks para armazenamento
          const landmarksCopy = landmarks.map((lm) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
          }));

          samplesRef.current.push(landmarksCopy);
          setValidSamples(samplesRef.current.length);

          // Atualizar progresso
          const progressValue = (samplesRef.current.length / CAPTURE_CONFIG.TARGET_SAMPLES) * 100;
          setProgress(Math.min(100, Math.round(progressValue)));
        }
      } else {
        // Nenhum rosto detectado
        setIsFrontal(false);
        setIsCentered(false);
      }
    } catch (err) {
      console.error('[FaceCapture] Erro no frame:', err);
    }

    // Continuar loop
    animationFrameRef.current = requestAnimationFrame(captureLoop);
  }, [videoRef, processSamples]);

  // Iniciar captura
  const startCapture = useCallback(() => {
    if (status !== 'ready' && status !== 'success' && status !== 'error') {
      console.warn('[FaceCapture] Não é possível iniciar captura no status:', status);
      return;
    }

    if (!videoRef.current) {
      setError('Câmera não disponível');
      return;
    }

    console.log('[FaceCapture] Iniciando captura...');

    // Resetar estado
    samplesRef.current = [];
    setValidSamples(0);
    setProgress(0);
    setResult(null);
    setError(null);
    setIsFrontal(false);
    setIsCentered(false);

    // Iniciar
    captureStartTimeRef.current = Date.now();
    statusRef.current = 'capturing'; // Atualizar ref imediatamente
    setStatus('capturing');

    // Iniciar loop no próximo frame
    animationFrameRef.current = requestAnimationFrame(captureLoop);
  }, [status, videoRef, captureLoop]);

  // Parar captura
  const stopCapture = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (statusRef.current === 'capturing') {
      // Se tiver amostras suficientes, processar
      if (samplesRef.current.length >= CAPTURE_CONFIG.MIN_VALID_SAMPLES) {
        processSamples();
      } else {
        setStatus('ready');
        setError('Captura cancelada');
      }
    }
  }, [processSamples]);

  // Reset
  const reset = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    samplesRef.current = [];
    setValidSamples(0);
    setProgress(0);
    setResult(null);
    setError(null);
    setIsFrontal(false);
    setIsCentered(false);
    setStatus('ready');
  }, []);

  return {
    status,
    progress,
    validSamples,
    isFrontal,
    isCentered,
    result,
    error,
    startCapture,
    stopCapture,
    reset,
  };
}
