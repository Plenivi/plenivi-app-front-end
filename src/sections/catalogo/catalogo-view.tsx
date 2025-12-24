import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Drawer from '@mui/material/Drawer';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import CardMedia from '@mui/material/CardMedia';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import useMediaQuery from '@mui/material/useMediaQuery';
import InputAdornment from '@mui/material/InputAdornment';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Mock data - Em produção, viria de uma API
const mockArmacoes = [
  {
    id: 1,
    nome: 'Ray-Ban RB7047',
    marca: 'Ray-Ban',
    preco: 450.0,
    precoOriginal: 550.0,
    imagem: '/assets/images/product/oculos.jpg',
    categoria: 'Masculino',
    material: 'Acetato',
    formato: 'Retangular',
    cor: 'Preto',
    destaque: true,
  },
  {
    id: 2,
    nome: 'Oakley Crosslink',
    marca: 'Oakley',
    preco: 520.0,
    precoOriginal: 520.0,
    imagem: '/assets/images/product/oculos.jpg',
    categoria: 'Masculino',
    material: 'Metal',
    formato: 'Retangular',
    cor: 'Prata',
    destaque: false,
  },
  {
    id: 3,
    nome: 'Prada VPR 17M',
    marca: 'Prada',
    preco: 890.0,
    precoOriginal: 1100.0,
    imagem: '/assets/images/product/oculos.jpg',
    categoria: 'Feminino',
    material: 'Acetato',
    formato: 'Gatinho',
    cor: 'Tartaruga',
    destaque: true,
  },
  {
    id: 4,
    nome: 'Chilli Beans Sport',
    marca: 'Chilli Beans',
    preco: 280.0,
    precoOriginal: 280.0,
    imagem: '/assets/images/product/oculos.jpg',
    categoria: 'Unissex',
    material: 'TR90',
    formato: 'Esportivo',
    cor: 'Azul',
    destaque: false,
  },
  {
    id: 5,
    nome: 'Versace VE3186',
    marca: 'Versace',
    preco: 750.0,
    precoOriginal: 950.0,
    imagem: '/assets/images/product/oculos.jpg',
    categoria: 'Feminino',
    material: 'Acetato',
    formato: 'Quadrado',
    cor: 'Vinho',
    destaque: true,
  },
  {
    id: 6,
    nome: 'Armani Exchange AX3048',
    marca: 'Armani Exchange',
    preco: 420.0,
    precoOriginal: 420.0,
    imagem: '/assets/images/product/oculos.jpg',
    categoria: 'Masculino',
    material: 'Metal',
    formato: 'Aviador',
    cor: 'Dourado',
    destaque: false,
  },
];

const marcas = ['Ray-Ban', 'Oakley', 'Prada', 'Chilli Beans', 'Versace', 'Armani Exchange'];
const categorias = ['Masculino', 'Feminino', 'Unissex'];
const materiais = ['Acetato', 'Metal', 'TR90', 'Titânio'];
const formatos = ['Retangular', 'Redondo', 'Aviador', 'Gatinho', 'Quadrado', 'Esportivo'];

// ----------------------------------------------------------------------

export function CatalogoView() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [busca, setBusca] = useState('');
  const [marcaSelecionada, setMarcaSelecionada] = useState<string[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [materialSelecionado, setMaterialSelecionado] = useState('');
  const [formatoSelecionado, setFormatoSelecionado] = useState('');
  const [faixaPreco, setFaixaPreco] = useState<number[]>([0, 1000]);
  const [ordenacao, setOrdenacao] = useState('relevancia');
  const [pagina, setPagina] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const itensPorPagina = 6;

  const armacoesFiltradas = useMemo(() => {
    let resultado = [...mockArmacoes];

    // Filtro de busca
    if (busca) {
      resultado = resultado.filter(
        (a) =>
          a.nome.toLowerCase().includes(busca.toLowerCase()) ||
          a.marca.toLowerCase().includes(busca.toLowerCase())
      );
    }

    // Filtro de marca
    if (marcaSelecionada.length > 0) {
      resultado = resultado.filter((a) => marcaSelecionada.includes(a.marca));
    }

    // Filtro de categoria
    if (categoriaSelecionada) {
      resultado = resultado.filter((a) => a.categoria === categoriaSelecionada);
    }

    // Filtro de material
    if (materialSelecionado) {
      resultado = resultado.filter((a) => a.material === materialSelecionado);
    }

    // Filtro de formato
    if (formatoSelecionado) {
      resultado = resultado.filter((a) => a.formato === formatoSelecionado);
    }

    // Filtro de preço
    resultado = resultado.filter(
      (a) => a.preco >= faixaPreco[0] && a.preco <= faixaPreco[1]
    );

    // Ordenação
    switch (ordenacao) {
      case 'preco_menor':
        resultado.sort((a, b) => a.preco - b.preco);
        break;
      case 'preco_maior':
        resultado.sort((a, b) => b.preco - a.preco);
        break;
      case 'nome':
        resultado.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      default:
        resultado.sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));
    }

    return resultado;
  }, [busca, marcaSelecionada, categoriaSelecionada, materialSelecionado, formatoSelecionado, faixaPreco, ordenacao]);

  const totalPaginas = Math.ceil(armacoesFiltradas.length / itensPorPagina);
  const armacoesExibidas = armacoesFiltradas.slice(
    (pagina - 1) * itensPorPagina,
    pagina * itensPorPagina
  );

  const limparFiltros = () => {
    setBusca('');
    setMarcaSelecionada([]);
    setCategoriaSelecionada('');
    setMaterialSelecionado('');
    setFormatoSelecionado('');
    setFaixaPreco([0, 1000]);
    setPagina(1);
  };

  const renderFiltros = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6">Filtros</Typography>

      <Autocomplete
        multiple
        options={marcas}
        value={marcaSelecionada}
        onChange={(_, newValue) => {
          setMarcaSelecionada(newValue);
          setPagina(1);
        }}
        renderInput={(params) => <TextField {...params} label="Marca" placeholder="Selecione" />}
        size="small"
      />

      <FormControl size="small" fullWidth>
        <InputLabel>Categoria</InputLabel>
        <Select
          value={categoriaSelecionada}
          label="Categoria"
          onChange={(e) => {
            setCategoriaSelecionada(e.target.value);
            setPagina(1);
          }}
        >
          <MenuItem value="">Todas</MenuItem>
          {categorias.map((cat) => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel>Material</InputLabel>
        <Select
          value={materialSelecionado}
          label="Material"
          onChange={(e) => {
            setMaterialSelecionado(e.target.value);
            setPagina(1);
          }}
        >
          <MenuItem value="">Todos</MenuItem>
          {materiais.map((mat) => (
            <MenuItem key={mat} value={mat}>{mat}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel>Formato</InputLabel>
        <Select
          value={formatoSelecionado}
          label="Formato"
          onChange={(e) => {
            setFormatoSelecionado(e.target.value);
            setPagina(1);
          }}
        >
          <MenuItem value="">Todos</MenuItem>
          {formatos.map((fmt) => (
            <MenuItem key={fmt} value={fmt}>{fmt}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box>
        <Typography variant="body2" gutterBottom>
          Faixa de Preço: R$ {faixaPreco[0]} - R$ {faixaPreco[1]}
        </Typography>
        <Slider
          value={faixaPreco}
          onChange={(_, newValue) => {
            setFaixaPreco(newValue as number[]);
            setPagina(1);
          }}
          valueLabelDisplay="auto"
          min={0}
          max={1500}
          step={50}
          sx={{ mt: 1 }}
        />
      </Box>

      <Button variant="outlined" onClick={limparFiltros} fullWidth>
        Limpar Filtros
      </Button>
    </Box>
  );

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Catálogo de Óculos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Encontre a armação perfeita para você
        </Typography>
      </Box>

      {/* Barra de Busca e Ordenação */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar armações..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPagina(1);
          }}
          sx={{ flexGrow: 1, minWidth: 200 }}
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:magnifer-linear" width={20} />
                </InputAdornment>
              ),
            }
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Ordenar por</InputLabel>
          <Select
            value={ordenacao}
            label="Ordenar por"
            onChange={(e) => setOrdenacao(e.target.value)}
          >
            <MenuItem value="relevancia">Relevância</MenuItem>
            <MenuItem value="preco_menor">Menor Preço</MenuItem>
            <MenuItem value="preco_maior">Maior Preço</MenuItem>
            <MenuItem value="nome">Nome A-Z</MenuItem>
          </Select>
        </FormControl>

        {isMobile && (
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:filter-bold" />}
            onClick={() => setDrawerOpen(true)}
          >
            Filtros
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Filtros Desktop */}
        {!isMobile && (
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ p: 3, position: 'sticky', top: 80 }}>
              {renderFiltros()}
            </Card>
          </Grid>
        )}

        {/* Lista de Produtos */}
        <Grid size={{ xs: 12, md: isMobile ? 12 : 9 }}>
          {/* Contador de resultados */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {armacoesFiltradas.length} armações encontradas
            </Typography>
            {(marcaSelecionada.length > 0 || categoriaSelecionada || materialSelecionado || formatoSelecionado) && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {marcaSelecionada.map((marca) => (
                  <Chip
                    key={marca}
                    label={marca}
                    size="small"
                    onDelete={() => setMarcaSelecionada(marcaSelecionada.filter((m) => m !== marca))}
                  />
                ))}
                {categoriaSelecionada && (
                  <Chip
                    label={categoriaSelecionada}
                    size="small"
                    onDelete={() => setCategoriaSelecionada('')}
                  />
                )}
              </Box>
            )}
          </Box>

          {/* Grid de Produtos */}
          <Grid container spacing={3}>
            {armacoesExibidas.map((armacao) => (
              <Grid key={armacao.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={armacao.imagem}
                      alt={armacao.nome}
                      sx={{ objectFit: 'contain', bgcolor: 'grey.100', p: 2 }}
                    />
                    {armacao.destaque && (
                      <Chip
                        label="Destaque"
                        color="primary"
                        size="small"
                        sx={{ position: 'absolute', top: 12, left: 12 }}
                      />
                    )}
                    {armacao.preco < armacao.precoOriginal && (
                      <Chip
                        label={`-${Math.round((1 - armacao.preco / armacao.precoOriginal) * 100)}%`}
                        color="error"
                        size="small"
                        sx={{ position: 'absolute', top: 12, right: 12 }}
                      />
                    )}
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'primary.lighter' }
                      }}
                      title="Experimentar Virtualmente (em breve)"
                    >
                      <Iconify icon="solar:camera-bold" width={20} />
                    </IconButton>
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {armacao.marca}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {armacao.nome}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      <Chip label={armacao.material} size="small" variant="outlined" />
                      <Chip label={armacao.formato} size="small" variant="outlined" />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      {armacao.preco < armacao.precoOriginal && (
                        <Typography
                          variant="body2"
                          sx={{ textDecoration: 'line-through', color: 'text.disabled' }}
                        >
                          R$ {armacao.precoOriginal.toFixed(2).replace('.', ',')}
                        </Typography>
                      )}
                      <Typography variant="h6" color="primary.main">
                        R$ {armacao.preco.toFixed(2).replace('.', ',')}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      href={`/catalogo/${armacao.id}`}
                    >
                      Ver Detalhes
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Mensagem quando não há resultados */}
          {armacoesExibidas.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Iconify icon="solar:glasses-line-duotone" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Nenhuma armação encontrada
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Tente ajustar os filtros de busca
              </Typography>
              <Button variant="outlined" onClick={limparFiltros}>
                Limpar Filtros
              </Button>
            </Box>
          )}

          {/* Paginação */}
          {totalPaginas > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPaginas}
                page={pagina}
                onChange={(_, value) => setPagina(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Drawer de Filtros Mobile */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 300, p: 3 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Filtros</Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <Iconify icon="solar:close-circle-bold" />
          </IconButton>
        </Box>
        {renderFiltros()}
      </Drawer>
    </DashboardContent>
  );
}
