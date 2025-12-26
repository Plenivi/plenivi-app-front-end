# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
yarn dev              # Start dev server (port 3039)
yarn build            # TypeScript check + Vite production build
yarn lint             # Check ESLint
yarn lint:fix         # Auto-fix linting issues
yarn fm:fix           # Format code with Prettier
yarn fix:all          # Run both lint:fix and fm:fix
yarn tsc:watch        # TypeScript watch mode
yarn re:dev           # Clean reinstall + start dev server
```

**Environment Setup:**
- Node.js >= 20 required
- Create `.env.local` with `VITE_CLERK_PUBLISHABLE_KEY` for authentication

## Architecture Overview

**Plenivi** is a vision health benefits management platform built with:
- **React 19** + **TypeScript 5.8** + **Vite 6**
- **Material-UI (MUI) 7** with CSS Variables API
- **Clerk** for authentication
- **React Router 7** with lazy-loaded routes

### Key Directory Structure

```
src/
├── auth/           # AuthGuard (protected) and GuestGuard (public) route wrappers
├── routes/         # Route definitions with lazy loading (sections.tsx)
├── layouts/        # Dashboard and Auth layouts with navigation components
├── pages/          # Page components that map to routes
├── sections/       # Feature views (overview, catalogo, consultas, pedidos, etc.)
├── components/     # Reusable UI components (logo, label, iconify, chart)
├── contexts/       # React Context (BeneficiosContext for benefits state)
├── theme/          # MUI theme configuration and customization
├── utils/          # Utility functions (format-number, format-time)
└── _mock/          # Mock data for development
```

### Authentication Pattern

- Clerk handles JWT authentication via `useAuth()` hook
- `AuthGuard` wraps protected routes, redirects to `/sign-in` if unauthenticated
- `GuestGuard` wraps public routes (login page)

### State Management

- React Context API for global state
- `BeneficiosContext` manages: empresa, CNPJ, saldo (total/utilizado/disponível), status
- Access via `useBeneficios()` hook

### Theme System

- Primary color: Teal (#00A89D)
- Secondary color: Blue (#3366FF)
- Fonts: DM Sans (primary), Barlow (secondary)
- Theme config in `src/theme/theme-config.ts`

### Code Style

ESLint with perfectionist plugin enforces import ordering:
1. Style imports
2. Side-effect imports
3. Type imports
4. Built-in/external packages
5. MUI imports
6. Internal (routes, hooks, utils, components, sections, auth)
7. Type imports last

Prettier: 100 char line width, 2-space indent, single quotes, semicolons
