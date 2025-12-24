import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Step from '@mui/material/Step';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Mock data
const mockPedidos = [
  {
    id: 'PED-2024-001',
    data: '20/12/2024',
    status: 'em_producao',
    statusStep: 2,
    total: 450.0,
    itens: [
      {
        nome: 'Armação Ray-Ban RB7047',
        preco: 450.0,
        imagem: '/assets/images/product/oculos.jpg',
      },
    ],
    lentes: {
      tipo: 'Multifocal',
      tratamentos: ['Antirreflexo', 'Fotocromática'],
      grau: {
        od: { esf: -2.0, cil: -0.5, eixo: 180 },
        oe: { esf: -1.75, cil: -0.25, eixo: 175 },
      },
    },
    entrega: {
      previsao: '10/01/2025',
      endereco: 'Rua das Flores, 123, Apto 45 - Jardim Primavera, São Paulo/SP',
    },
    historico: [
      { data: '20/12/2024 10:30', evento: 'Pedido realizado' },
      { data: '20/12/2024 14:00', evento: 'Pagamento confirmado' },
      { data: '21/12/2024 09:00', evento: 'Lentes em produção' },
    ],
  },
  {
    id: 'PED-2024-002',
    data: '15/12/2024',
    status: 'enviado',
    statusStep: 3,
    total: 890.0,
    itens: [
      {
        nome: 'Armação Prada VPR 17M',
        preco: 890.0,
        imagem: '/assets/images/product/oculos.jpg',
      },
    ],
    lentes: {
      tipo: 'Visão Simples',
      tratamentos: ['Antirreflexo', 'Blue Light'],
      grau: {
        od: { esf: -1.5, cil: 0, eixo: 0 },
        oe: { esf: -1.25, cil: 0, eixo: 0 },
      },
    },
    entrega: {
      previsao: '28/12/2024',
      endereco: 'Rua das Flores, 123, Apto 45 - Jardim Primavera, São Paulo/SP',
      rastreio: 'BR123456789XX',
    },
    historico: [
      { data: '15/12/2024 11:00', evento: 'Pedido realizado' },
      { data: '15/12/2024 15:00', evento: 'Pagamento confirmado' },
      { data: '16/12/2024 08:00', evento: 'Lentes em produção' },
      { data: '20/12/2024 16:00', evento: 'Enviado para entrega' },
    ],
  },
];

const mockPedidosFinalizados = [
  {
    id: 'PED-2024-000',
    data: '01/10/2024',
    status: 'entregue',
    statusStep: 4,
    total: 520.0,
    itens: [
      {
        nome: 'Armação Oakley Crosslink',
        preco: 520.0,
        imagem: '/assets/images/product/oculos.jpg',
      },
    ],
    entrega: {
      data: '15/10/2024',
      endereco: 'Rua das Flores, 123, Apto 45 - Jardim Primavera, São Paulo/SP',
    },
  },
];

const statusSteps = ['Pedido Realizado', 'Pagamento Confirmado', 'Em Produção', 'Enviado', 'Entregue'];

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

export function PedidosView() {
  const [tabValue, setTabValue] = useState(0);
  const [expandedPedido, setExpandedPedido] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aguardando_pagamento':
        return 'warning';
      case 'pago':
      case 'em_producao':
        return 'info';
      case 'enviado':
        return 'primary';
      case 'entregue':
        return 'success';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aguardando_pagamento':
        return 'Aguardando Pagamento';
      case 'pago':
        return 'Pago';
      case 'em_producao':
        return 'Em Produção';
      case 'enviado':
        return 'Enviado';
      case 'entregue':
        return 'Entregue';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const renderPedidoCard = (pedido: typeof mockPedidos[0]) => {
    const isExpanded = expandedPedido === pedido.id;

    return (
      <Card key={pedido.id} sx={{ mb: 2 }}>
        <CardContent>
          {/* Header do Pedido */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              cursor: 'pointer',
            }}
            onClick={() => setExpandedPedido(isExpanded ? null : pedido.id)}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle1">{pedido.id}</Typography>
                <Chip
                  label={getStatusLabel(pedido.status)}
                  color={getStatusColor(pedido.status) as any}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Pedido em {pedido.data}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6">
                R$ {pedido.total.toFixed(2).replace('.', ',')}
              </Typography>
              <Iconify
                icon={isExpanded ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'}
                width={20}
              />
            </Box>
          </Box>

          {/* Itens do Pedido */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            {pedido.itens.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                }}
              >
                <Box
                  component="img"
                  src={item.imagem}
                  alt={item.nome}
                  sx={{ width: 60, height: 60, objectFit: 'contain' }}
                />
                <Typography variant="body2">{item.nome}</Typography>
              </Box>
            ))}
          </Box>

          {/* Detalhes Expandidos */}
          <Collapse in={isExpanded}>
            <Divider sx={{ my: 3 }} />

            {/* Stepper de Status */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Status do Pedido
              </Typography>
              <Stepper activeStep={pedido.statusStep} alternativeLabel>
                {statusSteps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {/* Informações de Entrega */}
            {pedido.entrega && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Informações de Entrega
                </Typography>
                <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Iconify icon="solar:map-point-bold" width={20} color="primary.main" />
                    <Typography variant="body2">{pedido.entrega.endereco}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="solar:calendar-bold" width={20} color="primary.main" />
                    <Typography variant="body2">
                      Previsão: <strong>{pedido.entrega.previsao}</strong>
                    </Typography>
                  </Box>
                  {'rastreio' in pedido.entrega && pedido.entrega.rastreio && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Iconify icon="solar:box-bold" width={20} color="primary.main" />
                      <Typography variant="body2">
                        Rastreio: <strong>{pedido.entrega.rastreio}</strong>
                      </Typography>
                      <Button size="small">Rastrear</Button>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Informações das Lentes */}
            {pedido.lentes && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Especificações das Lentes
                </Typography>
                <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Tipo:</strong> {pedido.lentes.tipo}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Tratamentos:</strong> {pedido.lentes.tratamentos.join(', ')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Grau:</strong>
                  </Typography>
                  <Typography variant="caption" component="div" sx={{ ml: 2 }}>
                    OD: Esf {pedido.lentes.grau.od.esf} | Cil {pedido.lentes.grau.od.cil} | Eixo {pedido.lentes.grau.od.eixo}°
                  </Typography>
                  <Typography variant="caption" component="div" sx={{ ml: 2 }}>
                    OE: Esf {pedido.lentes.grau.oe.esf} | Cil {pedido.lentes.grau.oe.cil} | Eixo {pedido.lentes.grau.oe.eixo}°
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Histórico do Pedido */}
            {pedido.historico && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Histórico do Pedido
                </Typography>
                <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                  {pedido.historico.map((evento, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        gap: 2,
                        mb: index < pedido.historico.length - 1 ? 1 : 0,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120 }}>
                        {evento.data}
                      </Typography>
                      <Typography variant="body2">{evento.evento}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Ações */}
            <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
              <Button variant="outlined" startIcon={<Iconify icon="solar:document-bold" />}>
                Nota Fiscal
              </Button>
              <Button variant="outlined" startIcon={<Iconify icon="solar:chat-line-bold" />}>
                Suporte
              </Button>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Meus Pedidos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Acompanhe seus pedidos e entregas
        </Typography>
      </Box>

      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Em Andamento
              <Chip label={mockPedidos.length} size="small" color="primary" />
            </Box>
          }
        />
        <Tab label="Finalizados" />
      </Tabs>

      {/* Tab: Em Andamento */}
      <TabPanel value={tabValue} index={0}>
        {mockPedidos.length > 0 ? (
          mockPedidos.map((pedido) => renderPedidoCard(pedido))
        ) : (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Iconify icon="solar:box-line-duotone" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Nenhum pedido em andamento
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Explore nosso catálogo e encontre o óculos perfeito para você
              </Typography>
              <Button variant="contained" href="/catalogo">
                Ver Catálogo
              </Button>
            </CardContent>
          </Card>
        )}
      </TabPanel>

      {/* Tab: Finalizados */}
      <TabPanel value={tabValue} index={1}>
        {mockPedidosFinalizados.length > 0 ? (
          mockPedidosFinalizados.map((pedido) => (
            <Card key={pedido.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle1">{pedido.id}</Typography>
                      <Chip
                        label={getStatusLabel(pedido.status)}
                        color={getStatusColor(pedido.status) as any}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Pedido em {pedido.data} | Entregue em {pedido.entrega.data}
                    </Typography>
                  </Box>
                  <Typography variant="h6">
                    R$ {pedido.total.toFixed(2).replace('.', ',')}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  {pedido.itens.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1,
                        bgcolor: 'grey.100',
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        component="img"
                        src={item.imagem}
                        alt={item.nome}
                        sx={{ width: 60, height: 60, objectFit: 'contain' }}
                      />
                      <Typography variant="body2">{item.nome}</Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button variant="outlined" size="small" startIcon={<Iconify icon="solar:refresh-bold" />}>
                    Comprar Novamente
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<Iconify icon="solar:document-bold" />}>
                    Nota Fiscal
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body1" color="text.secondary">
                Você ainda não finalizou nenhum pedido
              </Typography>
            </CardContent>
          </Card>
        )}
      </TabPanel>
    </DashboardContent>
  );
}
