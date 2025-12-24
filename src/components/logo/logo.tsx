import type { LinkProps } from '@mui/material/Link';

import { mergeClasses } from 'minimal-shared/utils';

import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export function Logo({
  sx,
  disabled,
  className,
  href = '/',
  isSingle = true,
  ...other
}: LogoProps) {
  const theme = useTheme();

  const PRIMARY_MAIN = theme.vars.palette.primary.main;

  // Logo Plenivi - Texto
  const singleLogo = (
    <Typography
      variant="h3"
      sx={{
        fontWeight: 700,
        color: PRIMARY_MAIN,
        letterSpacing: -0.5,
      }}
    >
      Plenivi
    </Typography>
  );

  const fullLogo = (
    <Typography
      variant="h3"
      sx={{
        fontWeight: 700,
        color: PRIMARY_MAIN,
        letterSpacing: -0.5,
      }}
    >
      Plenivi
    </Typography>
  );

  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="Logo Plenivi"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          width: 40,
          height: 40,
          ...(!isSingle && { width: 'auto', height: 40 }),
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {isSingle ? singleLogo : fullLogo}
    </LogoRoot>
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
