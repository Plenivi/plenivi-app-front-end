import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;
const iconify = (name: string) => <Iconify icon={name} width={24} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData: NavItem[] = [
  {
    title: 'Início',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Catálogo de Óculos',
    path: '/catalogo',
    icon: iconify('solar:glasses-bold-duotone'),
    info: (
      <Label color="info" variant="inverted">
        Novo
      </Label>
    ),
  },
  {
    title: 'Minhas Consultas',
    path: '/consultas',
    icon: iconify('solar:calendar-bold-duotone'),
  },
  {
    title: 'Meus Pedidos',
    path: '/pedidos',
    icon: iconify('solar:box-bold-duotone'),
  },
  {
    title: 'Face IA',
    path: '/face-ai',
    icon: iconify('solar:face-scan-circle-bold-duotone'),
    info: (
      <Label color="secondary" variant="inverted">
        IA
      </Label>
    ),
  },
  {
    title: 'Meus Benefícios',
    path: '/beneficios',
    icon: iconify('solar:wallet-bold-duotone'),
  },
  {
    title: 'Meu Perfil',
    path: '/perfil',
    icon: icon('ic-user'),
  },
];
