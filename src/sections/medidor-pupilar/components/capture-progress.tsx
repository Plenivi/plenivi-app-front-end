/**
 * Componente de feedback visual durante a captura de amostras faciais.
 * Exibe progresso, indicadores de qualidade e botões de controle.
 */

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

import { CAPTURE_CONFIG } from '../hooks/use-face-capture';

import type { CaptureStatus } from '../hooks/use-face-capture';

// ----------------------------------------------------------------------

interface CaptureProgressProps {
  status: CaptureStatus;
  progress: number;
  validSamples: number;
  isFrontal: boolean;
  isCentered: boolean;
  onStart: () => void;
  onStop: () => void;
  error?: string | null;
}

// ----------------------------------------------------------------------

export function CaptureProgress({
  status,
  progress,
  validSamples,
  isFrontal,
  isCentered,
  onStart,
  onStop,
  error,
}: CaptureProgressProps) {
  const isCapturing = status === 'capturing';
  const isProcessing = status === 'processing';
  const isReady = status === 'ready';
  const isInitializing = status === 'initializing';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 2,
      }}
    >
      {/* Status de Inicialização */}
      {isInitializing && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Carregando modelo de IA...
          </Typography>
        </Stack>
      )}

      {/* Indicadores de Qualidade (durante captura) */}
      {(isCapturing || isReady) && (
        <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
          <Chip
            size="small"
            icon={<Iconify icon={isFrontal ? 'mdi:check' : 'mdi:close'} />}
            label="Frontal"
            color={isFrontal ? 'success' : 'default'}
            variant={isFrontal ? 'filled' : 'outlined'}
          />
          <Chip
            size="small"
            icon={<Iconify icon={isCentered ? 'mdi:check' : 'mdi:close'} />}
            label="Centralizado"
            color={isCentered ? 'success' : 'default'}
            variant={isCentered ? 'filled' : 'outlined'}
          />
        </Stack>
      )}

      {/* Barra de Progresso (durante captura) */}
      {isCapturing && (
        <Box sx={{ width: '100%', maxWidth: 300 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Coletando amostras...
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {validSamples}/{CAPTURE_CONFIG.TARGET_SAMPLES}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
              },
            }}
          />
        </Box>
      )}

      {/* Status de Processamento */}
      {isProcessing && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Processando dados...
          </Typography>
        </Stack>
      )}

      {/* Mensagem de Erro */}
      {error && status === 'error' && (
        <Typography
          variant="body2"
          color="error"
          sx={{ textAlign: 'center', maxWidth: 300 }}
        >
          {error}
        </Typography>
      )}

      {/* Instruções */}
      {isReady && !isCapturing && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', maxWidth: 300 }}
        >
          Posicione seu rosto dentro do oval e clique em iniciar
        </Typography>
      )}

      {isCapturing && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', maxWidth: 300 }}
        >
          Mantenha o rosto parado e olhe para a camera
        </Typography>
      )}

      {/* Botões de Ação */}
      <Stack direction="row" spacing={2}>
        {isReady && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onStart}
            startIcon={<Iconify icon="mdi:face-recognition" />}
          >
            Iniciar Captura
          </Button>
        )}

        {isCapturing && (
          <Button
            variant="outlined"
            color="warning"
            size="large"
            onClick={onStop}
            startIcon={<Iconify icon="mdi:stop" />}
          >
            Cancelar
          </Button>
        )}

        {status === 'error' && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onStart}
            startIcon={<Iconify icon="mdi:refresh" />}
          >
            Tentar Novamente
          </Button>
        )}
      </Stack>
    </Box>
  );
}
