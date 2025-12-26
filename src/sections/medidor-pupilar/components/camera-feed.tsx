import type { RefObject } from 'react';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

import { CaptureProgress } from './capture-progress';

import type { CaptureStatus } from '../hooks/use-face-capture';

// ----------------------------------------------------------------------

interface CameraFeedProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  cameraStatus: 'idle' | 'requesting' | 'active' | 'error';
  cameraError: string | null;
  onStartCamera: () => void;
  onRetryCamera: () => void;
  // Props do Face Capture
  captureStatus: CaptureStatus;
  captureProgress: number;
  validSamples: number;
  isFrontal: boolean;
  isCentered: boolean;
  captureError: string | null;
  onStartCapture: () => void;
  onStopCapture: () => void;
}

export function CameraFeed({
  videoRef,
  stream,
  cameraStatus,
  cameraError,
  onStartCamera,
  onRetryCamera,
  captureStatus,
  captureProgress,
  validSamples,
  isFrontal,
  isCentered,
  captureError,
  onStartCapture,
  onStopCapture,
}: CameraFeedProps) {
  const setVideoRef = useCallback(
    (element: HTMLVideoElement | null) => {
      (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = element;
      if (element && stream) {
        element.srcObject = stream;
      }
    },
    [videoRef, stream]
  );

  // Estado inicial - solicitar permissao da camera
  if (cameraStatus === 'idle') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          bgcolor: 'grey.100',
          borderRadius: 2,
          p: 4,
        }}
      >
        <Iconify icon="solar:camera-bold-duotone" width={64} sx={{ color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Permitir acesso a camera
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Para analisar seu rosto e medir sua distancia pupilar, precisamos acessar sua camera.
        </Typography>
        <Button variant="contained" size="large" onClick={onStartCamera} startIcon={<Iconify icon="solar:camera-bold" />}>
          Permitir Camera
        </Button>
      </Box>
    );
  }

  // Solicitando permissao
  if (cameraStatus === 'requesting') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          bgcolor: 'grey.100',
          borderRadius: 2,
        }}
      >
        <CircularProgress size={48} sx={{ mb: 2 }} />
        <Typography variant="body1">Aguardando permissao da camera...</Typography>
      </Box>
    );
  }

  // Erro da camera
  if (cameraStatus === 'error') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          bgcolor: 'grey.100',
          borderRadius: 2,
          p: 4,
        }}
      >
        <Iconify icon="solar:camera-broken-bold-duotone" width={64} sx={{ color: 'error.main', mb: 2 }} />
        <Alert severity="error" sx={{ mb: 2, maxWidth: 400 }}>
          {cameraError || 'Erro ao acessar a camera'}
        </Alert>
        <Button variant="outlined" onClick={onRetryCamera} startIcon={<Iconify icon="solar:refresh-bold" />}>
          Tentar Novamente
        </Button>
      </Box>
    );
  }

  // Determinar cor do guia oval baseado no estado
  const getOvalColor = () => {
    if (captureStatus === 'capturing') {
      if (isFrontal && isCentered) return 'success.main';
      if (isFrontal || isCentered) return 'warning.main';
      return 'error.main';
    }
    return 'warning.main';
  };

  // Camera ativa - mostrar preview com controles de captura
  return (
    <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', bgcolor: 'black' }}>
      <video
        ref={setVideoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: 'auto',
          minHeight: 400,
          maxHeight: 500,
          objectFit: 'cover',
          transform: 'scaleX(-1)',
        }}
      />

      {/* Overlay com guia oval */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {/* Guia oval para posicionamento do rosto */}
        <Box
          sx={{
            width: 200,
            height: 260,
            border: '3px dashed',
            borderColor: getOvalColor(),
            borderRadius: '50%',
            mb: 2,
            transition: 'border-color 0.2s ease',
          }}
        />
      </Box>

      {/* Controles de captura (overlay inferior) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
        }}
      >
        <CaptureProgress
          status={captureStatus}
          progress={captureProgress}
          validSamples={validSamples}
          isFrontal={isFrontal}
          isCentered={isCentered}
          onStart={onStartCapture}
          onStop={onStopCapture}
          error={captureError}
        />
      </Box>
    </Box>
  );
}
