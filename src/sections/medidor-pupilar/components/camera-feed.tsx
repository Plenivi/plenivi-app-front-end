import type { RefObject } from 'react';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface CameraFeedProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  status: 'idle' | 'requesting' | 'active' | 'error';
  error: string | null;
  onStart: () => void;
  onRetry: () => void;
  onCapture: () => void;
  onVideoReady?: (element: HTMLVideoElement | null) => void;
  isModelLoading: boolean;
  isModelReady: boolean;
  isProcessing: boolean;
  capturedImage: string | null;
}

export function CameraFeed({
  videoRef,
  stream,
  status,
  error,
  onStart,
  onRetry,
  onCapture,
  onVideoReady,
  isModelLoading,
  isModelReady,
  isProcessing,
  capturedImage,
}: CameraFeedProps) {
  const setVideoRef = useCallback(
    (element: HTMLVideoElement | null) => {
      (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = element;
      if (element && stream) {
        element.srcObject = stream;
      }
      onVideoReady?.(element);
    },
    [videoRef, stream, onVideoReady]
  );

  // Estado inicial - solicitar permissao
  if (status === 'idle') {
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
          Para medir sua distancia pupilar, precisamos acessar sua camera.
        </Typography>
        <Button variant="contained" size="large" onClick={onStart} startIcon={<Iconify icon="solar:camera-bold" />}>
          Permitir Camera
        </Button>
      </Box>
    );
  }

  // Solicitando permissao
  if (status === 'requesting') {
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

  // Erro
  if (status === 'error') {
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
          {error || 'Erro ao acessar a camera'}
        </Alert>
        <Button variant="outlined" onClick={onRetry} startIcon={<Iconify icon="solar:refresh-bold" />}>
          Tentar Novamente
        </Button>
      </Box>
    );
  }

  // Se temos uma imagem capturada, mostrar ela
  if (capturedImage) {
    return (
      <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', bgcolor: 'black' }}>
        <Box
          component="img"
          src={capturedImage}
          alt="Foto capturada"
          sx={{
            width: '100%',
            height: 'auto',
            minHeight: 400,
            maxHeight: 500,
            objectFit: 'cover',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            bgcolor: 'success.main',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Iconify icon="solar:check-circle-bold" width={20} />
          <Typography variant="caption" fontWeight="bold">
            Foto capturada
          </Typography>
        </Box>
      </Box>
    );
  }

  // Camera ativa - mostrar preview com botao de captura
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
            borderColor: 'warning.main',
            borderRadius: '50%',
            mb: 2,
          }}
        />
      </Box>

      {/* Status do modelo e botao de captura */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {isModelLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
            <CircularProgress size={16} color="inherit" />
            <Typography variant="caption">Carregando modelo de IA...</Typography>
          </Box>
        )}

        {isModelReady && !isProcessing && (
          <>
            <Typography variant="caption" sx={{ color: 'warning.main' }}>
              Posicione seu rosto dentro do oval e olhe para a camera
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={onCapture}
              startIcon={<Iconify icon="solar:camera-bold" />}
              sx={{ minWidth: 200 }}
            >
              Capturar Foto
            </Button>
          </>
        )}

        {isProcessing && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
            <CircularProgress size={20} color="inherit" />
            <Typography variant="body2">Analisando imagem...</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
