# Plenivi - Plataforma de Benefícios de Visão


> Aplicativo web para funcionários de empresas parceiras comprarem óculos, agendarem consultas com oftalmologistas e gerenciarem seus benefícios de visão.

## Sobre o Projeto

A Plenivi é uma plataforma B2B2C de benefícios de visão digital para o mercado brasileiro. Este front-end permite que funcionários de empresas que possuem o benefício Plenivi acessem:

- Catálogo de armações com filtros avançados
- Agendamento de consultas oftalmológicas
- Acompanhamento de pedidos
- Gerenciamento de perfil e receitas médicas

## Funcionalidades

### Autenticação e Onboarding
- Login com e-mail corporativo
- Verificação de elegibilidade ao benefício
- Fluxo de ativação para novos usuários

### Dashboard
- Resumo do saldo de benefício disponível
- Status de pedidos em andamento
- Próximas consultas agendadas
- Acesso rápido às funcionalidades principais

### Catálogo de Óculos
- Listagem de armações com filtros (marca, categoria, material, formato, preço)
- Busca por texto
- Detalhes do produto com fotos e especificações
- Sistema preparado para Try-on Virtual (AR/WebXR)
- Recomendação personalizada com IA (integração futura)
- Paginação

### Consultas
- Agendamento com profissionais credenciados
- Histórico de consultas
- Busca de oftalmologistas por região

### Pedidos
- Acompanhamento com stepper de status
- Detalhes de lentes e especificações
- Rastreamento de entrega

### Perfil do Usuário
- Dados pessoais editáveis
- Endereços de entrega
- Histórico de receitas médicas
- Preferências de notificação

## Tecnologias

- **React 19** + **TypeScript**
- **Vite** - Build tool
- **Material-UI (MUI) 7** - Componentes de UI
- **React Router 7** - Navegação
- **Iconify** - Ícones
- **ApexCharts** - Gráficos

## Requisitos

- Node.js v20 ou superior
- npm ou yarn

## Instalação

```bash
# Clonar o repositório
git clone <repository-url>
cd plenivi-app-front-end

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run start` | Preview do build de produção |
| `npm run lint` | Verifica problemas de linting |
| `npm run lint:fix` | Corrige problemas de linting automaticamente |
| `npm run fm:fix` | Formata código com Prettier |

## Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
├── layouts/          # Layouts da aplicação (Dashboard, Auth)
├── pages/            # Páginas da aplicação
├── routes/           # Configuração de rotas
├── sections/         # Seções específicas de cada página
│   ├── auth/         # Login
│   ├── onboarding/   # Ativação de benefício
│   ├── overview/     # Dashboard
│   ├── catalogo/     # Catálogo e detalhes de produtos
│   ├── consultas/    # Agendamento de consultas
│   ├── pedidos/      # Acompanhamento de pedidos
│   └── perfil/       # Perfil do usuário
├── theme/            # Configuração do tema MUI
└── _mock/            # Dados mock para desenvolvimento
```

## Tema e Cores

| Cor | Hex | Uso |
|-----|-----|-----|
| Primary (Teal) | `#00A89D` | Ações principais, branding |
| Secondary (Blue) | `#3366FF` | Elementos secundários, IA |
| Success | `#22C55E` | Confirmações, status positivo |
| Warning | `#FFAB00` | Alertas, atenção |
| Error | `#FF5630` | Erros, ações destrutivas |

## Roadmap

- [ ] Integração com API de backend
- [ ] Autenticação real (JWT/OAuth)
- [ ] Try-on Virtual com WebXR
- [ ] Recomendação de armações com IA
- [ ] Integração com gateway de pagamento
- [ ] PWA (Progressive Web App)

## Licença

Distribuído sob a licença MIT.
