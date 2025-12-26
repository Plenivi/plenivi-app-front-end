# Plenivi - Features da Plataforma

Este documento lista todas as features implementadas na plataforma Plenivi e indica quais estao utilizando dados mock (simulados) ou dados reais.

---

## Resumo

| Feature | Status | Dados |
|---------|--------|-------|
| Autenticacao | Funcional | Real (Clerk) |
| Dashboard | Funcional | Mock |
| Catalogo de Oculos | Funcional | Mock |
| Consultas | Funcional | Mock |
| Pedidos | Funcional | Mock |
| Perfil | Funcional | Mock |
| Beneficios | Funcional | Mock |
| Medidor Pupilar (DP) | Funcional | Mock + Real (Camera) |
| Notificacoes | UI apenas | Mock |

---

## Features Detalhadas

### 1. Autenticacao

**Status:** Funcional
**Dados:** Real (Clerk)

**Descricao:**
- Login/Logout via Clerk
- Protecao de rotas com `AuthGuard`
- Rotas publicas com `GuestGuard`

**Arquivos:**
- `src/auth/guard/auth-guard.tsx`
- `src/auth/guard/guest-guard.tsx`
- `src/sections/auth/sign-in-view.tsx`

**Integracao necessaria:** Nenhuma (ja integrado com Clerk)

---

### 2. Dashboard (Inicio)

**Status:** Funcional
**Dados:** Mock

**Descricao:**
- Exibicao de saldo do beneficio
- Acesso rapido as principais funcoes
- Lista de pedidos em andamento
- Proximas consultas agendadas
- Banner de recomendacao IA

**Dados Mock:**
- `mockPedidos` - Lista de pedidos em andamento
- `mockConsultas` - Proximas consultas

**Dados Reais:**
- Nome do usuario (via Clerk `useUser()`)
- Saldo do beneficio (via `BeneficiosContext` - mas o context usa mock)

**Arquivos:**
- `src/sections/overview/view/plenivi-dashboard-view.tsx`

**Integracao necessaria:**
- API de pedidos
- API de consultas
- API de beneficios/saldo

---

### 3. Catalogo de Oculos

**Status:** Funcional
**Dados:** Mock

**Descricao:**
- Listagem de armacoes com filtros
- Busca por nome/marca
- Filtros por marca, categoria, material, formato, preco
- Ordenacao (relevancia, preco, nome)
- Paginacao
- Visualizacao responsiva (drawer de filtros no mobile)

**Dados Mock:**
- `mockArmacoes` - 6 produtos de exemplo
- Listas de filtros (marcas, categorias, materiais, formatos)

**Arquivos:**
- `src/sections/catalogo/catalogo-view.tsx`
- `src/sections/catalogo/produto-detalhe-view.tsx`

**Integracao necessaria:**
- API de produtos/catalogo
- Sistema de busca
- Sistema de filtros

---

### 4. Consultas

**Status:** Funcional
**Dados:** Mock

**Descricao:**
- Visualizacao de consultas agendadas
- Historico de consultas realizadas
- Busca de profissionais credenciados
- Agendamento de novas consultas
- Dialog de agendamento com selecao de data/horario

**Dados Mock:**
- `mockConsultasAgendadas` - Consultas futuras
- `mockConsultasPassadas` - Historico
- `mockProfissionais` - Lista de medicos

**Arquivos:**
- `src/sections/consultas/consultas-view.tsx`

**Integracao necessaria:**
- API de consultas (CRUD)
- API de profissionais credenciados
- Sistema de agendamento real
- Notificacoes de confirmacao

---

### 5. Pedidos

**Status:** Funcional
**Dados:** Mock

**Descricao:**
- Lista de pedidos em andamento
- Historico de pedidos finalizados
- Detalhes expandiveis do pedido
- Stepper de status (Realizado -> Pago -> Producao -> Enviado -> Entregue)
- Informacoes de entrega e rastreio
- Especificacoes das lentes (tipo, tratamentos, grau)
- Historico de eventos do pedido

**Dados Mock:**
- `mockPedidos` - Pedidos em andamento (2)
- `mockPedidosFinalizados` - Pedidos entregues (1)

**Arquivos:**
- `src/sections/pedidos/pedidos-view.tsx`

**Integracao necessaria:**
- API de pedidos
- Integracao com sistema de rastreio (Correios, transportadoras)
- Sistema de notas fiscais

---

### 6. Perfil do Usuario

**Status:** Funcional
**Dados:** Mock

**Descricao:**
- Dados pessoais (nome, email, CPF, telefone)
- Edicao de dados
- Gerenciamento de enderecos de entrega
- Upload e visualizacao de receitas medicas
- Preferencias de notificacao
- Historico de medicoes (DP) - integrado com MedidasContext

**Dados Mock:**
- `mockUsuario` - Dados do usuario
- `mockEnderecos` - Enderecos de entrega
- `mockReceitas` - Receitas medicas
- `mockNotificacoes` - Preferencias de notificacao

**Dados Reais:**
- Medicoes de DP (via `MedidasContext` - persiste em memoria)

**Arquivos:**
- `src/sections/perfil/perfil-view.tsx`

**Integracao necessaria:**
- API de usuario (CRUD)
- API de enderecos
- Sistema de upload de receitas
- API de notificacoes/preferencias

---

### 7. Beneficios

**Status:** Funcional
**Dados:** Mock

**Descricao:**
- Visualizacao de beneficios ativos
- Selecao de beneficio ativo
- Adicao de novo beneficio via codigo
- Exibicao de saldo (total, utilizado, disponivel)

**Dados Mock:**
- `mockBeneficios` - 2 beneficios de exemplo
- `empresasDisponiveis` - Codigos de teste (1357, 2468, 3690)

**Arquivos:**
- `src/sections/beneficios/beneficios-view.tsx`
- `src/contexts/beneficios-context.tsx`

**Integracao necessaria:**
- API de beneficios
- Validacao de codigos de empresa
- Sistema de saldo em tempo real

---

### 8. Medidor Pupilar (DP)

**Status:** Funcional
**Dados:** Mock + Real (Camera)

**Descricao:**
- Medicao de distância Pupilar (DP) usando camera
- Deteccao facial com MediaPipe FaceMesh
- Calculo de DP baseado em landmarks dos olhos
- Entrada manual de DP
- Historico de medicoes
- Indicador deconfiança da medicao

**Dados Mock:**
- `mockMedidas` - Uma medicao inicial de exemplo

**Dados Reais:**
- Acesso a camera do dispositivo
- Processamento de imagem com MediaPipe FaceMesh
- Medicoes salvas em memoria (MedidasContext)

**Arquivos:**
- `src/sections/medidor-pupilar/medidor-pupilar-view.tsx`
- `src/sections/medidor-pupilar/hooks/use-camera.ts`
- `src/sections/medidor-pupilar/hooks/use-face-mesh.ts`
- `src/sections/medidor-pupilar/components/camera-feed.tsx`
- `src/sections/medidor-pupilar/components/measurement-result.tsx`
- `src/sections/medidor-pupilar/components/measurement-history.tsx`
- `src/sections/medidor-pupilar/components/manual-entry-form.tsx`
- `src/sections/medidor-pupilar/components/measurement-instructions.tsx`
- `src/contexts/medidas-context.tsx`

**Integracao necessaria:**
- API para persistir medicoes
- Possivel integracao com backend para validacao

---

### 9. Notificacoes

**Status:** UI apenas
**Dados:** Mock

**Descricao:**
- Sino de notificacoes no header
- Lista de notificacoes recentes
- Tipos: pedido, consulta, saldo, envio

**Dados Mock:**
- `_notifications` em `src/_mock/_data.ts`

**Arquivos:**
- `src/_mock/_data.ts`

**Integracao necessaria:**
- Sistema de notificacoes real-time (WebSocket/SSE)
- API de notificacoes
- Push notifications

---

## Contexts (Estado Global)

### BeneficiosContext
**Arquivo:** `src/contexts/beneficios-context.tsx`
**Dados:** Mock
**Funcoes:**
- `beneficios` - Lista de beneficios
- `beneficioAtual` - Beneficio selecionado
- `selecionarBeneficio()` - Selecionar beneficio ativo
- `adicionarBeneficio()` - Adicionar via codigo
- `removerBeneficio()` - Remover beneficio

### MedidasContext
**Arquivo:** `src/contexts/medidas-context.tsx`
**Dados:** Mock + Real (medicoes em memoria)
**Funcoes:**
- `medidas` - Historico de medicoes
- `medidaAtual` - Medicao selecionada
- `adicionarMedida()` - Salvar nova medicao
- `removerMedida()` - Remover medicao
- `selecionarMedida()` - Definir medicao ativa

---

## Proximos Passos para Integracao

### Prioridade Alta
1. **API de Beneficios** - Central para funcionamento da plataforma
2. **API de Catalogo** - Produtos reais
3. **API de Pedidos** - Fluxo de compra

### Prioridade Media
4. **API de Consultas** - Agendamento real
5. **API de Usuario/Perfil** - Dados persistentes
6. **API de Medicoes (DP)** - Persistir medicoes

### Prioridade Baixa
7. **Sistema de Notificacoes** - Real-time
8. **Upload de Receitas** - Armazenamento
9. **Rastreamento de Pedidos** - Integracao Correios

---

## Tecnologias Utilizadas

- **Frontend:** React 19, TypeScript 5.8, Vite 6
- **UI:** Material-UI (MUI) 7
- **Autenticacao:** Clerk
- **Roteamento:** React Router 7
- **IA/ML:** MediaPipe FaceMesh (medicao pupilar)
- **Estado:** React Context API
