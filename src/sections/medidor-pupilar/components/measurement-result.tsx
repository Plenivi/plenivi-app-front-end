import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface MeasurementResultProps {
  dpValue: number | null;
  confidence: number;
  faceDetected: boolean;
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
}

export function MeasurementResult({
  dpValue,
  confidence,
  faceDetected,
  onSave,
  onReset,
  isSaving = false,
}: MeasurementResultProps) {
  const getConfidenceColor = () => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'warning';
    return 'error';
  };

  const getConfidenceLabel = () => {
    if (confidence >= 80) return 'Alta confianca';
    if (confidence >= 60) return 'Media confianca';
    return 'Baixa confianca';
  };

  const isValidMeasurement = dpValue !== null && dpValue >= 50 && dpValue <= 80 && confidence >= 60;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Resultado da Medição
        </Typography>

        {/* Valor da DP */}
        <Box
          sx={{
            textAlign: 'center',
            py: 3,
            px: 2,
            bgcolor: faceDetected ? 'primary.lighter' : 'grey.100',
            borderRadius: 2,
            mb: 2,
          }}
        >
          {dpValue !== null ? (
            <>
              <Typography variant="h2" color="primary.main">
                {dpValue}
                <Typography component="span" variant="h5" color="text.secondary">
                  {' '}
                  mm
                </Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Distancia Pupilar (DP)
              </Typography>
            </>
          ) : (
            <>
              <Iconify icon="solar:eye-scan-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                Aguardando deteccao...
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Posicione seu rosto na camera
              </Typography>
            </>
          )}
        </Box>

        {/* Indicador de confianca */}
        {dpValue !== null && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Confiança da medição
              </Typography>
              <Chip label={getConfidenceLabel()} color={getConfidenceColor()} size="small" />
            </Box>
            <LinearProgress
              variant="determinate"
              value={confidence}
              color={getConfidenceColor()}
              sx={{ height: 8, borderRadius: 1 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {confidence}%
            </Typography>
          </Box>
        )}

        {/* Aviso se baixa confianca */}
        {dpValue !== null && confidence < 70 && (
          <Box
            sx={{
              p: 2,
              bgcolor: 'warning.lighter',
              borderRadius: 1,
              mb: 2,
              display: 'flex',
              gap: 1,
              alignItems: 'flex-start',
            }}
          >
            <Iconify icon="solar:danger-triangle-bold" width={20} sx={{ color: 'warning.main', mt: 0.25 }} />
            <Typography variant="caption" color="warning.dark">
              Confianca baixa. Recomendamos medir novamente em um ambiente bem iluminado, olhando diretamente para a
              camera.
            </Typography>
          </Box>
        )}

        {/* Botoes de acao */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={onSave}
            disabled={!isValidMeasurement || isSaving}
            startIcon={<Iconify icon="solar:check-circle-bold" />}
          >
            {isSaving ? 'Salvando...' : 'Salvar Medição'}
          </Button>
          <Button variant="outlined" onClick={onReset} startIcon={<Iconify icon="solar:refresh-bold" />}>
            Refazer
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
