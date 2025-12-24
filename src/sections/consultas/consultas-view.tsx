import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Mock data
const mockConsultasAgendadas = [
  {
    id: 1,
    profissional: 'Dr. Carlos Mendes',
    especialidade: 'Oftalmologista',
    clinica: 'Oftalmocenter',
    endereco: 'Rua Augusta, 1500 - Consolação, São Paulo/SP',
    data: '28/12/2024',
    hora: '14:30',
    status: 'confirmada',
  },
];

const mockConsultasPassadas = [
  {
    id: 2,
    profissional: 'Dra. Ana Paula',
    especialidade: 'Oftalmologista',
    clinica: 'Vision Care',
    endereco: 'Av. Paulista, 2000 - Bela Vista, São Paulo/SP',
    data: '15/11/2024',
    hora: '10:00',
    status: 'realizada',
  },
  {
    id: 3,
    profissional: 'Dr. Roberto Lima',
    especialidade: 'Oftalmologista',
    clinica: 'Clínica dos Olhos',
    endereco: 'Rua Oscar Freire, 800 - Jardins, São Paulo/SP',
    data: '20/06/2024',
    hora: '16:00',
    status: 'realizada',
  },
];

const mockProfissionais = [
  {
    id: 1,
    nome: 'Dr. Carlos Mendes',
    especialidade: 'Oftalmologista',
    clinica: 'Oftalmocenter',
    endereco: 'Rua Augusta, 1500 - Consolação',
    avaliacao: 4.8,
    proximaData: '28/12/2024',
    horarios: ['09:00', '10:00', '14:00', '15:00', '16:00'],
  },
  {
    id: 2,
    nome: 'Dra. Ana Paula',
    especialidade: 'Oftalmologista',
    clinica: 'Vision Care',
    endereco: 'Av. Paulista, 2000 - Bela Vista',
    avaliacao: 4.9,
    proximaData: '02/01/2025',
    horarios: ['08:00', '09:00', '10:00', '11:00'],
  },
  {
    id: 3,
    nome: 'Dr. Roberto Lima',
    especialidade: 'Oftalmologista',
    clinica: 'Clínica dos Olhos',
    endereco: 'Rua Oscar Freire, 800 - Jardins',
    avaliacao: 4.7,
    proximaData: '03/01/2025',
    horarios: ['14:00', '15:00', '16:00', '17:00'],
  },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

// ----------------------------------------------------------------------

export function ConsultasView() {
  const [tabValue, setTabValue] = useState(0);
  const [agendarDialogOpen, setAgendarDialogOpen] = useState(false);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState<number | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [horarioSelecionado, setHorarioSelecionado] = useState('');
  const [regiao, setRegiao] = useState('');

  const handleAgendar = () => {
    // TODO: Implementar agendamento via API
    setAgendarDialogOpen(false);
    setProfissionalSelecionado(null);
    setDataSelecionada('');
    setHorarioSelecionado('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'success';
      case 'pendente':
        return 'warning';
      case 'cancelada':
        return 'error';
      case 'realizada':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'Confirmada';
      case 'pendente':
        return 'Pendente';
      case 'cancelada':
        return 'Cancelada';
      case 'realizada':
        return 'Realizada';
      default:
        return status;
    }
  };

  const renderConsultaCard = (consulta: typeof mockConsultasAgendadas[0], showActions = false) => (
    <Card key={consulta.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                bgcolor: 'primary.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:user-rounded-bold" width={32} color="primary.main" />
            </Box>
            <Box>
              <Typography variant="subtitle1">{consulta.profissional}</Typography>
              <Typography variant="body2" color="text.secondary">
                {consulta.especialidade}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {consulta.clinica}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={getStatusLabel(consulta.status)}
            color={getStatusColor(consulta.status) as any}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="solar:calendar-bold" width={20} color="text.secondary" />
            <Typography variant="body2">{consulta.data}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="solar:clock-circle-bold" width={20} color="text.secondary" />
            <Typography variant="body2">{consulta.hora}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Iconify icon="solar:map-point-bold" width={20} color="text.secondary" />
          <Typography variant="body2" color="text.secondary">
            {consulta.endereco}
          </Typography>
        </Box>

        {showActions && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" size="small" startIcon={<Iconify icon="solar:calendar-bold" />}>
              Reagendar
            </Button>
            <Button variant="outlined" size="small" color="error" startIcon={<Iconify icon="solar:close-circle-bold" />}>
              Cancelar
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Minhas Consultas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Agende e gerencie suas consultas oftalmológicas
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Iconify icon="solar:add-circle-bold" />}
          onClick={() => setAgendarDialogOpen(true)}
        >
          Agendar Consulta
        </Button>
      </Box>

      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        <Tab label="Próximas Consultas" />
        <Tab label="Histórico" />
        <Tab label="Encontrar Profissional" />
      </Tabs>

      {/* Tab: Próximas Consultas */}
      <TabPanel value={tabValue} index={0}>
        {mockConsultasAgendadas.length > 0 ? (
          mockConsultasAgendadas.map((consulta) => renderConsultaCard(consulta, true))
        ) : (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Iconify icon="solar:calendar-line-duotone" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Nenhuma consulta agendada
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Agende uma consulta com um de nossos profissionais credenciados
              </Typography>
              <Button variant="contained" onClick={() => setAgendarDialogOpen(true)}>
                Agendar Agora
              </Button>
            </CardContent>
          </Card>
        )}
      </TabPanel>

      {/* Tab: Histórico */}
      <TabPanel value={tabValue} index={1}>
        {mockConsultasPassadas.length > 0 ? (
          mockConsultasPassadas.map((consulta) => renderConsultaCard(consulta, false))
        ) : (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body1" color="text.secondary">
                Você ainda não realizou nenhuma consulta
              </Typography>
            </CardContent>
          </Card>
        )}
      </TabPanel>

      {/* Tab: Encontrar Profissional */}
      <TabPanel value={tabValue} index={2}>
        <Card sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Região</InputLabel>
                <Select
                  value={regiao}
                  label="Região"
                  onChange={(e) => setRegiao(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="centro">Centro</MenuItem>
                  <MenuItem value="zona-sul">Zona Sul</MenuItem>
                  <MenuItem value="zona-norte">Zona Norte</MenuItem>
                  <MenuItem value="zona-leste">Zona Leste</MenuItem>
                  <MenuItem value="zona-oeste">Zona Oeste</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Data desejada"
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Button variant="contained" fullWidth startIcon={<Iconify icon="solar:magnifer-bold" />}>
                Buscar
              </Button>
            </Grid>
          </Grid>
        </Card>

        <Grid container spacing={3}>
          {mockProfissionais.map((profissional) => (
            <Grid key={profissional.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        bgcolor: 'primary.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Iconify icon="solar:user-rounded-bold" width={32} color="primary.main" />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1">{profissional.nome}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {profissional.especialidade}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Iconify icon="solar:star-bold" width={16} color="warning.main" />
                        <Typography variant="body2">{profissional.avaliacao}</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {profissional.clinica}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Iconify icon="solar:map-point-bold" width={16} color="text.secondary" />
                    <Typography variant="caption" color="text.secondary">
                      {profissional.endereco}
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Próxima data disponível: <strong>{profissional.proximaData}</strong>
                  </Typography>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => {
                      setProfissionalSelecionado(profissional.id);
                      setAgendarDialogOpen(true);
                    }}
                  >
                    Agendar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Dialog de Agendamento */}
      <Dialog
        open={agendarDialogOpen}
        onClose={() => setAgendarDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Agendar Consulta</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Profissional</InputLabel>
              <Select
                value={profissionalSelecionado || ''}
                label="Profissional"
                onChange={(e) => setProfissionalSelecionado(e.target.value as number)}
              >
                {mockProfissionais.map((prof) => (
                  <MenuItem key={prof.id} value={prof.id}>
                    {prof.nome} - {prof.clinica}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Data"
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            {profissionalSelecionado && (
              <FormControl fullWidth>
                <InputLabel>Horário</InputLabel>
                <Select
                  value={horarioSelecionado}
                  label="Horário"
                  onChange={(e) => setHorarioSelecionado(e.target.value)}
                >
                  {mockProfissionais
                    .find((p) => p.id === profissionalSelecionado)
                    ?.horarios.map((horario) => (
                      <MenuItem key={horario} value={horario}>
                        {horario}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAgendarDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleAgendar}
            disabled={!profissionalSelecionado || !dataSelecionada || !horarioSelecionado}
          >
            Confirmar Agendamento
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
