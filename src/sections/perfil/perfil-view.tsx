import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import FormControlLabel from '@mui/material/FormControlLabel';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';

import { DashboardContent } from 'src/layouts/dashboard';
import { useBeneficios } from 'src/contexts/beneficios-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Mock data
const mockUsuario = {
  nome: 'João Silva',
  email: 'joao.silva@email.com.br',
  cpf: '***.***.***-90',
  telefone: '(11) 99999-9999',
  dataNascimento: '15/03/1985',
  matricula: 'TS-2024-001',
  avatar: '/assets/images/avatars/avatar-1.webp',
};

const mockEnderecos = [
  {
    id: 1,
    tipo: 'Principal',
    endereco: 'Rua das Flores, 123',
    complemento: 'Apto 45',
    bairro: 'Jardim Primavera',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    principal: true,
  },
  {
    id: 2,
    tipo: 'Trabalho',
    endereco: 'Av. Paulista, 1000',
    complemento: '10º andar',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01310-100',
    principal: false,
  },
];

const mockReceitas = [
  {
    id: 1,
    data: '20/11/2024',
    profissional: 'Dr. Carlos Mendes',
    clinica: 'Oftalmocenter',
    validade: '20/11/2025',
    arquivo: 'receita_20241120.pdf',
  },
  {
    id: 2,
    data: '15/06/2023',
    profissional: 'Dra. Ana Paula',
    clinica: 'Vision Care',
    validade: '15/06/2024',
    arquivo: 'receita_20230615.pdf',
    expirada: true,
  },
];

const mockNotificacoes = {
  email: true,
  sms: false,
  push: true,
  promocoes: true,
  lembretes: true,
  atualizacoesPedido: true,
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`perfil-tabpanel-${index}`}
      aria-labelledby={`perfil-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// ----------------------------------------------------------------------

export function PerfilView() {
  const { beneficios, beneficioAtual } = useBeneficios();
  const [tabValue, setTabValue] = useState(0);
  const [editando, setEditando] = useState(false);
  const [dadosUsuario, setDadosUsuario] = useState(mockUsuario);
  const [notificacoes, setNotificacoes] = useState(mockNotificacoes);

  const handleSalvarDados = () => {
    // TODO: Implementar salvamento via API
    setEditando(false);
  };

  const handleNotificacaoChange = (campo: keyof typeof notificacoes) => {
    setNotificacoes((prev) => ({ ...prev, [campo]: !prev[campo] }));
  };

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Meu Perfil
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie suas informações pessoais e preferências
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Card do Usuário */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Avatar
              src={dadosUsuario.avatar}
              sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h6">{dadosUsuario.nome}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {dadosUsuario.email}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Meus Benefícios ({beneficios.filter((b) => b.status === 'ativo').length})
              </Typography>
              {beneficios
                .filter((b) => b.status === 'ativo')
                .map((beneficio) => (
                  <Box
                    key={beneficio.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: beneficio.id === beneficioAtual?.id ? 'primary.lighter' : 'grey.100',
                      border: beneficio.id === beneficioAtual?.id ? 1 : 0,
                      borderColor: 'primary.main',
                    }}
                  >
                    <Box
                      component="img"
                      src={beneficio.logo}
                      alt={beneficio.empresa}
                      sx={{ width: 24, height: 24, borderRadius: '50%' }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {beneficio.empresa}
                      </Typography>
                    </Box>
                    <Chip
                      label="Ativo"
                      color="success"
                      size="small"
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                  </Box>
                ))}
              <Button
                variant="text"
                size="small"
                startIcon={<Iconify icon="solar:add-circle-bold" width={16} />}
                href="/beneficios"
                sx={{ mt: 1 }}
              >
                Gerenciar benefícios
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Iconify icon="solar:card-bold" width={20} color="text.secondary" />
                <Typography variant="body2" color="text.secondary">
                  Matrícula: {dadosUsuario.matricula}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:calendar-bold" width={20} color="text.secondary" />
                <Typography variant="body2" color="text.secondary">
                  Membro desde Janeiro 2024
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Conteúdo Principal */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
            >
              <Tab label="Dados Pessoais" icon={<Iconify icon="solar:user-bold" width={20} />} iconPosition="start" />
              <Tab label="Endereços" icon={<Iconify icon="solar:map-point-bold" width={20} />} iconPosition="start" />
              <Tab label="Receitas" icon={<Iconify icon="solar:document-bold" width={20} />} iconPosition="start" />
              <Tab label="Notificações" icon={<Iconify icon="solar:bell-bold" width={20} />} iconPosition="start" />
            </Tabs>

            {/* Tab: Dados Pessoais */}
            <TabPanel value={tabValue} index={0}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">Informações Pessoais</Typography>
                  {!editando ? (
                    <Button
                      variant="outlined"
                      startIcon={<Iconify icon="solar:pen-bold" />}
                      onClick={() => setEditando(true)}
                    >
                      Editar
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="outlined" onClick={() => setEditando(false)}>
                        Cancelar
                      </Button>
                      <Button variant="contained" onClick={handleSalvarDados}>
                        Salvar
                      </Button>
                    </Box>
                  )}
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Nome Completo"
                      value={dadosUsuario.nome}
                      onChange={(e) => setDadosUsuario({ ...dadosUsuario, nome: e.target.value })}
                      disabled={!editando}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="E-mail"
                      value={dadosUsuario.email}
                      disabled
                      slotProps={{ inputLabel: { shrink: true } }}
                      helperText="E-mail não pode ser alterado"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="CPF"
                      value={dadosUsuario.cpf}
                      disabled
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Telefone"
                      value={dadosUsuario.telefone}
                      onChange={(e) => setDadosUsuario({ ...dadosUsuario, telefone: e.target.value })}
                      disabled={!editando}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Data de Nascimento"
                      value={dadosUsuario.dataNascimento}
                      disabled
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" sx={{ mb: 2 }}>Segurança</Typography>
                <Button variant="outlined" startIcon={<Iconify icon="solar:lock-bold" />}>
                  Alterar Senha
                </Button>
              </CardContent>
            </TabPanel>

            {/* Tab: Endereços */}
            <TabPanel value={tabValue} index={1}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">Endereços de Entrega</Typography>
                  <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />}>
                    Adicionar
                  </Button>
                </Box>

                <List>
                  {mockEnderecos.map((endereco, index) => (
                    <ListItem
                      key={endereco.id}
                      sx={{
                        border: 1,
                        borderColor: endereco.principal ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        mb: 2,
                        bgcolor: endereco.principal ? 'primary.lighter' : 'transparent',
                      }}
                    >
                      <ListItemIcon>
                        <Iconify
                          icon={endereco.principal ? 'solar:home-bold' : 'solar:buildings-bold'}
                          width={24}
                          color={endereco.principal ? 'primary.main' : 'text.secondary'}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {endereco.tipo}
                            {endereco.principal && (
                              <Chip label="Principal" size="small" color="primary" />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            {endereco.endereco}, {endereco.complemento}
                            <br />
                            {endereco.bairro} - {endereco.cidade}/{endereco.estado}
                            <br />
                            CEP: {endereco.cep}
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton title="Editar">
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                        <IconButton title="Remover" color="error">
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </TabPanel>

            {/* Tab: Receitas */}
            <TabPanel value={tabValue} index={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">Histórico de Receitas Médicas</Typography>
                  <Button variant="contained" startIcon={<Iconify icon="solar:upload-bold" />}>
                    Enviar Nova Receita
                  </Button>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                  Mantenha suas receitas atualizadas para garantir a compra de óculos com o grau correto.
                </Alert>

                <Grid container spacing={2}>
                  {mockReceitas.map((receita) => (
                    <Grid key={receita.id} size={{ xs: 12, sm: 6 }}>
                      <Card
                        variant="outlined"
                        sx={{
                          opacity: receita.expirada ? 0.6 : 1,
                          position: 'relative',
                        }}
                      >
                        {receita.expirada && (
                          <Chip
                            label="Expirada"
                            color="error"
                            size="small"
                            sx={{ position: 'absolute', top: 8, right: 8 }}
                          />
                        )}
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Iconify
                              icon="solar:document-bold"
                              width={40}
                              color={receita.expirada ? 'error.main' : 'primary.main'}
                            />
                            <Box>
                              <Typography variant="subtitle2">
                                Receita de {receita.data}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Válida até {receita.validade}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {receita.profissional}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {receita.clinica}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <Button size="small" startIcon={<Iconify icon="solar:eye-bold" />}>
                              Visualizar
                            </Button>
                            <Button size="small" startIcon={<Iconify icon="solar:download-bold" />}>
                              Baixar
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </TabPanel>

            {/* Tab: Notificações */}
            <TabPanel value={tabValue} index={3}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Preferências de Notificação</Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Canais de Comunicação
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Iconify icon="solar:letter-bold" width={24} />
                    </ListItemIcon>
                    <ListItemText
                      primary="E-mail"
                      secondary="Receber notificações por e-mail"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificacoes.email}
                          onChange={() => handleNotificacaoChange('email')}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Iconify icon="solar:phone-bold" width={24} />
                    </ListItemIcon>
                    <ListItemText
                      primary="SMS"
                      secondary="Receber notificações por SMS"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificacoes.sms}
                          onChange={() => handleNotificacaoChange('sms')}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Iconify icon="solar:bell-bold" width={24} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Push"
                      secondary="Receber notificações push no navegador"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificacoes.push}
                          onChange={() => handleNotificacaoChange('push')}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                </List>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Tipos de Notificação
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Iconify icon="solar:tag-bold" width={24} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Promoções e Ofertas"
                      secondary="Receber informações sobre descontos e promoções"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificacoes.promocoes}
                          onChange={() => handleNotificacaoChange('promocoes')}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Iconify icon="solar:calendar-bold" width={24} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Lembretes de Consultas"
                      secondary="Receber lembretes sobre consultas agendadas"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificacoes.lembretes}
                          onChange={() => handleNotificacaoChange('lembretes')}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Iconify icon="solar:box-bold" width={24} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Atualizações de Pedidos"
                      secondary="Receber atualizações sobre status dos pedidos"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificacoes.atualizacoesPedido}
                          onChange={() => handleNotificacaoChange('atualizacoesPedido')}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                </List>
              </CardContent>
            </TabPanel>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
