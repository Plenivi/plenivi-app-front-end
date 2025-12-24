import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ImageList from '@mui/material/ImageList';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import ImageListItem from '@mui/material/ImageListItem';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Mock data - Em produção, viria de uma API baseado no ID da URL
const mockProduto = {
  id: 1,
  nome: 'Ray-Ban RB7047',
  marca: 'Ray-Ban',
  preco: 450.0,
  precoOriginal: 550.0,
  descricao: 'Armação elegante e versátil, perfeita para o dia a dia. Design clássico Ray-Ban com materiais de alta qualidade.',
  imagens: [
    '/assets/images/product/oculos.jpg',
    '/assets/images/product/oculos.jpg',
    '/assets/images/product/oculos.jpg',
    '/assets/images/product/oculos.jpg',
  ],
  categoria: 'Masculino',
  material: 'Acetato',
  formato: 'Retangular',
  cor: 'Preto',
  larguraPonte: '18mm',
  larguraLente: '54mm',
  comprimentoHaste: '145mm',
  garantia: '2 anos',
  disponivel: true,
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
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function ProdutoDetalheView() {
  const [imagemSelecionada, setImagemSelecionada] = useState(0);
  const [tabValue, setTabValue] = useState(0);

  return (
    <DashboardContent maxWidth="xl">
      {/* Breadcrumb */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button
          startIcon={<Iconify icon="solar:arrow-left-linear" />}
          href="/catalogo"
          color="inherit"
        >
          Voltar ao catálogo
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Imagens */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <Box
              sx={{
                height: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100',
                position: 'relative',
              }}
            >
              <Box
                component="img"
                src={mockProduto.imagens[imagemSelecionada]}
                alt={mockProduto.nome}
                sx={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }}
              />

              {/* Botão Experimentar Virtualmente */}
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:camera-bold" />}
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                }}
                disabled
              >
                Experimentar Virtualmente (em breve)
              </Button>
            </Box>

            {/* Miniaturas */}
            <ImageList cols={4} gap={8} sx={{ p: 2, m: 0 }}>
              {mockProduto.imagens.map((img, index) => (
                <ImageListItem
                  key={index}
                  sx={{
                    cursor: 'pointer',
                    border: imagemSelecionada === index ? '2px solid' : '2px solid transparent',
                    borderColor: imagemSelecionada === index ? 'primary.main' : 'transparent',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                  onClick={() => setImagemSelecionada(index)}
                >
                  <Box
                    component="img"
                    src={img}
                    alt={`${mockProduto.nome} - ${index + 1}`}
                    sx={{ width: '100%', height: 80, objectFit: 'contain', bgcolor: 'grey.100' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Card>
        </Grid>

        {/* Informações do Produto */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              {mockProduto.marca}
            </Typography>
            <Typography variant="h4" sx={{ mb: 2 }}>
              {mockProduto.nome}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Chip label={mockProduto.categoria} />
              <Chip label={mockProduto.material} variant="outlined" />
              <Chip label={mockProduto.formato} variant="outlined" />
            </Box>

            {/* Preço */}
            <Card sx={{ bgcolor: 'primary.lighter', mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                  {mockProduto.preco < mockProduto.precoOriginal && (
                    <Typography
                      variant="h6"
                      sx={{ textDecoration: 'line-through', color: 'text.disabled' }}
                    >
                      R$ {mockProduto.precoOriginal.toFixed(2).replace('.', ',')}
                    </Typography>
                  )}
                  <Typography variant="h3" color="primary.dark">
                    R$ {mockProduto.preco.toFixed(2).replace('.', ',')}
                  </Typography>
                </Box>
                <Typography variant="body2" color="primary.dark" sx={{ mt: 1 }}>
                  <Iconify icon="solar:wallet-bold" width={16} sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                  Use seu saldo Plenivi para comprar
                </Typography>
              </CardContent>
            </Card>

            {/* Descrição */}
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {mockProduto.descricao}
            </Typography>

            {/* Disponibilidade */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Iconify
                icon={mockProduto.disponivel ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                width={20}
                sx={{ color: mockProduto.disponivel ? 'success.main' : 'error.main' }}
              />
              <Typography variant="body2">
                {mockProduto.disponivel ? 'Disponível em estoque' : 'Produto indisponível'}
              </Typography>
            </Box>

            {/* Botões de Ação */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<Iconify icon="solar:cart-plus-bold" />}
                disabled={!mockProduto.disponivel}
              >
                Adicionar ao Carrinho
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<Iconify icon="solar:heart-bold" />}
              >
                Favoritar
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Tabs de Informações */}
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Especificações" />
              <Tab label="Medidas" />
              <Tab label="Garantia" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">Material</Typography>
                  <Typography variant="body1">{mockProduto.material}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">Formato</Typography>
                  <Typography variant="body1">{mockProduto.formato}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">Cor</Typography>
                  <Typography variant="body1">{mockProduto.cor}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">Categoria</Typography>
                  <Typography variant="body1">{mockProduto.categoria}</Typography>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={2}>
                <Grid size={4}>
                  <Typography variant="body2" color="text.secondary">Largura da Ponte</Typography>
                  <Typography variant="body1">{mockProduto.larguraPonte}</Typography>
                </Grid>
                <Grid size={4}>
                  <Typography variant="body2" color="text.secondary">Largura da Lente</Typography>
                  <Typography variant="body1">{mockProduto.larguraLente}</Typography>
                </Grid>
                <Grid size={4}>
                  <Typography variant="body2" color="text.secondary">Comprimento da Haste</Typography>
                  <Typography variant="body1">{mockProduto.comprimentoHaste}</Typography>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Iconify icon="solar:shield-check-bold" width={32} color="success.main" />
                <Box>
                  <Typography variant="subtitle1">Garantia de {mockProduto.garantia}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cobertura contra defeitos de fabricação
                  </Typography>
                </Box>
              </Box>
            </TabPanel>
          </Box>
        </Grid>
      </Grid>

      {/* Banner Recomendação */}
      <Card sx={{ mt: 4, bgcolor: 'grey.100' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Iconify icon="solar:magic-stick-3-bold-duotone" width={40} color="secondary.main" />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1">
                Quer saber se esta armação combina com você?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use nossa recomendação com IA para descobrir armações perfeitas para seu rosto
              </Typography>
            </Box>
            <Button variant="contained" color="secondary">
              Experimentar IA
            </Button>
          </Box>
        </CardContent>
      </Card>
    </DashboardContent>
  );
}
