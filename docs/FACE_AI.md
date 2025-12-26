# Face IA - Análise Facial com Visao Computacional

Este documento descreve a implementacao do sistema de Análise facial usando visao computacional, incluindo medicao de distância pupilar (DP) e classificacao de formato do rosto.

## Visao Geral

O sistema **Face IA** usa a biblioteca **MediaPipe FaceLandmarker** do Google para detectar pontos faciais (landmarks) e realizar Análises estatisticas para maior precisao. A captura e feita de forma continua, coletando multiplas amostras que sao processadas estatisticamente.

### Funcionalidades

- **Medicao de DP**: Calcula a distância pupilar com alta precisao
- **Classificacao de Formato**: Identifica o formato do rosto (oval, redondo, quadrado, coracao, oblongo)
- **Captura Estatistica**: Coleta 90 amostras em ~3 segundos para maior precisao
- **Persistencia Local**: Dados salvos em localStorage

### Tecnologias Utilizadas

- **@mediapipe/tasks-vision**: Biblioteca de visao computacional do Google
- **FaceLandmarker**: Modelo de deteccao de landmarks faciais (478 pontos)
- **WebRTC (getUserMedia)**: Acesso a camera do dispositivo

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            FaceAiView                                    │
│  ┌───────────────┐  ┌──────────────────┐  ┌───────────────────────────┐  │
│  │  useCamera()  │  │  useFaceCapture()│  │     useMedidas()          │  │
│  │               │  │                  │  │       (Context)           │  │
│  │ - startCamera │  │ - startCapture   │  │ - adicionarMedida         │  │
│  │ - stopCamera  │  │ - stopCapture    │  │ - medidas                 │  │
│  │ - stream      │  │ - result         │  │ - medidaAtual             │  │
│  │ - videoRef    │  │ - progress       │  │ - localStorage            │  │
│  └───────┬───────┘  │ - validSamples   │  └───────────────────────────┘  │
│          │          │ - isFrontal      │                                  │
│          │          │ - isCentered     │                                  │
│          │          └────────┬─────────┘                                  │
│          │                   │                                            │
│          v                   v                                            │
│  ┌─────────────────────────────────────────┐                             │
│  │              CameraFeed                  │                             │
│  │  - Preview da camera                     │                             │
│  │  - Guia oval dinamico                    │                             │
│  │  - CaptureProgress (overlay)             │                             │
│  └─────────────────────────────────────────┘                             │
│                      │                                                    │
│                      v                                                    │
│  ┌─────────────────────────────────────────┐                             │
│  │              FaceResult                  │                             │
│  │  - Valor DP + confianca                  │                             │
│  │  - Formato do rosto (chip)               │                             │
│  │  - Medidas detalhadas (expansivel)       │                             │
│  └─────────────────────────────────────────┘                             │
└─────────────────────────────────────────────────────────────────────────┘
```

## Fluxo de Captura Estatistica

```
IDLE → CAPTURING (90 amostras) → PROCESSING → SUCCESS
         │                            │
         │   ~3 segundos              │  Mediana + IQR
         │   30 fps                   │
         └─────── RETRY ←─────────────┘
              (se < 60 validas)
```

### Etapas Detalhadas

1. **Usuario acessa a pagina** → Modelo FaceLandmarker comeca a carregar
2. **Usuario clica "Permitir Camera"** → Camera e iniciada via WebRTC
3. **Modelo pronto** → Status muda para 'ready'
4. **Usuario clica "Iniciar Captura"** → Loop de captura inicia
5. **Cada frame (~30fps)**:
   - FaceLandmarker detecta landmarks
   - Valida qualidade (confianca >= 85%, rosto frontal)
   - Se valido, armazena landmarks
   - Atualiza progresso e indicadores visuais
6. **Ao atingir 90 amostras** (ou timeout de 5s):
   - Para captura
   - Processa estatisticamente (mediana + IQR)
7. **Resultado exibido**:
   - DP comconfiança
   - Formato do rosto
   - Usuario pode salvar ou refazer

## Algoritmo de Captura

### Configuracao

```typescript
CAPTURE_CONFIG = {
  TARGET_SAMPLES: 90,           // Meta de amostras
  MIN_VALID_SAMPLES: 60,        // Minimo para processar
  MAX_CAPTURE_TIME_MS: 5000,    // Timeout (5 segundos)
  MIN_DETECTION_CONFIDENCE: 0.85,  //confiança minima
  MAX_Z_DIFF_FOR_FRONTAL: 0.03,    // Tolerancia para frontalidade
}
```

### Validacao de Frame

Um frame e considerado valido se:

1. **Confianca >= 85%**: Deteccao confiavel
2. **Rosto frontal**: Diferenca de Z entre pupilas <= 0.03
3. **Landmarks validos**: 478 pontos detectados, sem NaN

```typescript
function isValidFrame(landmarks, confidence) {
  // 1. Verificarconfiança
  if (confidence < 0.85) return false;

  // 2. Verificar frontalidade
  const leftZ = landmarks[468].z;
  const rightZ = landmarks[473].z;
  if (Math.abs(leftZ - rightZ) > 0.03) return false;

  // 3. Verificar landmarks da iris
  const irisIndices = [468, 469, 471, 473, 474, 476];
  for (const idx of irisIndices) {
    if (isNaN(landmarks[idx].x)) return false;
  }

  return true;
}
```

## Processamento Estatistico

### Mediana com IQR

Para cada landmark (478 pontos x 3 coordenadas = 1434 valores):

```typescript
function medianWithIQR(values) {
  // 1. Ordenar valores
  const sorted = [...values].sort((a, b) => a - b);

  // 2. Calcular quartis
  const q1 = quartile(sorted, 0.25);
  const q3 = quartile(sorted, 0.75);
  const iqr = q3 - q1;

  // 3. Definir limites
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  // 4. Filtrar outliers
  const filtered = values.filter(v =>
    v >= lowerBound && v <= upperBound
  );

  // 5. Retornar mediana dos valores filtrados
  return median(filtered);
}
```

### Por que IQR?

- **Robusto a outliers**: Frames com erro de deteccao nao afetam o resultado
- **Estatisticamente valido**: Metodo padrao para deteccao de outliers
- **Eficiente**: O(n log n) por coordenada

## Calculo do DP

### Landmarks Utilizados

```
LANDMARKS = {
  LEFT_IRIS_CENTER: 468,    // Centro da iris esquerda
  RIGHT_IRIS_CENTER: 473,   // Centro da iris direita
  LEFT_IRIS_LEFT: 469,      // Borda esquerda da iris esquerda
  LEFT_IRIS_RIGHT: 471,     // Borda direita da iris esquerda
  RIGHT_IRIS_LEFT: 474,     // Borda esquerda da iris direita
  RIGHT_IRIS_RIGHT: 476,    // Borda direita da iris direita
}
```

### Formula de Calculo

```
1. Calcular diametro de cada iris (coordenadas normalizadas):
   leftIrisDiameter = distância(469, 471)
   rightIrisDiameter = distância(474, 476)

2. Media dos diametros:
   avgIrisDiameter = (leftIrisDiameter + rightIrisDiameter) / 2

3. distância entre centros das pupilas:
   pupilDistance = distância(468, 473)

4. Converter para milimetros:
   dpMm = (pupilDistance / avgIrisDiameter) * AVG_IRIS_DIAMETER_MM
```

### Constante de Calibracao

```typescript
const AVG_IRIS_DIAMETER_MM = 12.5;
```

O diametro medio da iris humana e ~11.7mm (range: 10.2-13.0mm). O valor 12.5mm foi ajustado empiricamente.

## Classificacao de Formato do Rosto

### Landmarks do Contorno Facial

O sistema usa 36 pontos do contorno facial (FACE_OVAL) para calcular:

- **faceWidth**: Largura nas macas do rosto
- **faceHeight**: Altura (testa ao queixo)
- **foreheadWidth**: Largura da testa
- **jawWidth**: Largura do maxilar
- **aspectRatio**: Proporcao altura/largura

### Regras de Classificacao

| Formato | Criterios |
|---------|-----------|
| **Oval** | Proporcao equilibrada, testa > maxilar (mais comum) |
| **Redondo** | aspectRatio < 1.1, testa ≈ maxilar |
| **Quadrado** | aspectRatio < 1.25, testa ≈ macas ≈ maxilar |
| **Coracao** | Testa significativamente > maxilar |
| **Oblongo** | aspectRatio > 1.6 (rosto alongado) |

> **Nota:** O limiar para oblongo foi ajustado de 1.5 para 1.6 para compensar distorcao de lentes wide-angle em webcams de notebook que tendem a alongar o rosto verticalmente. Valores entre 1.5 e 1.6 sao classificados como oval com confianca reduzida (70%).

### Uso para Recomendacao de Armacoes

Cada formato tem recomendacoes especificas:

- **Oval**: Mais versatil, combina com maioria das armacoes
- **Redondo**: Armacoes angulares adicionam definicao
- **Quadrado**: Armacoes arredondadas suavizam
- **Coracao**: Armacoes que equilibram a parte inferior
- **Oblongo**: Armacoes mais largas equilibram proporcoes

## Estrutura de Arquivos

```
src/sections/face-ai/
├── index.ts                          # Re-export do componente principal
├── face-ai-view.tsx                  # Componente principal (FaceAiView)
├── hooks/
│   ├── use-camera.ts                 # Hook de acesso a camera
│   ├── use-face-mesh.ts              # Hook legado (single-shot)
│   └── use-face-capture.ts           # Hook de captura estatistica
├── utils/
│   ├── statistics.ts                 # Funcoes de mediana, IQR
│   ├── capture-config.ts             # Configuracoes de captura
│   └── face-analysis.ts              # Calculo DP, classificacao
├── components/
│   ├── camera-feed.tsx               # Preview da camera
│   ├── capture-progress.tsx          # Feedback de progresso
│   ├── face-result.tsx               # Resultado da Análise
│   ├── measurement-result.tsx        # Resultado da medicao
│   ├── manual-entry-form.tsx         # Entrada manual de DP
│   ├── measurement-history.tsx       # Historico de medicoes
│   └── measurement-instructions.tsx  # Instrucoes de uso

src/contexts/
└── medidas-context.tsx               # Persistencia (localStorage)

src/pages/
└── face-ai.tsx                       # Pagina (rota: /face-ai)

src/routes/
└── sections.tsx                      # Definicao de rotas
```

## Persistencia de Dados

### Estrutura de Dados

```typescript
interface Medida {
  id: string;
  dpValue: number;
  confidence: number;
  metodo: 'camera' | 'manual';
  dataRegistro: string;
  faceShape?: {
    classification: 'oval' | 'round' | 'square' | 'heart' | 'oblong';
    confidence: number;
    measurements: {
      faceWidth: number;
      faceHeight: number;
      foreheadWidth: number;
      jawWidth: number;
      cheekboneWidth: number;
      aspectRatio: number;
    };
  };
  validSamples?: number;
}
```

### localStorage

- **Chave**: `plenivi-face-medidas`
- **Formato**: JSON array de Medida
- **Carregamento**: Automatico na inicializacao
- **Salvamento**: Automatico a cada mutacao

## Dependencias

```json
{
  "@mediapipe/tasks-vision": "latest"
}
```

Recursos carregados de CDNs:
- WASM: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm`
- Modelo: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`

## Performance

### Otimizacoes

- **requestAnimationFrame**: Loop de captura nao bloqueia UI
- **GPU delegate**: FaceLandmarker usa GPU quando disponivel
- **runningMode: VIDEO**: Otimizado para video continuo
- **Apenas landmarks**: Nao armazena frames de video

### Metricas Tipicas

- **Tempo de captura**: ~3 segundos (90 amostras @ 30fps)
- **Tempo de processamento**: < 100ms (apos captura)
- **Uso de memoria**: ~2-3MB para 90 amostras de landmarks

## Limitacoes Conhecidas

1. **Iluminacao**: Funciona melhor com boa iluminacao frontal
2. **Oculos**: Pode ter dificuldade com oculos de grau ou sol
3. **distância**: Usuario deve estar a ~40-60cm da camera
4. **Angulo**: Rosto deve estar de frente para a camera
5. **Resolucao**: Cameras de baixa resolucao podem afetar precisao
6. **Movimento**: Usuario deve manter o rosto relativamente parado

## Troubleshooting

### "Erro ao carregar modelo"
- Verificar conexao com internet (modelo e baixado de CDN)
- Verificar se WebGL esta habilitado no navegador

### "Amostras insuficientes"
- Melhorar iluminacao
- Manter rosto frontal e parado
- Centralizar rosto no guia oval
- Remover oculos escuros

### "Rosto nao detectado"
- Verificar iluminacao
- Centralizar rosto na tela
- Verificar distância da camera

### "Medicao muito diferente do esperado"
- Verificar se o rosto esta de frente
- Olhar diretamente para a camera
- Manter distância adequada (~50cm)
- Se consistentemente errado, ajustar AVG_IRIS_DIAMETER_MM

### "Camera nao funciona"
- Verificar permissoes do navegador
- Fechar outros apps que usam camera
- Usar HTTPS (camera requer conexao segura)

## Referencias

- [MediaPipe Face Landmarker](https://developers.google.com/mediapipe/solutions/vision/face_landmarker)
- [Face Mesh Landmarks](https://github.com/google-ai-edge/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png)
- [Iris Diameter Studies](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4075958/)
- [IQR Method for Outlier Detection](https://en.wikipedia.org/wiki/Interquartile_range)
