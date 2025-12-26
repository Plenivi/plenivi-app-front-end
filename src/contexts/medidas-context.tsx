import type { FaceShapeType, FaceMeasurements } from 'src/sections/medidor-pupilar/utils/face-analysis';

import { useMemo, useState, useEffect, useContext, useCallback, createContext } from 'react';

// ----------------------------------------------------------------------

const STORAGE_KEY = 'plenivi-face-medidas';

// ----------------------------------------------------------------------

export interface FaceShapeData {
  classification: FaceShapeType;
  confidence: number;
  measurements: FaceMeasurements;
}

export interface Medida {
  id: string;
  dpValue: number; // DP em mm (ex: 62.5)
  confidence: number; // 0-100
  metodo: 'camera' | 'manual';
  dataRegistro: string; // ISO date string
  // Novos campos para Face IA
  faceShape?: FaceShapeData;
  validSamples?: number; // Número de amostras válidas usadas
}

interface MedidasContextType {
  medidas: Medida[];
  medidaAtual: Medida | null;
  adicionarMedida: (medida: Omit<Medida, 'id' | 'dataRegistro'>) => void;
  removerMedida: (id: string) => void;
  selecionarMedida: (id: string) => void;
  limparMedidas: () => void;
}

// ----------------------------------------------------------------------

/**
 * Carrega as medidas do localStorage.
 * Retorna array vazio se não houver dados ou em caso de erro.
 */
function loadFromStorage(): Medida[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('[MedidasContext] Erro ao carregar do localStorage:', error);
  }
  return [];
}

/**
 * Salva as medidas no localStorage.
 */
function saveToStorage(medidas: Medida[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medidas));
  } catch (error) {
    console.error('[MedidasContext] Erro ao salvar no localStorage:', error);
  }
}

// ----------------------------------------------------------------------

const MedidasContext = createContext<MedidasContextType | null>(null);

// ----------------------------------------------------------------------

export function MedidasProvider({ children }: { children: React.ReactNode }) {
  // Inicializa com dados do localStorage
  const [medidas, setMedidas] = useState<Medida[]>(() => loadFromStorage());
  const [medidaAtualId, setMedidaAtualId] = useState<string>(() => {
    const saved = loadFromStorage();
    return saved[0]?.id || '';
  });

  // Persistir no localStorage sempre que medidas mudar
  useEffect(() => {
    saveToStorage(medidas);
  }, [medidas]);

  const medidaAtual = useMemo(
    () => medidas.find((m) => m.id === medidaAtualId) || medidas[0] || null,
    [medidas, medidaAtualId]
  );

  const adicionarMedida = useCallback(
    (novaMedida: Omit<Medida, 'id' | 'dataRegistro'>) => {
      const medida: Medida = {
        ...novaMedida,
        id: `medida-${Date.now()}`,
        dataRegistro: new Date().toISOString(),
      };

      setMedidas((prev) => [medida, ...prev]);
      setMedidaAtualId(medida.id);
    },
    []
  );

  const removerMedida = useCallback((id: string) => {
    setMedidas((prev) => {
      const novasMedidas = prev.filter((m) => m.id !== id);
      setMedidaAtualId((currentId) =>
        currentId === id ? novasMedidas[0]?.id || '' : currentId
      );
      return novasMedidas;
    });
  }, []);

  const selecionarMedida = useCallback((id: string) => {
    setMedidaAtualId(id);
  }, []);

  const limparMedidas = useCallback(() => {
    setMedidas([]);
    setMedidaAtualId('');
  }, []);

  const value = useMemo(
    () => ({
      medidas,
      medidaAtual,
      adicionarMedida,
      removerMedida,
      selecionarMedida,
      limparMedidas,
    }),
    [medidas, medidaAtual, adicionarMedida, removerMedida, selecionarMedida, limparMedidas]
  );

  return <MedidasContext.Provider value={value}>{children}</MedidasContext.Provider>;
}

// ----------------------------------------------------------------------

export function useMedidas() {
  const context = useContext(MedidasContext);

  if (!context) {
    throw new Error('useMedidas must be used within a MedidasProvider');
  }

  return context;
}
