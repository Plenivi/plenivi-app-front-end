import { CONFIG } from 'src/config-global';

import { MedidorPupilarView } from 'src/sections/medidor-pupilar';

// ----------------------------------------------------------------------

export default function MedidorPupilarPage() {
  return (
    <>
      <title>{`Face IA - ${CONFIG.appName}`}</title>
      <meta name="description" content="Análise seu rosto com IA para medir distância pupilar e descobrir o formato ideal de armacoes" />

      <MedidorPupilarView />
    </>
  );
}
