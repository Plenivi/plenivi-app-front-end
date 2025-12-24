import { CONFIG } from 'src/config-global';

import { BeneficiosView } from 'src/sections/beneficios';

// ----------------------------------------------------------------------

export default function BeneficiosPage() {
  return (
    <>
      <title>{`Meus Benefícios - ${CONFIG.appName}`}</title>
      <meta name="description" content="Gerencie seus benefícios ativos no Plenivi" />

      <BeneficiosView />
    </>
  );
}
