import { useMemo, useState, useContext, useCallback, createContext } from 'react';

// ----------------------------------------------------------------------

export interface Medida {
  id: string;
  dpValue: number; // DP em mm (ex: 62.5)
  confidence: number; // 0-100
  metodo: 'camera' | 'manual';
  dataRegistro: string; // ISO date string
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

// Mock data inicial
const mockMedidas: Medida[] = [
  {
    id: 'medida-1',
    dpValue: 63.5,
    confidence: 92,
    metodo: 'camera',
    dataRegistro: '2024-11-15T10:30:00.000Z',
  },
];

// ----------------------------------------------------------------------

const MedidasContext = createContext<MedidasContextType | null>(null);

// ----------------------------------------------------------------------

export function MedidasProvider({ children }: { children: React.ReactNode }) {
  const [medidas, setMedidas] = useState<Medida[]>(mockMedidas);
  const [medidaAtualId, setMedidaAtualId] = useState<string>(mockMedidas[0]?.id || '');

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
