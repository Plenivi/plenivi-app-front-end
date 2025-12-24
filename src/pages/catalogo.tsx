import { CONFIG } from 'src/config-global';

import { CatalogoView } from 'src/sections/catalogo';

// ----------------------------------------------------------------------

export default function CatalogoPage() {
  return (
    <>
      <title>{`Catálogo de Óculos - ${CONFIG.appName}`}</title>
      <meta name="description" content="Encontre a armação perfeita no catálogo Plenivi" />

      <CatalogoView />
    </>
  );
}
