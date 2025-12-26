import { CONFIG } from 'src/config-global';

import { FaceTesteView } from 'src/sections/face-teste';

// ----------------------------------------------------------------------

export default function FaceTestePage() {
  return (
    <>
      <title>{`Face Landmarks Teste - ${CONFIG.appName}`}</title>
      <meta name="description" content="Teste de deteccao de landmarks faciais em tempo real" />

      <FaceTesteView />
    </>
  );
}
