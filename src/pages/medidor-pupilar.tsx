import { CONFIG } from 'src/config-global';

import { MedidorPupilarView } from 'src/sections/medidor-pupilar';

// ----------------------------------------------------------------------

export default function MedidorPupilarPage() {
  return (
    <>
      <title>{`Face IA - ${CONFIG.appName}`}</title>
      <meta name="description" content="Analise seu rosto com IA para medir distancia pupilar e descobrir o formato ideal de armacoes" />

      <MedidorPupilarView />
    </>
  );
}
