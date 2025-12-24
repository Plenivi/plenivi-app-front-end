import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { AuthGuard, GuestGuard } from 'src/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

// Páginas principais
export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const CatalogoPage = lazy(() => import('src/pages/catalogo'));
export const ProdutoDetalhePage = lazy(() => import('src/pages/produto-detalhe'));
export const ConsultasPage = lazy(() => import('src/pages/consultas'));
export const PedidosPage = lazy(() => import('src/pages/pedidos'));
export const PerfilPage = lazy(() => import('src/pages/perfil'));
export const BeneficiosPage = lazy(() => import('src/pages/beneficios'));

// Páginas de autenticação
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const OnboardingPage = lazy(() => import('src/pages/onboarding'));

// Páginas de erro
export const Page404 = lazy(() => import('src/pages/page-not-found'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  // Rotas protegidas (com DashboardLayout + AuthGuard)
  {
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'catalogo', element: <CatalogoPage /> },
      { path: 'catalogo/:id', element: <ProdutoDetalhePage /> },
      { path: 'consultas', element: <ConsultasPage /> },
      { path: 'pedidos', element: <PedidosPage /> },
      { path: 'perfil', element: <PerfilPage /> },
      { path: 'beneficios', element: <BeneficiosPage /> },
    ],
  },
  // Rotas de autenticação (com GuestGuard)
  {
    path: 'sign-in',
    element: (
      <GuestGuard>
        <AuthLayout>
          <SignInPage />
        </AuthLayout>
      </GuestGuard>
    ),
  },
  {
    path: 'onboarding',
    element: (
      <AuthLayout>
        <OnboardingPage />
      </AuthLayout>
    ),
  },
  // Rotas de erro
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];
