import { CONFIG } from 'src/config-global';

import { PleniviDashboardView } from 'src/sections/overview/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Início - ${CONFIG.appName}`}</title>
      <meta name="description" content="Painel de benefícios de visão Plenivi" />
      <meta name="keywords" content="plenivi,beneficios,visao,oculos,saude" />

      <PleniviDashboardView />
    </>
  );
}
