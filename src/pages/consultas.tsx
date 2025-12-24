import { CONFIG } from 'src/config-global';

import { ConsultasView } from 'src/sections/consultas';

// ----------------------------------------------------------------------

export default function ConsultasPage() {
  return (
    <>
      <title>{`Minhas Consultas - ${CONFIG.appName}`}</title>
      <meta name="description" content="Agende e gerencie suas consultas oftalmológicas" />

      <ConsultasView />
    </>
  );
}
