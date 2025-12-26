import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { DashboardContent } from 'src/layouts/dashboard';
import { useMedidas } from 'src/contexts/medidas-context';

import { Iconify } from 'src/components/iconify';

import { useCamera } from './hooks/use-camera';
import { useFaceMesh } from './hooks/use-face-mesh';
import { CameraFeed } from './components/camera-feed';
import { ManualEntryForm } from './components/manual-entry-form';
import { MeasurementHistory } from './components/measurement-history';
import { MeasurementInstructions } from './components/measurement-instructions';

// ----------------------------------------------------------------------

type MeasurementMode = 'camera' | 'manual';

export function MedidorPupilarView() {
  const [mode, setMode] = useState<MeasurementMode>('camera');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  const { medidas, medidaAtual, adicionarMedida, removerMedida, selecionarMedida } = useMedidas();

  const camera = useCamera();
  const faceMesh = useFaceMesh();

  // Callback para receber o elemento de video do CameraFeed
  const handleVideoReady = useCallback((element: HTMLVideoElement | null) => {
    setVideoElement(element);
  }, []);

  // Limpar mensagem de sucesso apos 3 segundos
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [saveSuccess]);

  // Capturar foto e medir
  const handleCapture = useCallback(() => {
    if (videoElement) {
      faceMesh.captureAndMeasure(videoElement);
    }
  }, [videoElement, faceMesh]);

  // Salvar medicao
  const handleSaveCameraMeasurement = () => {
    if (faceMesh.dpValue === null) return;

    setIsSaving(true);

    setTimeout(() => {
      adicionarMedida({
        dpValue: faceMesh.dpValue!,
        confidence: faceMesh.confidence,
        metodo: 'camera',
      });
      setIsSaving(false);
      setSaveSuccess(true);
      camera.stopCamera();
      setVideoElement(null);
      faceMesh.reset();
    }, 500);
  };

  const handleSaveManualMeasurement = (dpValue: number) => {
    adicionarMedida({
      dpValue,
      confidence: 100,
      metodo: 'manual',
    });
    setSaveSuccess(true);
    setMode('camera');
  };

  // Nova captura (resetar e voltar para camera)
  const handleNewCapture = () => {
    faceMesh.reset();
  };

  const handleRetryCamera = () => {
    faceMesh.reset();
    camera.stopCamera();
    camera.startCamera();
  };

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:eye-scan-bold-duotone" width={32} />
          Medidor de Distancia Pupilar (DP)
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Meca sua distancia pupilar usando a camera do seu dispositivo ou insira manualmente.
        </Typography>
      </Box>

      {/* Alerta de sucesso */}
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSaveSuccess(false)}>
          Medicao salva com sucesso! Sua DP de {medidaAtual?.dpValue} mm esta disponivel para uso.
        </Alert>
      )}

      {/* Erro do FaceMesh */}
      {faceMesh.error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => faceMesh.reset()}>
          {faceMesh.error}
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
              setVideoElement(null);
              faceMesh.reset();
            }
          }}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab
            value="camera"
            label="Medir com Camera"
            icon={<Iconify icon="solar:camera-bold" width={20} />}
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
                {/* Instrucoes - acima da captura */}
                {!faceMesh.capturedImage && <MeasurementInstructions />}

                <CameraFeed
                  videoRef={camera.videoRef}
                  stream={camera.stream}
                  status={camera.status}
                  error={camera.getErrorMessage()}
                  onStart={camera.startCamera}
                  onRetry={handleRetryCamera}
                  onCapture={handleCapture}
                  onVideoReady={handleVideoReady}
                  isModelLoading={faceMesh.isLoading}
                  isModelReady={faceMesh.isReady}
                  isProcessing={faceMesh.isProcessing}
                  capturedImage={faceMesh.capturedImage}
                />
              </CardContent>
            </Card>
          ) : (
            <ManualEntryForm onSave={handleSaveManualMeasurement} onCancel={() => setMode('camera')} />
          )}
        </Grid>

        {/* Coluna lateral */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* Resultado da medicao (quando tiver foto capturada) */}
          {mode === 'camera' && faceMesh.capturedImage && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Resultado da Medicao
                </Typography>

                {faceMesh.faceDetected && faceMesh.dpValue ? (
                  <>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography variant="h2" color="primary.main">
                        {faceMesh.dpValue} mm
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Confianca: {faceMesh.confidence}%
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSaveCameraMeasurement}
                        disabled={isSaving}
                        startIcon={<Iconify icon="solar:diskette-bold" />}
                      >
                        {isSaving ? 'Salvando...' : 'Salvar Medicao'}
                      </Button>
                      <Button fullWidth variant="outlined" onClick={handleNewCapture}>
                        Nova Foto
                      </Button>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <Iconify icon="solar:face-scan-circle-bold-duotone" width={48} sx={{ color: 'error.main', mb: 1 }} />
                    <Typography variant="body2" color="error.main" sx={{ mb: 2 }}>
                      Nao foi possivel medir. Tente novamente.
                    </Typography>
                    <Button variant="outlined" onClick={handleNewCapture} startIcon={<Iconify icon="solar:refresh-bold" />}>
                      Tentar Novamente
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Medicao atual salva */}
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
