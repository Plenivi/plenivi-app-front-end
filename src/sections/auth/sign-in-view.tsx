import { useState, useCallback } from 'react';
import { useSignIn } from '@clerk/clerk-react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = useCallback(async () => {
    if (!isLoaded || !signIn) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/');
      } else {
        console.log('Sign in status:', result.status);
        setError('Autenticação incompleta. Tente novamente.');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      const errorCode = err.errors?.[0]?.code;

      // Verificar se é erro de conta não encontrada
      if (errorCode === 'form_identifier_not_found') {
        setError('Não consegui encontrar a sua conta.');
      } else if (errorCode === 'form_password_incorrect') {
        setError('Senha incorreta. Tente novamente.');
      } else {
        const errorMessage =
          err.errors?.[0]?.longMessage ||
          err.errors?.[0]?.message ||
          'Erro ao fazer login. Verifique suas credenciais.';
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [isLoaded, signIn, email, password, setActive, router]);

  const renderForm = (
    <Box
      component="form"
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
      }}
      onSubmit={(e) => {
        e.preventDefault();
        handleSignIn();
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        name="email"
        label="E-mail corporativo"
        placeholder="seu.email@empresa.com.br"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isSubmitting}
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <Link variant="body2" color="inherit" sx={{ mb: 1.5 }} href="/recuperar-senha">
        Esqueceu sua senha?
      </Link>

      <TextField
        fullWidth
        name="password"
        label="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isSubmitting}
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        color="primary"
        variant="contained"
        disabled={isSubmitting || !email || !password}
      >
        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h4" sx={{ color: 'primary.main' }}>
          Bem-vindo!
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
          }}
        >
          Sua plataforma de benefícios de visão digital.
          <br />
          Acesse com seu e-mail corporativo.
        </Typography>
      </Box>

      {renderForm}

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Primeiro acesso?{' '}
          <Link href="/onboarding" variant="subtitle2" sx={{ color: 'primary.main' }}>
            Ative seu benefício
          </Link>
        </Typography>
      </Box>

      <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', display: 'block', textAlign: 'center' }}
        >
          <Iconify
            icon="solar:shield-check-bold"
            width={16}
            sx={{ mr: 0.5, verticalAlign: 'middle' }}
          />
          Ambiente seguro. Seus dados estão protegidos.
        </Typography>
      </Box>
    </>
  );
}
