import { CONFIG } from 'src/config-global';

import { PerfilView } from 'src/sections/perfil';

// ----------------------------------------------------------------------

export default function PerfilPage() {
  return (
    <>
      <title>{`Meu Perfil - ${CONFIG.appName}`}</title>
      <meta name="description" content="Gerencie suas informações pessoais no Plenivi" />

      <PerfilView />
    </>
  );
}
