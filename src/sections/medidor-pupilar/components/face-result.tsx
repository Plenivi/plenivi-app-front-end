/**
 * Componente para exibir o resultado completo da análise facial.
 * Inclui DP, formato do rosto com chip simples e card expansível com medidas.
 */

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';

import { Iconify } from 'src/components/iconify';

import {
  FACE_SHAPE_ICONS,
  FACE_SHAPE_LABELS,
  FACE_SHAPE_DESCRIPTIONS,
} from '../utils/face-analysis';

import type { FaceAnalysisResult } from '../hooks/use-face-capture';

// ----------------------------------------------------------------------

interface FaceResultProps {
  result: FaceAnalysisResult;
  onSave: () => void;
  onRetry: () => void;
  isSaving?: boolean;
}

// ----------------------------------------------------------------------

function getConfidenceColor(confidence: number): 'success' | 'warning' | 'error' {
  if (confidence >= 80) return 'success';
  if (confidence >= 60) return 'warning';
  return 'error';
}

// ----------------------------------------------------------------------

export function FaceResult({ result, onSave, onRetry, isSaving = false }: FaceResultProps) {
  const [showDetails, setShowDetails] = useState(false);

  const { dp, faceShape } = result;
  const dpConfidenceColor = getConfidenceColor(dp.confidence);
  const canSave = dp.confidence >= 60;

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          {/* Valor do DP */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="overline" color="text.secondary">
              distância Pupilar (DP)
            </Typography>
            <Typography variant="h2" color="primary.main" sx={{ fontWeight: 700 }}>
              {dp.value} mm
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {dp.confidence}%confiança • {dp.validSamples} amostras
            </Typography>
          </Box>

          {/* Barra de Confiança */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
               confiança da medicao
              </Typography>
              <Typography variant="caption" color={`${dpConfidenceColor}.main`}>
                {dp.confidence}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={dp.confidence}
              color={dpConfidenceColor}
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

          <Divider />

          {/* Formato do Rosto - Chip Simples */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Formato do Rosto
            </Typography>
            <Chip
              icon={<Iconify icon={FACE_SHAPE_ICONS[faceShape.classification]} />}
              label={FACE_SHAPE_LABELS[faceShape.classification]}
              color="secondary"
              variant="filled"
              sx={{ fontSize: '1rem', py: 2.5, px: 1 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {faceShape.confidence}%confiança
            </Typography>
          </Box>

          {/* Botão para expandir detalhes */}
          <Button
            size="small"
            color="inherit"
            onClick={() => setShowDetails(!showDetails)}
            endIcon={
              <Iconify icon={showDetails ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
            }
            sx={{ alignSelf: 'center' }}
          >
            {showDetails ? 'Ocultar medidas' : 'Ver medidas detalhadas'}
          </Button>

          {/* Card Expansível com Medidas */}
          <Collapse in={showDetails}>
            <Card variant="outlined" sx={{ bgcolor: 'background.neutral' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Medidas do Rosto
                </Typography>

                <Stack spacing={1.5}>
                  <MeasurementRow
                    label="Largura do rosto"
                    value={formatMeasurement(faceShape.measurements.faceWidth)}
                  />
                  <MeasurementRow
                    label="Altura do rosto"
                    value={formatMeasurement(faceShape.measurements.faceHeight)}
                  />
                  <MeasurementRow
                    label="Largura da testa"
                    value={formatMeasurement(faceShape.measurements.foreheadWidth)}
                  />
                  <MeasurementRow
                    label="Largura do maxilar"
                    value={formatMeasurement(faceShape.measurements.jawWidth)}
                  />
                  <MeasurementRow
                    label="Proporcao (altura/largura)"
                    value={faceShape.measurements.aspectRatio.toFixed(2)}
                  />
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="text.secondary">
                  {FACE_SHAPE_DESCRIPTIONS[faceShape.classification]}
                </Typography>
              </CardContent>
            </Card>
          </Collapse>

          {/* Aviso de baixa confiança */}
          {dp.confidence < 70 && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'warning.lighter',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Iconify icon="mdi:alert" color="warning.main" />
              <Typography variant="body2" color="warning.dark">
               confiança baixa. Considere refazer a medicao em melhores condicoes de iluminacao.
              </Typography>
            </Box>
          )}

          <Divider />

          {/* Botões de Ação */}
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              color="inherit"
              onClick={onRetry}
              startIcon={<Iconify icon="mdi:refresh" />}
              disabled={isSaving}
            >
              Refazer
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={onSave}
              startIcon={<Iconify icon="mdi:content-save" />}
              disabled={!canSave || isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar Medicao'}
            </Button>
          </Stack>

          {!canSave && (
            <Typography variant="caption" color="error" sx={{ textAlign: 'center' }}>
             confiança muito baixa para salvar. Refaca a medicao.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

interface MeasurementRowProps {
  label: string;
  value: string;
}

function MeasurementRow({ label, value }: MeasurementRowProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  );
}

// ----------------------------------------------------------------------

/**
 * Formata valor normalizado (0-1) como porcentagem do rosto.
 * Valores normalizados do MediaPipe representam proporções relativas.
 */
function formatMeasurement(value: number): string {
  // Converte para porcentagem aproximada do tamanho do frame
  const percentage = (value * 100).toFixed(1);
  return `${percentage}%`;
}
