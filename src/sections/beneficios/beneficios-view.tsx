import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { useBeneficios } from 'src/contexts/beneficios-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function BeneficiosView() {
  const { beneficios, beneficioAtual, selecionarBeneficio, adicionarBeneficio } = useBeneficios();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [codigoEmpresa, setCodigoEmpresa] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setCodigoEmpresa('');
    setError(null);
    setSuccess(false);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCodigoEmpresa('');
    setError(null);
    setSuccess(false);
  };

  const handleAdicionarBeneficio = async () => {
    setIsSubmitting(true);
    setError(null);

    const resultado = await adicionarBeneficio(codigoEmpresa);

    if (resultado) {
      setSuccess(true);
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } else {
      setError('Código inválido ou benefício já cadastrado. Verifique o código e tente novamente.');
    }

    setIsSubmitting(false);
  };

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Meus Benefícios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie seus benefícios ativos de diferentes empresas
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Iconify icon="solar:add-circle-bold" />}
          onClick={handleOpenDialog}
        >
          Adicionar Benefício
        </Button>
      </Box>

      {/* Lista de Benefícios */}
      {beneficios.length > 0 ? (
        <Grid container spacing={3}>
          {beneficios.map((beneficio) => {
            const isInativo = beneficio.status === 'inativo';
            const isSelected = beneficio.id === beneficioAtual?.id;

            return (
              <Grid key={beneficio.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={{
                    cursor: isInativo ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    border: isSelected ? 2 : 1,
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    opacity: isInativo ? 0.6 : 1,
                    '&:hover': isInativo
                      ? {}
                      : {
                          boxShadow: 4,
                          transform: 'translateY(-4px)',
                        },
                  }}
                  onClick={() => !isInativo && selecionarBeneficio(beneficio.id)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        component="img"
                        src={beneficio.logo}
                        alt={beneficio.empresa}
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          filter: isInativo ? 'grayscale(100%)' : 'none',
                        }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {beneficio.empresa}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          CNPJ: {beneficio.cnpj}
                        </Typography>
                      </Box>
                      <Chip
                        label={beneficio.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        color={beneficio.status === 'ativo' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: isInativo ? 'grey.200' : 'primary.lighter',
                        mb: 2,
                      }}
                    >
                      <Typography variant="caption" color={isInativo ? 'text.secondary' : 'primary.dark'}>
                        Saldo Disponível
                      </Typography>
                      <Typography variant="h4" color={isInativo ? 'text.disabled' : 'primary.main'}>
                        R$ {beneficio.saldoDisponivel.toFixed(2).replace('.', ',')}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Utilizado
                        </Typography>
                        <Typography variant="body2">
                          R$ {beneficio.saldoUtilizado.toFixed(2).replace('.', ',')}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">
                          Total
                        </Typography>
                        <Typography variant="body2">
                          R$ {beneficio.saldoTotal.toFixed(2).replace('.', ',')}
                        </Typography>
                    </Box>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                    Ativado em {beneficio.dataAtivacao}
                  </Typography>

                  {isSelected && !isInativo && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                      <Iconify icon="solar:check-circle-bold" width={16} color="primary.main" />
                      <Typography variant="caption" color="primary.main">
                        Benefício selecionado
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            );
          })}
        </Grid>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Iconify
              icon="solar:wallet-line-duotone"
              width={80}
              sx={{ color: 'text.disabled', mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Você ainda não possui benefícios ativos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Adicione um benefício usando o código fornecido pela sua empresa
            </Typography>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:add-circle-bold" />}
              onClick={handleOpenDialog}
            >
              Ativar Benefício
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Adicionar Benefício */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Novo Benefício</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Insira o código fornecido pelo RH da sua empresa para ativar um novo benefício.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Benefício adicionado com sucesso!
              </Alert>
            )}

            <TextField
              fullWidth
              label="Código da Empresa"
              placeholder="Digite o código fornecido pelo RH"
              value={codigoEmpresa}
              onChange={(e) => setCodigoEmpresa(e.target.value)}
              disabled={isSubmitting || success}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption">
                <strong>Códigos de teste:</strong> 1357, 2468, 3690
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleAdicionarBeneficio}
            disabled={!codigoEmpresa || isSubmitting || success}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Ativar Benefício'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
