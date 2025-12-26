import type { Medida } from 'src/contexts/medidas-context';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import ListItemText from '@mui/material/ListItemText';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface MeasurementHistoryProps {
  medidas: Medida[];
  medidaAtualId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function MeasurementHistory({ medidas, medidaAtualId, onSelect, onDelete }: MeasurementHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'warning';
    return 'error';
  };

  if (medidas.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Historico de Medicoes
          </Typography>
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              bgcolor: 'grey.50',
              borderRadius: 2,
            }}
          >
            <Iconify icon="solar:clipboard-list-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Nenhuma medição salva ainda.
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Faça sua primeira medição acima.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Historico de Medicoes ({medidas.length})
        </Typography>

        <List disablePadding>
          {medidas.map((medida) => (
            <ListItem
              key={medida.id}
              sx={{
                border: 1,
                borderColor: medida.id === medidaAtualId ? 'primary.main' : 'divider',
                borderRadius: 1,
                mb: 1,
                bgcolor: medida.id === medidaAtualId ? 'primary.lighter' : 'transparent',
              }}
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => onDelete(medida.id)}
                  sx={{ color: 'error.main' }}
                  title="Remover medição"
                >
                  <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                </IconButton>
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {medida.dpValue} mm
                    </Typography>
                    <Chip
                      label={medida.metodo === 'camera' ? 'Camera' : 'Manual'}
                      size="small"
                      variant="outlined"
                      icon={
                        <Iconify
                          icon={medida.metodo === 'camera' ? 'solar:camera-bold' : 'solar:pen-bold'}
                          width={14}
                        />
                      }
                    />
                    <Chip
                      label={`${medida.confidence}%`}
                      size="small"
                      color={getConfidenceColor(medida.confidence)}
                    />
                    {medida.id === medidaAtualId && (
                      <Chip label="Atual" size="small" color="primary" />
                    )}
                  </Box>
                }
                secondary={formatDate(medida.dataRegistro)}
              />
              {medida.id !== medidaAtualId && (
                <Button size="small" onClick={() => onSelect(medida.id)} sx={{ mr: 1 }}>
                  Usar
                </Button>
              )}
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
