import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { DashboardContent } from 'src/layouts/dashboard';
import { useMedidas } from 'src/contexts/medidas-context';

import { Iconify } from 'src/components/iconify';

import { useCamera } from './hooks/use-camera';
import { CameraFeed } from './components/camera-feed';
import { FaceResult } from './components/face-result';
import { useFaceCapture } from './hooks/use-face-capture';
import { ManualEntryForm } from './components/manual-entry-form';
import { MeasurementHistory } from './components/measurement-history';
import { MeasurementInstructions } from './components/measurement-instructions';

// ----------------------------------------------------------------------

type MeasurementMode = 'camera' | 'manual';

export function FaceAiView() {
  const [mode, setMode] = useState<MeasurementMode>('camera');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { medidas, medidaAtual, adicionarMedida, removerMedida, selecionarMedida } = useMedidas();

  const camera = useCamera();
  // Usar o videoRef do hook da camera para o FaceCapture
  const faceCapture = useFaceCapture(camera.videoRef);

  // Limpar mensagem de sucesso apos 3 segundos
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [saveSuccess]);

  // Salvar medicao feita pela camera (com Análise facial completa)
  const handleSaveCameraMeasurement = () => {
    if (!faceCapture.result) return;

    setIsSaving(true);

    setTimeout(() => {
      const { dp, faceShape } = faceCapture.result!;

      adicionarMedida({
        dpValue: dp.value,
        confidence: dp.confidence,
        metodo: 'camera',
        faceShape: {
          classification: faceShape.classification,
          confidence: faceShape.confidence,
          measurements: faceShape.measurements,
        },
        validSamples: dp.validSamples,
      });

      setIsSaving(false);
      setSaveSuccess(true);
      camera.stopCamera();
      faceCapture.reset();
    }, 500);
  };

  const handleSaveManualMeasurement = (dpValue: number, faceShapeType?: string) => {
    adicionarMedida({
      dpValue,
      confidence: 100,
      metodo: 'manual',
      ...(faceShapeType && {
        faceShape: {
          classification: faceShapeType as 'oval' | 'round' | 'square' | 'heart' | 'oblong',
          confidence: 100,
          measurements: {
            faceWidth: 0,
            faceHeight: 0,
            foreheadWidth: 0,
            jawWidth: 0,
            cheekboneWidth: 0,
            aspectRatio: 0,
          },
        },
      }),
    });
    setSaveSuccess(true);
    setMode('camera');
  };

  // Nova captura (resetar)
  const handleRetry = () => {
    faceCapture.reset();
  };

  const handleRetryCamera = () => {
    faceCapture.reset();
    camera.stopCamera();
    camera.startCamera();
  };

  // Verifica se há resultado para exibir
  const hasResult = faceCapture.status === 'success' && faceCapture.result;

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:face-scan-circle-bold-duotone" width={32} />
          Face IA
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Análise seu rosto com IA para medir distância pupilar e descobrir seu formato de rosto.
        </Typography>
      </Box>

      {/* Alerta de sucesso */}
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSaveSuccess(false)}>
          Medicao salva com sucesso! Sua DP de {medidaAtual?.dpValue} mm esta disponivel para uso.
        </Alert>
      )}

      {/* Erro do FaceCapture */}
      {faceCapture.error && faceCapture.status !== 'error' && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => faceCapture.reset()}>
          {faceCapture.error}
        </Alert>
      )}

      {/* Tabs de modo */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={mode}
          onChange={(_, newValue) => {
            setMode(newValue);
            if (newValue === 'manual') {
              camera.stopCamera();
              faceCapture.reset();
            }
          }}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab
            value="camera"
            label="Análise com Camera"
            icon={<Iconify icon="solar:face-scan-circle-bold" width={20} />}
            iconPosition="start"
          />
          <Tab
            value="manual"
            label="Entrada Manual"
            icon={<Iconify icon="solar:pen-bold" width={20} />}
            iconPosition="start"
          />
        </Tabs>
      </Card>

      <Grid container spacing={3}>
        {/* Coluna principal */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {mode === 'camera' ? (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                {/* Instrucoes - acima da captura (apenas quando não há resultado) */}
                {!hasResult && <MeasurementInstructions />}

                {/* Camera Feed com controles de captura */}
                {!hasResult && (
                  <CameraFeed
                    videoRef={camera.videoRef}
                    stream={camera.stream}
                    cameraStatus={camera.status}
                    cameraError={camera.getErrorMessage()}
                    onStartCamera={camera.startCamera}
                    onRetryCamera={handleRetryCamera}
                    captureStatus={faceCapture.status}
                    captureProgress={faceCapture.progress}
                    validSamples={faceCapture.validSamples}
                    isFrontal={faceCapture.isFrontal}
                    isCentered={faceCapture.isCentered}
                    captureError={faceCapture.error}
                    onStartCapture={faceCapture.startCapture}
                    onStopCapture={faceCapture.stopCapture}
                  />
                )}

                {/* Resultado da análise facial */}
                {hasResult && faceCapture.result && (
                  <FaceResult
                    result={faceCapture.result}
                    onSave={handleSaveCameraMeasurement}
                    onRetry={handleRetry}
                    isSaving={isSaving}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <ManualEntryForm onSave={handleSaveManualMeasurement} onCancel={() => setMode('camera')} />
          )}
        </Grid>

        {/* Coluna lateral */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* Medição atual salva */}
          {medidaAtual && (
            <Card sx={{ mb: 3, bgcolor: 'primary.lighter' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="solar:check-circle-bold" width={20} color="primary.main" />
                  Sua DP Atual
                </Typography>
                <Typography variant="h3" color="primary.main">
                  {medidaAtual.dpValue} mm
                </Typography>
                {medidaAtual.faceShape && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Formato: {medidaAtual.faceShape.classification}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  Medida em{' '}
                  {new Date(medidaAtual.dataRegistro).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Historico */}
          <MeasurementHistory
            medidas={medidas}
            medidaAtualId={medidaAtual?.id || null}
            onSelect={selecionarMedida}
            onDelete={removerMedida}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
