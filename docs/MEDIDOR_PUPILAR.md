# Medidor de Distancia Pupilar (DP)

Este documento descreve a implementacao do medidor de distancia pupilar usando visao computacional.

## Visao Geral

O medidor de DP usa a biblioteca **MediaPipe FaceLandmarker** do Google para detectar pontos faciais (landmarks) e calcular a distancia entre as pupilas.

### Tecnologias Utilizadas

- **@mediapipe/tasks-vision**: Biblioteca de visao computacional do Google
- **FaceLandmarker**: Modelo de deteccao de landmarks faciais (478 pontos)
- **WebRTC (getUserMedia)**: Acesso a camera do dispositivo

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                    MedidorPupilarView                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   useCamera()   │  │  useFaceMesh()  │  │   useMedidas()  │  │
│  │                 │  │                 │  │    (Context)    │  │
│  │ - startCamera   │  │ - captureAndMeasure │ - adicionarMedida│
│  │ - stopCamera    │  │ - reset         │  │ - medidas       │  │
│  │ - stream        │  │ - dpValue       │  │ - medidaAtual   │  │
│  └────────┬────────┘  └────────┬────────┘  └─────────────────┘  │
│           │                    │                                 │
│           v                    v                                 │
│  ┌─────────────────────────────────────────┐                    │
│  │              CameraFeed                  │                    │
│  │  - Preview da camera                     │                    │
│  │  - Botao "Capturar Foto"                 │                    │
│  │  - Exibicao da foto capturada            │                    │
│  └─────────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

## Fluxo de Medicao

1. **Usuario acessa a pagina** → Modelo FaceLandmarker comeca a carregar
2. **Usuario clica "Permitir Camera"** → Camera e iniciada via WebRTC
3. **Preview e exibido** → Usuario posiciona o rosto
4. **Usuario clica "Capturar Foto"** → Frame e capturado do video
5. **Imagem e processada** → FaceLandmarker detecta 478 landmarks faciais
6. **DP e calculado** → Algoritmo calcula distancia entre pupilas
7. **Resultado e exibido** → Usuario pode salvar ou tentar novamente

## Algoritmo de Calculo do DP

### Landmarks Utilizados

O FaceLandmarker retorna 478 pontos faciais. Para o calculo do DP, usamos os landmarks da iris:

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

O calculo usa o **diametro da iris** como referencia para converter coordenadas normalizadas em milimetros:

```
1. Calcular diametro de cada iris (em coordenadas normalizadas):
   leftIrisDiameter = distancia(LEFT_IRIS_LEFT, LEFT_IRIS_RIGHT)
   rightIrisDiameter = distancia(RIGHT_IRIS_LEFT, RIGHT_IRIS_RIGHT)

2. Media dos diametros:
   avgIrisDiameter = (leftIrisDiameter + rightIrisDiameter) / 2

3. Distancia entre centros das pupilas:
   pupilDistance = distancia(LEFT_IRIS_CENTER, RIGHT_IRIS_CENTER)

4. Converter para milimetros:
   dpMm = (pupilDistance / avgIrisDiameter) * AVG_IRIS_DIAMETER_MM
```

### Por que usar o Diametro da Iris?

O diametro da iris humana e relativamente constante entre adultos (10.2-13.0mm, media ~11.7mm), tornando-o uma boa referencia para escala. Isso e mais preciso do que usar a distancia entre os cantos dos olhos, que varia muito mais entre pessoas.

## Calibracao

### Constante de Calibracao

```typescript
const AVG_IRIS_DIAMETER_MM = 12.5;
```

Esta constante representa o diametro medio da iris em milimetros. O valor foi ajustado empiricamente para melhor precisao.

### Como Ajustar a Calibracao

Se as medicoes estiverem consistentemente erradas:

1. **Medicao menor que o real**: Aumentar `AVG_IRIS_DIAMETER_MM`
2. **Medicao maior que o real**: Diminuir `AVG_IRIS_DIAMETER_MM`

Formula para ajuste:
```
novo_valor = valor_atual * (DP_real / DP_medido)
```

Exemplo: Se mediu 60mm mas o real e 64mm:
```
novo_valor = 11.7 * (64 / 60) = 12.48 ≈ 12.5
```

### Range Aceitavel

- Minimo: 10.2mm (iris pequena)
- Maximo: 13.0mm (iris grande)
- Recomendado: 11.7mm - 12.5mm

## Calculo de Confianca

O sistema calcula um indice de confianca (0-100%) baseado em:

1. **Posicao frontal** (-25% se o rosto estiver inclinado)
   - Verificado pela diferenca de Z entre as pupilas
   - `zDiff < 0.03` = olhando de frente

2. **DP no range normal** (-15% se fora do range 50-80mm)
   - DPs muito fora do range podem indicar erro de deteccao

3. **Simetria da deteccao** (-20% se iris assimetricas)
   - Ratio entre diametros das iris deve ser > 0.85
   - Assimetria indica possivel erro na deteccao

## Arquivos Principais

```
src/sections/medidor-pupilar/
├── medidor-pupilar-view.tsx      # Componente principal
├── hooks/
│   ├── use-camera.ts             # Hook de acesso a camera
│   └── use-face-mesh.ts          # Hook de deteccao facial e calculo DP
├── components/
│   ├── camera-feed.tsx           # Preview da camera e captura
│   ├── manual-entry-form.tsx     # Entrada manual de DP
│   ├── measurement-history.tsx   # Historico de medicoes
│   ├── measurement-instructions.tsx # Instrucoes de uso
│   └── measurement-result.tsx    # Exibicao do resultado (legado)
└── MEDIDOR_PUPILAR.md           # Esta documentacao
```

## Dependencias

```json
{
  "@mediapipe/tasks-vision": "latest"
}
```

O modelo e carregado de CDNs:
- WASM: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm`
- Modelo: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`

## Limitacoes Conhecidas

1. **Iluminacao**: Funciona melhor com boa iluminacao frontal
2. **Oculos**: Pode ter dificuldade com oculos de grau ou sol
3. **Distancia**: Usuario deve estar a ~40-60cm da camera
4. **Angulo**: Rosto deve estar de frente para a camera
5. **Resolucao**: Cameras de baixa resolucao podem afetar precisao

## Troubleshooting

### "Erro ao carregar modelo"
- Verificar conexao com internet (modelo e baixado de CDN)
- Verificar se WebGL esta habilitado no navegador

### "Rosto nao detectado"
- Melhorar iluminacao
- Centralizar rosto na tela
- Remover oculos escuros

### "Medicao muito diferente do esperado"
- Verificar se o rosto esta de frente
- Olhar diretamente para a camera
- Manter distancia adequada (~50cm)
- Ajustar calibracao se consistentemente errado

### "Camera nao funciona"
- Verificar permissoes do navegador
- Fechar outros apps que usam camera
- Usar HTTPS (camera requer conexao segura)

## Referencias

- [MediaPipe Face Landmarker](https://developers.google.com/mediapipe/solutions/vision/face_landmarker)
- [Face Mesh Landmarks](https://github.com/google-ai-edge/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png)
- [Iris Diameter Studies](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4075958/) - Estudos sobre diametro da iris humana
