import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const instructions = [
  {
    icon: 'solar:sun-bold-duotone',
    title: 'Iluminação',
    description: 'Posicione-se em um local bem iluminado, de preferencia com luz natural.',
  },
  {
    icon: 'solar:eye-bold-duotone',
    title: 'Olhar',
    description: 'Olhe diretamente para a camera, mantenha a cabeca reta e sem inclinacao.',
  },
  {
    icon: 'solar:user-check-rounded-bold-duotone',
    title: 'Distância',
    description: 'Mantenha uma distância de aproximadamente 40-60 cm da camera.',
  },
  {
    icon: 'solar:camera-bold-duotone',
    title: 'Captura',
    description: 'Posicione seu rosto sem óculos ou acessórios dentro do oval e clique em "Iniciar Captura" quando estiver pronto.',
  },
];

export function MeasurementInstructions() {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon="solar:info-circle-bold" width={20} color="info.main" />
        Dicas para uma boa medição
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        {instructions.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: 'primary.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon={item.icon} width={18} sx={{ color: 'primary.main' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2">{item.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {item.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
