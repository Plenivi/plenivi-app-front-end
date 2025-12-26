import { useUser } from '@clerk/clerk-react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import LinearProgress from '@mui/material/LinearProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { useBeneficios } from 'src/contexts/beneficios-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const mockPedidos = [
  { id: 1, descricao: 'Armação Ray-Ban RB7047', status: 'em_producao', data: '20/12/2024' },
  { id: 2, descricao: 'Lentes Multifocais', status: 'enviado', data: '15/12/2024' },
];

const mockConsultas = [
  {
    id: 1,
    profissional: 'Dr. Carlos Mendes',
    especialidade: 'Oftalmologista',
    data: '28/12/2024',
    hora: '14:30',
  },
];

// ----------------------------------------------------------------------

export function PleniviDashboardView() {
  const { user } = useUser();
  const { beneficioAtual } = useBeneficios();

  const saldoTotal = beneficioAtual?.saldoTotal || 0;
  const saldoUtilizado = beneficioAtual?.saldoUtilizado || 0;
  const saldoDisponivel = beneficioAtual?.saldoDisponivel || 0;
  const percentualUtilizado = saldoTotal > 0 ? (saldoUtilizado / saldoTotal) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_producao':
        return 'warning';
      case 'enviado':
        return 'info';
      case 'entregue':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'em_producao':
        return 'Em Produção';
      case 'enviado':
        return 'Enviado';
      case 'entregue':
        return 'Entregue';
      default:
        return status;
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      {/* Header de Boas-vindas */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Olá, {user?.firstName} {user?.lastName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bem-vindo ao seu painel de benefícios Plenivi
        </Typography>
      </Box>

      {/* Banner de Recomendação IA */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, #3366FF 0%, #1939B7 100%)',
          color: 'white',
          mb: { xs: 3, md: 5 },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Iconify icon="solar:magic-stick-3-bold-duotone" width={28} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Recomendação Inteligente
                </Typography>
                <Chip
                  label="IA"
                  size="small"
                  sx={{ ml: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Descubra armações perfeitas para o seu rosto! Nossa IA analisa suas características
                e preferências para recomendar os óculos ideais para você.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                }}
                href="/catalogo?recomendacao=true"
              >
                Experimentar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Card de Saldo */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #00A89D 0%, #007A72 100%)',
              color: 'white',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Iconify icon="solar:wallet-bold-duotone" width={32} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Seu Saldo
                </Typography>
              </Box>

              <Typography variant="h3" sx={{ mb: 2 }}>
                R$ {saldoDisponivel.toFixed(2).replace('.', ',')}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Utilizado: R$ {saldoUtilizado.toFixed(2).replace('.', ',')}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {percentualUtilizado.toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={percentualUtilizado}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'white',
                    },
                  }}
                />
              </Box>

              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Total do benefício: R$ {saldoTotal.toFixed(2).replace('.', ',')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Acesso Rápido */}
        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Acesso Rápido
          </Typography>
          <Grid container spacing={2}>
                        <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                component="a"
                href="/face-ai"
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                  display: 'block',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <Iconify
                  icon="solar:face-scan-circle-bold-duotone"
                  width={40}
                  sx={{ color: 'info.main', mb: 1 }}
                />
                <Typography variant="subtitle2" color="text.info">
                  Face IA
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                component="a"
                href="/catalogo"
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                  display: 'block',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <Iconify
                  icon="solar:glasses-bold-duotone"
                  width={40}
                  sx={{ color: 'primary.main', mb: 1 }}
                />
                <Typography variant="subtitle2" color="text.primary">
                  Catálogo de Óculos
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                component="a"
                href="/consultas"
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                  display: 'block',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <Iconify
                  icon="solar:calendar-bold-duotone"
                  width={40}
                  sx={{ color: 'info.main', mb: 1 }}
                />
                <Typography variant="subtitle2" color="text.primary">
                  Agendar Consulta
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                component="a"
                href="/pedidos"
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                  display: 'block',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <Iconify
                  icon="solar:box-bold-duotone"
                  width={40}
                  sx={{ color: 'warning.main', mb: 1 }}
                />
                <Typography variant="subtitle2" color="text.primary">
                  Meus Pedidos
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                component="a"
                href="/beneficios"
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                  display: 'block',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <Iconify
                  icon="solar:wallet-bold-duotone"
                  width={40}
                  sx={{ color: 'info.main', mb: 1 }}
                />
                <Typography variant="subtitle2" color="text.primary">
                  Meus Benefícios
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                component="a"
                href="/perfil"
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                  display: 'block',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <Iconify
                  icon="solar:user-bold-duotone"
                  width={40}
                  sx={{ color: 'secondary.main', mb: 1 }}
                />
                <Typography variant="subtitle2" color="text.primary">
                  Meu Perfil
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Pedidos em Andamento */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6">Pedidos em Andamento</Typography>
                <Button size="small" href="/pedidos">
                  Ver todos
                </Button>
              </Box>

              {mockPedidos.length > 0 ? (
                <List disablePadding>
                  {mockPedidos.map((pedido, index) => (
                    <ListItem
                      key={pedido.id}
                      divider={index < mockPedidos.length - 1}
                      sx={{ px: 0 }}
                    >
                      <ListItemIcon>
                        <Iconify icon="solar:box-bold-duotone" width={24} color="primary.main" />
                      </ListItemIcon>
                      <ListItemText
                        primary={pedido.descricao}
                        secondary={`Pedido em ${pedido.data}`}
                      />
                      <Chip
                        label={getStatusLabel(pedido.status)}
                        color={getStatusColor(pedido.status) as any}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Iconify
                    icon="solar:box-line-duotone"
                    width={48}
                    sx={{ color: 'text.disabled', mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Você não tem pedidos em andamento
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Próximas Consultas */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6">Próximas Consultas</Typography>
                <Button size="small" href="/consultas">
                  Agendar
                </Button>
              </Box>

              {mockConsultas.length > 0 ? (
                <List disablePadding>
                  {mockConsultas.map((consulta, index) => (
                    <ListItem
                      key={consulta.id}
                      divider={index < mockConsultas.length - 1}
                      sx={{ px: 0 }}
                    >
                      <ListItemIcon>
                        <Iconify icon="solar:calendar-bold-duotone" width={24} color="info.main" />
                      </ListItemIcon>
                      <ListItemText
                        primary={consulta.profissional}
                        secondary={consulta.especialidade}
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle2">{consulta.data}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {consulta.hora}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Iconify
                    icon="solar:calendar-line-duotone"
                    width={48}
                    sx={{ color: 'text.disabled', mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma consulta agendada
                  </Typography>
                  <Button variant="outlined" size="small" sx={{ mt: 2 }} href="/consultas">
                    Agendar agora
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
