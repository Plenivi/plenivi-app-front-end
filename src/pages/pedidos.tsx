import { CONFIG } from 'src/config-global';

import { PedidosView } from 'src/sections/pedidos';

// ----------------------------------------------------------------------

export default function PedidosPage() {
  return (
    <>
      <title>{`Meus Pedidos - ${CONFIG.appName}`}</title>
      <meta name="description" content="Acompanhe seus pedidos de óculos" />

      <PedidosView />
    </>
  );
}
