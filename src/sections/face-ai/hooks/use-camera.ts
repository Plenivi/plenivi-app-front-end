import { useRef, useState, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------

export type CameraError =
  | 'permission_denied'
  | 'not_found'
  | 'not_supported'
  | 'in_use'
  | 'unknown';

export interface CameraState {
  status: 'idle' | 'requesting' | 'active' | 'error';
  error: CameraError | null;
  stream: MediaStream | null;
}

const ERROR_MESSAGES: Record<CameraError, string> = {
  permission_denied: 'Permissao para camera negada. Habilite nas configuracoes do navegador.',
  not_found: 'Nenhuma camera encontrada. Use um dispositivo com camera.',
  not_supported: 'Seu navegador nao suporta acesso a camera. Use Chrome, Firefox ou Edge.',
  in_use: 'A camera esta sendo usada por outro aplicativo. Feche outros apps e tente novamente.',
  unknown: 'Erro ao acessar a camera. Tente novamente.',
};

// ----------------------------------------------------------------------

export function useCamera() {
  const [state, setState] = useState<CameraState>({
    status: 'idle',
    error: null,
    stream: null,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const getErrorType = (error: unknown): CameraError => {
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          return 'permission_denied';
        case 'NotFoundError':
        case 'DevicesNotFoundError':
          return 'not_found';
        case 'NotReadableError':
        case 'TrackStartError':
          return 'in_use';
        case 'NotSupportedError':
          return 'not_supported';
        default:
          return 'unknown';
      }
    }
    return 'unknown';
  };

  const startCamera = useCallback(async () => {
    // Verificar suporte
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setState({ status: 'error', error: 'not_supported', stream: null });
      return;
    }

    // Parar stream anterior se existir
    setState((prev) => {
      if (prev.stream) {
        prev.stream.getTracks().forEach((track) => track.stop());
      }
      return { status: 'requesting', error: null, stream: null };
    });

    try {
      console.log('[Camera] Solicitando acesso...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      console.log('[Camera] Acesso concedido!');
      setState({ status: 'active', error: null, stream });
    } catch (error) {
      console.error('[Camera] Erro ao acessar:', error);
      const errorType = getErrorType(error);
      setState({ status: 'error', error: errorType, stream: null });
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState({ status: 'idle', error: null, stream: null });
  }, [state.stream]);

  // Cleanup ao desmontar
  useEffect(
    () => () => {
      if (state.stream) {
        state.stream.getTracks().forEach((track) => track.stop());
      }
    },
    [state.stream]
  );

  const getErrorMessage = useCallback(() => {
    if (!state.error) return null;
    return ERROR_MESSAGES[state.error];
  }, [state.error]);

  return {
    ...state,
    videoRef,
    startCamera,
    stopCamera,
    getErrorMessage,
  };
}
