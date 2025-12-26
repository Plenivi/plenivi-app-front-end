import { CONFIG } from 'src/config-global';

import { MedidorPupilarView } from 'src/sections/medidor-pupilar';

// ----------------------------------------------------------------------

export default function MedidorPupilarPage() {
  return (
    <>
      <title>{`Medidor Pupilar - ${CONFIG.appName}`}</title>
      <meta name="description" content="Meca sua distancia pupilar usando a camera do seu dispositivo" />

      <MedidorPupilarView />
    </>
  );
}
