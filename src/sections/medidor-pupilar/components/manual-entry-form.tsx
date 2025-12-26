import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface ManualEntryFormProps {
  onSave: (dpValue: number) => void;
  onCancel: () => void;
}

export function ManualEntryForm({ onSave, onCancel }: ManualEntryFormProps) {
  const [dpValue, setDpValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const value = parseFloat(dpValue);

    if (Number.isNaN(value)) {
      setError('Digite um valor numerico valido.');
      return;
    }

    if (value < 50 || value > 80) {
      setError('O valor de DP deve estar entre 50 e 80 mm.');
      return;
    }

    onSave(value);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Entrada Manual de DP
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          Se voce ja possui a medicao da sua distancia pupilar (DP) de uma consulta anterior, pode inseri-la manualmente
          aqui.
        </Alert>

        <TextField
          fullWidth
          label="Distancia Pupilar (mm)"
          placeholder="Ex: 63.5"
          value={dpValue}
          onChange={(e) => {
            setDpValue(e.target.value);
            setError('');
          }}
          error={!!error}
          helperText={error || 'Valor tipico para adultos: 50-80 mm'}
          type="number"
          slotProps={{
            input: {
              endAdornment: <Typography color="text.secondary">mm</Typography>,
            },
            htmlInput: {
              min: 50,
              max: 80,
              step: 0.5,
            },
          }}
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            startIcon={<Iconify icon="solar:check-circle-bold" />}
          >
            Salvar
          </Button>
          <Button variant="outlined" onClick={onCancel}>
            Cancelar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
