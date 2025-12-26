import { useRef, useState, useEffect, useCallback } from 'react';
import { DrawingUtils, FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type RunningMode = 'IMAGE' | 'VIDEO';

// Indices dos landmarks importantes
const KEY_LANDMARKS = {
  // Iris
  LEFT_IRIS_CENTER: 468,
  RIGHT_IRIS_CENTER: 473,
  // Olhos
  LEFT_EYE_INNER: 133,
  LEFT_EYE_OUTER: 33,
  RIGHT_EYE_INNER: 362,
  RIGHT_EYE_OUTER: 263,
  // Nariz
  NOSE_TIP: 1,
  NOSE_BRIDGE: 6,
  // Boca
  UPPER_LIP: 13,
  LOWER_LIP: 14,
  MOUTH_LEFT: 61,
  MOUTH_RIGHT: 291,
  // Sobrancelhas
  LEFT_EYEBROW_INNER: 107,
  LEFT_EYEBROW_OUTER: 46,
  RIGHT_EYEBROW_INNER: 336,
  RIGHT_EYEBROW_OUTER: 276,
  // Contorno do rosto
  CHIN: 152,
  FOREHEAD: 10,
  LEFT_CHEEK: 234,
  RIGHT_CHEEK: 454,
};

interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

interface KeyLandmarksData {
  leftIrisCenter: LandmarkPoint | null;
  rightIrisCenter: LandmarkPoint | null;
  noseTip: LandmarkPoint | null;
  chin: LandmarkPoint | null;
  mouthLeft: LandmarkPoint | null;
  mouthRight: LandmarkPoint | null;
  leftEyeInner: LandmarkPoint | null;
  rightEyeInner: LandmarkPoint | null;
  totalLandmarks: number;
}

export function FaceTesteView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);

  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isModelReady, setIsModelReady] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facesDetected, setFacesDetected] = useState(0);
  const [runningMode, setRunningMode] = useState<RunningMode>('IMAGE');
  const [keyLandmarks, setKeyLandmarks] = useState<KeyLandmarksData>({
    leftIrisCenter: null,
    rightIrisCenter: null,
    noseTip: null,
    chin: null,
    mouthLeft: null,
    mouthRight: null,
    leftEyeInner: null,
    rightEyeInner: null,
    totalLandmarks: 0,
  });

  // Inicializar FaceLandmarker
  useEffect(() => {
    let isMounted = true;

    const initFaceLandmarker = async () => {
      try {
        console.log('[FaceTeste] Carregando modelo...');

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
          numFaces: 2,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
        });

        console.log('[FaceTeste] Modelo carregado!');

        if (isMounted) {
          faceLandmarkerRef.current = faceLandmarker;
          setIsModelLoading(false);
          setIsModelReady(true);
        }
      } catch (err) {
        console.error('[FaceTeste] Erro:', err);
        if (isMounted) {
          setIsModelLoading(false);
          setError('Erro ao carregar modelo. Recarregue a pagina.');
        }
      }
    };

    initFaceLandmarker();

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      faceLandmarkerRef.current?.close();
    };
  }, []);

  // Processar frame do video
  const predictWebcam = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const faceLandmarker = faceLandmarkerRef.current;

    if (!video || !canvas || !faceLandmarker) {
      return;
    }

    // Ajustar canvas ao tamanho do video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mudar para modo VIDEO se necessario
    if (runningMode === 'IMAGE') {
      await faceLandmarker.setOptions({ runningMode: 'VIDEO' });
      setRunningMode('VIDEO');
    }

    const startTimeMs = performance.now();

    // So processar se o tempo do video mudou
    if (lastVideoTimeRef.current !== video.currentTime) {
      lastVideoTimeRef.current = video.currentTime;

      const results = faceLandmarker.detectForVideo(video, startTimeMs);

      // Limpar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Desenhar landmarks se detectados
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        setFacesDetected(results.faceLandmarks.length);

        const drawingUtils = new DrawingUtils(ctx);
        const firstFaceLandmarks = results.faceLandmarks[0];

        // Extrair pontos chave do primeiro rosto
        if (firstFaceLandmarks.length >= 478) {
          setKeyLandmarks({
            leftIrisCenter: firstFaceLandmarks[KEY_LANDMARKS.LEFT_IRIS_CENTER],
            rightIrisCenter: firstFaceLandmarks[KEY_LANDMARKS.RIGHT_IRIS_CENTER],
            noseTip: firstFaceLandmarks[KEY_LANDMARKS.NOSE_TIP],
            chin: firstFaceLandmarks[KEY_LANDMARKS.CHIN],
            mouthLeft: firstFaceLandmarks[KEY_LANDMARKS.MOUTH_LEFT],
            mouthRight: firstFaceLandmarks[KEY_LANDMARKS.MOUTH_RIGHT],
            leftEyeInner: firstFaceLandmarks[KEY_LANDMARKS.LEFT_EYE_INNER],
            rightEyeInner: firstFaceLandmarks[KEY_LANDMARKS.RIGHT_EYE_INNER],
            totalLandmarks: firstFaceLandmarks.length,
          });
        }

        for (const landmarks of results.faceLandmarks) {
          // Desenhar tesselation (malha facial)
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
            color: '#C0C0C070',
            lineWidth: 1,
          });

          // Desenhar contorno do rosto
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, {
            color: '#E0E0E0',
            lineWidth: 2,
          });

          // Desenhar olhos
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, {
            color: '#30FF30',
            lineWidth: 2,
          });
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, {
            color: '#30FF30',
            lineWidth: 2,
          });

          // Desenhar iris
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, {
            color: '#FF3030',
            lineWidth: 2,
          });
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, {
            color: '#FF3030',
            lineWidth: 2,
          });

          // Desenhar sobrancelhas
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, {
            color: '#FF9800',
            lineWidth: 2,
          });
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, {
            color: '#FF9800',
            lineWidth: 2,
          });

          // Desenhar labios
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
            color: '#E91E63',
            lineWidth: 2,
          });
        }
      } else {
        setFacesDetected(0);
        setKeyLandmarks({
          leftIrisCenter: null,
          rightIrisCenter: null,
          noseTip: null,
          chin: null,
          mouthLeft: null,
          mouthRight: null,
          leftEyeInner: null,
          rightEyeInner: null,
          totalLandmarks: 0,
        });
      }
    }

    // Continuar loop de deteccao
    animationFrameRef.current = requestAnimationFrame(predictWebcam);
  }, [runningMode]);

  // Iniciar camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          setIsCameraActive(true);
          predictWebcam();
        };
      }
    } catch (err) {
      console.error('[FaceTeste] Erro ao acessar camera:', err);
      setError('Nao foi possivel acessar a camera. Verifique as permissoes.');
    }
  }, [predictWebcam]);

  // Parar camera
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
    setFacesDetected(0);
  }, []);

  // Limpar ao desmontar
  useEffect(
    () => () => {
      stopCamera();
    },
    [stopCamera]
  );

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Face Landmarks - Teste
      </Typography>

      <Card sx={{ p: 3 }}>
        {/* Status do modelo */}
        {isModelLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <CircularProgress size={24} />
            <Typography>Carregando modelo MediaPipe...</Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Controles */}
        {isModelReady && !isCameraActive && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              onClick={startCamera}
              startIcon={<Iconify icon="solar:camera-bold" />}
            >
              Iniciar Camera
            </Button>
          </Box>
        )}

        {isCameraActive && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: facesDetected > 0 ? 'success.main' : 'warning.main',
                }}
              />
              <Typography variant="body2">
                {facesDetected > 0
                  ? `${facesDetected} rosto(s) detectado(s)`
                  : 'Nenhum rosto detectado'}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="error"
              onClick={stopCamera}
              startIcon={<Iconify icon="solar:stop-bold" />}
            >
              Parar Camera
            </Button>
          </Box>
        )}

        {/* Container do video e canvas */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 800,
            mx: 'auto',
            bgcolor: 'grey.900',
            borderRadius: 2,
            overflow: 'hidden',
            aspectRatio: '16/9',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
            }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
            }}
          />

          {!isCameraActive && !isModelLoading && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'grey.500',
              }}
            >
              <Iconify icon="solar:camera-bold-duotone" width={64} sx={{ mb: 2, opacity: 0.5 }} />
              <Typography variant="body2">Clique em &quot;Iniciar câmera&quot; para começar</Typography>
            </Box>
          )}
        </Box>

        {/* Legenda */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Legenda dos Landmarks:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 3, bgcolor: '#C0C0C0', borderRadius: 1 }} />
              <Typography variant="caption">Malha Facial</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 3, bgcolor: '#E0E0E0', borderRadius: 1 }} />
              <Typography variant="caption">Contorno do Rosto</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 3, bgcolor: '#30FF30', borderRadius: 1 }} />
              <Typography variant="caption">Olhos</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 3, bgcolor: '#FF3030', borderRadius: 1 }} />
              <Typography variant="caption">Iris</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 3, bgcolor: '#FF9800', borderRadius: 1 }} />
              <Typography variant="caption">Sobrancelhas</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 3, bgcolor: '#E91E63', borderRadius: 1 }} />
              <Typography variant="caption">Labios</Typography>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Valores dos Landmarks */}
      {isCameraActive && keyLandmarks.totalLandmarks > 0 && (
        <Card sx={{ p: 3, mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h6">Valores dos Landmarks (em tempo real)</Typography>
            <Chip
              label={`${keyLandmarks.totalLandmarks} pontos`}
              color="primary"
              size="small"
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
              gap: 2,
            }}
          >
            {/* Iris Esquerda */}
            <LandmarkCard
              title="Iris Esquerda"
              index={KEY_LANDMARKS.LEFT_IRIS_CENTER}
              point={keyLandmarks.leftIrisCenter}
              color="#FF3030"
            />

            {/* Iris Direita */}
            <LandmarkCard
              title="Iris Direita"
              index={KEY_LANDMARKS.RIGHT_IRIS_CENTER}
              point={keyLandmarks.rightIrisCenter}
              color="#FF3030"
            />

            {/* Olho Esquerdo (interno) */}
            <LandmarkCard
              title="Olho Esq. (interno)"
              index={KEY_LANDMARKS.LEFT_EYE_INNER}
              point={keyLandmarks.leftEyeInner}
              color="#30FF30"
            />

            {/* Olho Direito (interno) */}
            <LandmarkCard
              title="Olho Dir. (interno)"
              index={KEY_LANDMARKS.RIGHT_EYE_INNER}
              point={keyLandmarks.rightEyeInner}
              color="#30FF30"
            />

            {/* Ponta do Nariz */}
            <LandmarkCard
              title="Ponta do Nariz"
              index={KEY_LANDMARKS.NOSE_TIP}
              point={keyLandmarks.noseTip}
              color="#00BCD4"
            />

            {/* Queixo */}
            <LandmarkCard
              title="Queixo"
              index={KEY_LANDMARKS.CHIN}
              point={keyLandmarks.chin}
              color="#E0E0E0"
            />

            {/* Boca Esquerda */}
            <LandmarkCard
              title="Boca Esquerda"
              index={KEY_LANDMARKS.MOUTH_LEFT}
              point={keyLandmarks.mouthLeft}
              color="#E91E63"
            />

            {/* Boca Direita */}
            <LandmarkCard
              title="Boca Direita"
              index={KEY_LANDMARKS.MOUTH_RIGHT}
              point={keyLandmarks.mouthRight}
              color="#E91E63"
            />
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Nota:</strong> Os valores x, y representam a posicao normalizada (0-1) na imagem.
              O valor z representa a profundidade relativa ao centro do rosto (valores negativos = mais proximo da camera).
            </Typography>
          </Box>
        </Card>
      )}
    </Container>
  );
}

// Componente auxiliar para exibir cada landmark
function LandmarkCard({
  title,
  index,
  point,
  color,
}: {
  title: string;
  index: number;
  point: LandmarkPoint | null;
  color: string;
}) {
  const formatValue = (val: number) => val.toFixed(4);

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        borderLeft: `4px solid ${color}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2">{title}</Typography>
        <Chip label={`#${index}`} size="small" variant="outlined" />
      </Box>
      {point ? (
        <Box sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              X:
            </Typography>
            <Typography variant="caption" fontWeight="bold">
              {formatValue(point.x)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              Y:
            </Typography>
            <Typography variant="caption" fontWeight="bold">
              {formatValue(point.y)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              Z:
            </Typography>
            <Typography variant="caption" fontWeight="bold">
              {formatValue(point.z)}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary">
          Aguardando...
        </Typography>
      )}
    </Box>
  );
}
