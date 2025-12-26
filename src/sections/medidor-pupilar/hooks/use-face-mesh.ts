import { useRef, useState, useEffect, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// ----------------------------------------------------------------------

// Landmarks chave para calculo de DP (usando indices do FaceLandmarker)
const LANDMARKS = {
  LEFT_IRIS_CENTER: 468,
  RIGHT_IRIS_CENTER: 473,
  LEFT_IRIS_LEFT: 469,
  LEFT_IRIS_RIGHT: 471,
  RIGHT_IRIS_LEFT: 474,
  RIGHT_IRIS_RIGHT: 476,
};

// Diametro medio da iris humana em mm (ajustado para calibracao)
// Range real: 10.2-13.0mm, usando valor calibrado
const AVG_IRIS_DIAMETER_MM = 12.5;

// Range normal de DP para adultos (mm)
const DP_MIN = 50;
const DP_MAX = 80;

export interface FaceMeshState {
  isLoading: boolean;
  isReady: boolean;
  isProcessing: boolean;
  faceDetected: boolean;
  dpValue: number | null;
  confidence: number;
  error: string | null;
  capturedImage: string | null;
}

interface Landmark {
  x: number;
  y: number;
  z: number;
}

// ----------------------------------------------------------------------

function distance(p1: Landmark, p2: Landmark): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function calculateDP(landmarks: Landmark[]): { dp: number; confidence: number } {
  if (landmarks.length < 478) {
    return { dp: 0, confidence: 0 };
  }

  const leftIrisCenter = landmarks[LANDMARKS.LEFT_IRIS_CENTER];
  const rightIrisCenter = landmarks[LANDMARKS.RIGHT_IRIS_CENTER];
  const leftIrisLeft = landmarks[LANDMARKS.LEFT_IRIS_LEFT];
  const leftIrisRight = landmarks[LANDMARKS.LEFT_IRIS_RIGHT];
  const rightIrisLeft = landmarks[LANDMARKS.RIGHT_IRIS_LEFT];
  const rightIrisRight = landmarks[LANDMARKS.RIGHT_IRIS_RIGHT];

  const leftIrisDiameter = distance(leftIrisLeft, leftIrisRight);
  const rightIrisDiameter = distance(rightIrisLeft, rightIrisRight);
  const avgIrisDiameter = (leftIrisDiameter + rightIrisDiameter) / 2;
  const pupilDistance = distance(leftIrisCenter, rightIrisCenter);
  const dpMm = (pupilDistance / avgIrisDiameter) * AVG_IRIS_DIAMETER_MM;

  const zDiff = Math.abs(leftIrisCenter.z - rightIrisCenter.z);
  const isLookingStraight = zDiff < 0.03;
  const isInNormalRange = dpMm >= DP_MIN && dpMm <= DP_MAX;
  const irisDiameterRatio =
    Math.min(leftIrisDiameter, rightIrisDiameter) / Math.max(leftIrisDiameter, rightIrisDiameter);
  const irisDetectionGood = irisDiameterRatio > 0.85;

  let confidence = 100;
  if (!isLookingStraight) confidence -= 25;
  if (!isInNormalRange) confidence -= 15;
  if (!irisDetectionGood) confidence -= 20;

  return {
    dp: Math.round(dpMm * 10) / 10,
    confidence: Math.max(0, confidence),
  };
}

// ----------------------------------------------------------------------

export function useFaceMesh() {
  const [state, setState] = useState<FaceMeshState>({
    isLoading: true,
    isReady: false,
    isProcessing: false,
    faceDetected: false,
    dpValue: null,
    confidence: 0,
    error: null,
    capturedImage: null,
  });

  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);

  // Inicializar FaceLandmarker
  useEffect(() => {
    let isMounted = true;

    const initFaceLandmarker = async () => {
      try {
        console.log('[FaceMesh] Carregando modelo...');

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'IMAGE',
          numFaces: 1,
        });

        console.log('[FaceMesh] Modelo carregado!');

        if (isMounted) {
          faceLandmarkerRef.current = faceLandmarker;
          setState((prev) => ({ ...prev, isLoading: false, isReady: true }));
        }
      } catch (err) {
        console.error('[FaceMesh] Erro:', err);
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'Erro ao carregar modelo. Recarregue a pagina.',
          }));
        }
      }
    };

    initFaceLandmarker();

    return () => {
      isMounted = false;
      faceLandmarkerRef.current?.close();
    };
  }, []);

  // Capturar foto e processar
  const captureAndMeasure = useCallback(async (videoElement: HTMLVideoElement) => {
    if (!faceLandmarkerRef.current || !videoElement) {
      return;
    }

    setState((prev) => ({ ...prev, isProcessing: true, error: null }));

    try {
      // Capturar frame do video como imagem
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Erro ao criar canvas');
      }

      // Desenhar frame espelhado (como a camera mostra)
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoElement, 0, 0);

      // Converter para imagem
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);

      // Criar elemento de imagem para o MediaPipe
      const image = new Image();
      image.src = imageDataUrl;
      await new Promise((resolve) => {
        image.onload = resolve;
      });

      // Processar com FaceLandmarker
      const results = faceLandmarkerRef.current.detect(image);

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        const { dp, confidence } = calculateDP(landmarks);

        if (dp > 0) {
          setState((prev) => ({
            ...prev,
            isProcessing: false,
            faceDetected: true,
            dpValue: dp,
            confidence,
            capturedImage: imageDataUrl,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            isProcessing: false,
            faceDetected: false,
            error: 'Nao foi possivel detectar os olhos. Tente novamente.',
            capturedImage: imageDataUrl,
          }));
        }
      } else {
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          faceDetected: false,
          error: 'Rosto nao detectado. Centralize seu rosto e tente novamente.',
          capturedImage: imageDataUrl,
        }));
      }
    } catch (err) {
      console.error('[FaceMesh] Erro ao processar:', err);
      setState((prev) => ({
        ...prev,
        isProcessing: false,
        error: 'Erro ao processar imagem. Tente novamente.',
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      dpValue: null,
      confidence: 0,
      faceDetected: false,
      error: null,
      capturedImage: null,
    }));
  }, []);

  return {
    ...state,
    captureAndMeasure,
    reset,
  };
}
