import { CONFIG } from 'src/config-global';

import { MedidorPupilarView } from 'src/sections/medidor-pupilar';

// ----------------------------------------------------------------------

export default function MedidorPupilarPage() {
  return (
    <>
      <title>{`Medidor Pupilar - ${CONFIG.appName}`}</title>
      <meta name="description" content="Meça sua distância pupilar usando a câmera do seu dispositivo" />

      <MedidorPupilarView />
    </>
  );
}
