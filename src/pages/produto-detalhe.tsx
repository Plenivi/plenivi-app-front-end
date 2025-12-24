import { CONFIG } from 'src/config-global';

import { ProdutoDetalheView } from 'src/sections/catalogo';

// ----------------------------------------------------------------------

export default function ProdutoDetalhePage() {
  return (
    <>
      <title>{`Detalhes do Produto - ${CONFIG.appName}`}</title>
      <meta name="description" content="Detalhes da armação selecionada" />

      <ProdutoDetalheView />
    </>
  );
}
