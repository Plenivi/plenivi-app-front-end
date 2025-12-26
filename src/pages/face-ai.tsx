import { CONFIG } from 'src/config-global';

import { FaceAiView } from 'src/sections/face-ai';

// ----------------------------------------------------------------------

export default function FaceAiPage() {
  return (
    <>
      <title>{`Face IA - ${CONFIG.appName}`}</title>
      <meta name="description" content="Análise seu rosto com IA para medir distância pupilar e descobrir o formato ideal de armacoes" />

      <FaceAiView />
    </>
  );
}
