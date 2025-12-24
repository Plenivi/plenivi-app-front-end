import { useAuth } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router';

import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

// ----------------------------------------------------------------------

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  // Exibir loading enquanto verifica autenticação
  if (!isLoaded) {
    return (
      <Box
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <LinearProgress sx={{ width: 1, maxWidth: 320 }} />
      </Box>
    );
  }

  // Redirecionar para login se não autenticado
  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
