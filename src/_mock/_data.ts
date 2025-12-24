import { _id, _times } from './_mock';

// ----------------------------------------------------------------------

export const _langs = [
  {
    value: 'pt-br',
    label: 'Português',
    icon: '/assets/icons/flags/ic-flag-br.svg',
  },
];

// ----------------------------------------------------------------------

export const _notifications = [
  {
    id: _id(1),
    title: 'Seu pedido foi confirmado',
    description: 'Ray-Ban RB7047 - aguardando envio',
    avatarUrl: null,
    type: 'order-placed',
    postedAt: _times(1),
    isUnRead: true,
  },
  {
    id: _id(2),
    title: 'Consulta agendada',
    description: 'Dr. Carlos Mendes - 28/12 às 14:00',
    avatarUrl: '/assets/images/avatar/avatar-2.webp',
    type: 'friend-interactive',
    postedAt: _times(2),
    isUnRead: true,
  },
  {
    id: _id(3),
    title: 'Saldo creditado',
    description: 'R$ 500,00 adicionados ao seu benefício',
    avatarUrl: null,
    type: 'chat-message',
    postedAt: _times(3),
    isUnRead: false,
  },
  {
    id: _id(4),
    title: 'Pedido enviado',
    description: 'Código de rastreio: BR123456789',
    avatarUrl: null,
    type: 'order-shipped',
    postedAt: _times(4),
    isUnRead: false,
  },
];
