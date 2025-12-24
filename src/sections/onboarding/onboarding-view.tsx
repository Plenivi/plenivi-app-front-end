import { useRef, useState, useEffect } from 'react';
import { useClerk, useSignUp } from '@clerk/clerk-react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Funções de máscara
const maskCPF = (value: string) => value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');

const maskPhone = (value: string) => value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');

export function OnboardingView() {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();
  const { signOut, session } = useClerk();
  const hasSignedOut = useRef(false);

  // Limpar sessão existente apenas na montagem inicial
  useEffect(() => {
    if (session && !hasSignedOut.current) {
      hasSignedOut.current = true;
      signOut();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activeStep, setActiveStep] = useState(0);
  const [cpf, setCpf] = useState('');
  const [codigoEmpresa, setCodigoEmpresa] = useState('');
  const [isEligible, setIsEligible] = useState<boolean | null>(null);

  // Campos para cadastro
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [senha, setSenha] = useState('');

  // Estados de UI
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    setError(null);

    if (activeStep === 0) {
      // Step 0: Criar conta no Clerk
      if (!isLoaded || !signUp) return;

      setIsSubmitting(true);
      try {
        const result = await signUp.create({
          firstName: nome,
          lastName: sobrenome,
          emailAddress: email,
          password: senha,
        });

        console.log('SignUp result:', result.status, result);

        // Ativar sessão diretamente
        if (result.status === 'complete' && result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
          setActiveStep((prev) => prev + 1);
        } else {
          setError(
            'Conta criada, mas a verificação de email está habilitada no Clerk. ' +
            'Desabilite em: Dashboard > Email, Phone, Username > Email address > Require verification.'
          );
        }
      } catch (err: any) {
        console.error('Sign up error:', err);
        const errorMessage =
          err.errors?.[0]?.longMessage ||
          err.errors?.[0]?.message ||
          'Erro ao criar conta. Tente novamente.';
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    } else if (activeStep === 1) {
      // Step 1: Verificar elegibilidade
      // Para teste: código "1357" = elegível, qualquer outro = não elegível
      const eligible = codigoEmpresa === '1357';
      setIsEligible(eligible);
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFinish = () => {
    router.push('/');
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        // Step 0: Dados Pessoais + Criar conta no Clerk
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} gutterBottom>
              Crie sua conta
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 1, sm: 2 } }}>
              Preencha seus dados para criar sua conta no Plenivi.
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              fullWidth
              label="Nome"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={isSubmitting}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              label="Sobrenome"
              placeholder="Seu sobrenome"
              value={sobrenome}
              onChange={(e) => setSobrenome(e.target.value)}
              disabled={isSubmitting}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              label="E-mail"
              type="email"
              placeholder="seu.email@empresa.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              label="Celular"
              placeholder="(00) 00000-0000"
              value={celular}
              onChange={(e) => setCelular(maskPhone(e.target.value))}
              disabled={isSubmitting}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              label="Criar Senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={isSubmitting}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        );

      case 1:
        // Step 1: Verificação de elegibilidade
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} gutterBottom>
              Verifique sua elegibilidade
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 1, sm: 2 } }}>
              Informe seus dados para verificar se você tem direito ao benefício Plenivi.
            </Typography>
            <TextField
              fullWidth
              label="CPF"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              label="Código da Empresa"
              placeholder="Informe o código fornecido pelo RH"
              value={codigoEmpresa}
              onChange={(e) => setCodigoEmpresa(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        );

      case 2:
        // Step 2: Confirmação (elegível ou não)
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 2, sm: 3 },
              textAlign: 'center',
              py: { xs: 2, sm: 4 },
            }}
          >
            {isEligible ? (
              <>
                <Iconify
                  icon="solar:check-circle-bold"
                  width={80}
                  sx={{ color: 'success.main', mx: 'auto', width: { xs: 60, sm: 80 } }}
                />
                <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                  Parabéns! Você é elegível!
                </Typography>

                <Card sx={{ bgcolor: 'primary.lighter', border: 'none', textAlign: 'left' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ color: 'primary.darker' }}>
                      Seu Benefício Plenivi
                    </Typography>
                    <Typography variant="h4" sx={{ color: 'primary.main', my: 1 }}>
                      R$ 500,00
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'primary.dark' }}>
                      Saldo disponível para compra de óculos e consultas
                    </Typography>
                  </CardContent>
                </Card>

                <Typography variant="body1" color="text.secondary">
                  Sua conta foi criada com sucesso. Agora você pode aproveitar todos os benefícios
                  do Plenivi.
                </Typography>

                <Card sx={{ bgcolor: 'grey.100', textAlign: 'left' }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      O que você pode fazer agora:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify icon="solar:glasses-bold-duotone" width={20} color="primary.main" />
                        <Typography variant="body2">Explorar o catálogo de óculos</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify
                          icon="solar:calendar-bold-duotone"
                          width={20}
                          color="primary.main"
                        />
                        <Typography variant="body2">Agendar consulta com oftalmologista</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify icon="solar:star-bold-duotone" width={20} color="primary.main" />
                        <Typography variant="body2">Receber recomendações personalizadas</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Iconify
                  icon="solar:sad-circle-bold"
                  width={80}
                  sx={{ color: 'error.main', mx: 'auto', width: { xs: 60, sm: 80 } }}
                />
                <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                  Você não possui benefícios ativos
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Não encontramos nenhum benefício Plenivi associado aos seus dados.
                </Typography>
                <Alert severity="info" sx={{ textAlign: 'left' }}>
                  <Typography variant="body2">
                    Entre em contato com o <strong>RH da sua empresa</strong> para verificar sua
                    elegibilidade ao benefício Plenivi ou para obter o código correto da empresa.
                  </Typography>
                </Alert>
              </>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', px: { xs: 2, sm: 0 } }}>
      <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 } }}>
        <Typography
          variant="h4"
          sx={{
            color: 'primary.main',
            fontSize: { xs: '1.5rem', sm: '2rem' },
          }}
        >
          Ative seu Benefício
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Em poucos passos você terá acesso completo ao Plenivi
        </Typography>
      </Box>

      <Box>
        {renderStepContent(activeStep)}

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            gap: 2,
            mt: 4,
          }}
        >
          <Button
            disabled={isSubmitting}
            onClick={activeStep === 0 ? () => router.push('/sign-in') : handleBack}
            variant="outlined"
            fullWidth
            sx={{ order: { xs: 2, sm: 1 } }}
          >
            Voltar
          </Button>
          {activeStep === 2 ? (
            isEligible ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleFinish}
                fullWidth
                sx={{ order: { xs: 1, sm: 2 } }}
              >
                Começar a usar
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleFinish}
                fullWidth
                sx={{ order: { xs: 1, sm: 2 } }}
              >
                Ir para o início
              </Button>
            )
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={isSubmitting}
              fullWidth
              sx={{ order: { xs: 1, sm: 2 } }}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Continuar'}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
