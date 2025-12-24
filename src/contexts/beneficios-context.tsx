import { useMemo, useState, useContext, useCallback, createContext } from 'react';

// ----------------------------------------------------------------------

export interface Beneficio {
  id: string;
  empresa: string;
  cnpj: string;
  logo: string;
  saldoTotal: number;
  saldoUtilizado: number;
  saldoDisponivel: number;
  status: 'ativo' | 'inativo';
  dataAtivacao: string;
}

interface BeneficiosContextType {
  beneficios: Beneficio[];
  beneficioAtual: Beneficio | null;
  selecionarBeneficio: (id: string) => void;
  adicionarBeneficio: (codigo: string) => Promise<boolean>;
  removerBeneficio: (id: string) => void;
}

// ----------------------------------------------------------------------

// Mock data inicial
const mockBeneficios: Beneficio[] = [
  {
    id: 'tech-solutions',
    empresa: 'Tech Solutions Ltda',
    cnpj: '12.345.678/0001-90',
    logo: '/assets/icons/workspaces/logo-1.webp',
    saldoTotal: 500.0,
    saldoUtilizado: 150.0,
    saldoDisponivel: 350.0,
    status: 'ativo',
    dataAtivacao: '15/01/2024',
  },
  {
    id: 'bradesco',
    empresa: 'Bradesco S.A.',
    cnpj: '60.746.948/0001-12',
    logo: '/assets/icons/workspaces/logo-2.webp',
    saldoTotal: 750.0,
    saldoUtilizado: 200.0,
    saldoDisponivel: 550.0,
    status: 'inativo',
    dataAtivacao: '20/03/2024',
  },
];

// Mock de empresas que podem ser adicionadas pelo código
const empresasDisponiveis: Record<string, Omit<Beneficio, 'id'>> = {
  '1357': {
    empresa: 'Tech Solutions Ltda',
    cnpj: '12.345.678/0001-90',
    logo: '/assets/icons/workspaces/logo-1.webp',
    saldoTotal: 500.0,
    saldoUtilizado: 0,
    saldoDisponivel: 500.0,
    status: 'ativo',
    dataAtivacao: new Date().toLocaleDateString('pt-BR'),
  },
  '2468': {
    empresa: 'Bradesco S.A.',
    cnpj: '60.746.948/0001-12',
    logo: '/assets/icons/workspaces/logo-2.webp',
    saldoTotal: 750.0,
    saldoUtilizado: 0,
    saldoDisponivel: 750.0,
    status: 'ativo',
    dataAtivacao: new Date().toLocaleDateString('pt-BR'),
  },
  '3690': {
    empresa: 'Itaú Unibanco',
    cnpj: '60.701.190/0001-04',
    logo: '/assets/icons/workspaces/logo-3.webp',
    saldoTotal: 600.0,
    saldoUtilizado: 0,
    saldoDisponivel: 600.0,
    status: 'ativo',
    dataAtivacao: new Date().toLocaleDateString('pt-BR'),
  },
};

// ----------------------------------------------------------------------

const BeneficiosContext = createContext<BeneficiosContextType | null>(null);

// ----------------------------------------------------------------------

export function BeneficiosProvider({ children }: { children: React.ReactNode }) {
  const [beneficios, setBeneficios] = useState<Beneficio[]>(mockBeneficios);
  const [beneficioAtualId, setBeneficioAtualId] = useState<string>(
    mockBeneficios[0]?.id || ''
  );

  const beneficioAtual = useMemo(
    () => beneficios.find((b) => b.id === beneficioAtualId) || null,
    [beneficios, beneficioAtualId]
  );

  const selecionarBeneficio = useCallback((id: string) => {
    setBeneficioAtualId(id);
  }, []);

  const adicionarBeneficio = useCallback(async (codigo: string): Promise<boolean> => {
    // Simula uma chamada à API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const empresaData = empresasDisponiveis[codigo];
    if (!empresaData) {
      return false;
    }

    // Verifica se já existe
    let jaExiste = false;
    setBeneficios((prev) => {
      jaExiste = prev.some((b) => b.cnpj === empresaData.cnpj);
      if (jaExiste) return prev;

      const novoBeneficio: Beneficio = {
        id: `beneficio-${Date.now()}`,
        ...empresaData,
      };

      setBeneficioAtualId(novoBeneficio.id);
      return [...prev, novoBeneficio];
    });

    return !jaExiste;
  }, []);

  const removerBeneficio = useCallback((id: string) => {
    setBeneficios((prev) => {
      const novosB = prev.filter((b) => b.id !== id);
      setBeneficioAtualId((currentId) =>
        currentId === id ? (novosB[0]?.id || '') : currentId
      );
      return novosB;
    });
  }, []);

  const value = useMemo(
    () => ({
      beneficios,
      beneficioAtual,
      selecionarBeneficio,
      adicionarBeneficio,
      removerBeneficio,
    }),
    [beneficios, beneficioAtual, selecionarBeneficio, adicionarBeneficio, removerBeneficio]
  );

  return (
    <BeneficiosContext.Provider value={value}>
      {children}
    </BeneficiosContext.Provider>
  );
}

// ----------------------------------------------------------------------

export function useBeneficios() {
  const context = useContext(BeneficiosContext);

  if (!context) {
    throw new Error('useBeneficios must be used within a BeneficiosProvider');
  }

  return context;
}
