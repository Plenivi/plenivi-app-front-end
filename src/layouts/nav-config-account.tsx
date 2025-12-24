import { Iconify } from 'src/components/iconify';

import type { AccountPopoverProps } from './components/account-popover';

// ----------------------------------------------------------------------

export const _account: AccountPopoverProps['data'] = [
  {
    label: 'Início',
    href: '/',
    icon: <Iconify width={22} icon="solar:home-angle-bold-duotone" />,
  },
  {
    label: 'Meu Perfil',
    href: '/perfil',
    icon: <Iconify width={22} icon="solar:user-bold-duotone" />,
  },
  {
    label: 'Meus Pedidos',
    href: '/pedidos',
    icon: <Iconify width={22} icon="solar:box-bold-duotone" />,
  },
];
