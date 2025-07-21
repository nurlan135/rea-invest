# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

REA Invest is a real estate property management system built with Next.js 15, designed specifically for Azerbaijani real estate agencies. The application uses PostgreSQL with Prisma ORM and implements role-based authentication with NextAuth.js.

### Core Architecture

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API routes with Prisma ORM
- **Database**: PostgreSQL with comprehensive schema for properties, transactions, and contacts
- **Authentication**: NextAuth.js with credentials provider, 30-minute session timeout
- **UI Components**: Radix UI primitives with shadcn/ui (New York style)
- **Charts**: Recharts for analytics and dashboard visualizations
- **Deployment**: Docker-ready with standalone output

### Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Authentication pages
│   ├── (protected)/           # Protected dashboard routes
│   │   ├── dashboard/         # Main dashboard with analytics
│   │   ├── properties/        # Property management
│   │   ├── transactions/      # Transaction tracking
│   │   ├── customers/         # Customer/contact management
│   │   ├── agents/           # Agent management
│   │   ├── reports/          # Reporting and analytics
│   │   └── settings/         # Application settings
│   └── api/                  # API routes for all entities
├── components/
│   ├── ui/                   # Reusable UI components (shadcn/ui)
│   ├── layout/               # Header, sidebar, navigation
│   ├── auth/                 # Authentication components
│   ├── [entity]/             # Entity-specific components
│   └── providers.tsx         # React Query and other providers
├── hooks/                    # Custom React hooks
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── prisma.ts            # Prisma client setup
│   ├── utils.ts             # Utility functions
│   └── api-client.ts        # API client utilities
└── types/                   # TypeScript type definitions
```

## Common Development Commands

### Development
```bash
npm run dev          # Start development server
npm run dev:turbo    # Start with Turbo mode (faster builds)
```

### Database Management
```bash
npm run db:generate  # Generate Prisma client
npm run db:push     # Push schema changes to database
npm run db:migrate  # Run database migrations
npm run db:seed     # Seed database with initial data
npm run db:studio   # Open Prisma Studio
npm run db:reset    # Reset database (use with caution)
```

### Build and Deployment
```bash
npm run build            # Production build
npm run build:analyze    # Build with bundle analyzer
npm run start           # Start production server
npm run lint            # Run ESLint
```

### Performance Analysis
```bash
npm run perf:analyze    # Analyze bundle size
npm run perf:check     # Build and start for performance testing
```

## Authentication & Authorization

### Session Management
- 30-minute session timeout with automatic logout
- Role-based access control (ADMIN, AGENT)
- Protected routes use middleware at `src/middleware.ts`
- Auto-logout component provides 5-minute warning before session expiry

### Route Protection
- All routes under `(protected)` require authentication
- Admin routes (if implemented) require ADMIN role
- Middleware protects API routes and dashboard pages

## Database Schema

### Key Entities
- **User**: Agents and admins with role-based permissions
- **Contact**: Property owners and buyers with contact information
- **Property**: Real estate properties with detailed specifications
- **Transaction**: Financial transactions linked to properties
- **Deposit**: Deposit tracking for transactions

### Property Management
- Properties support multiple types: HEYET_EVI, OBYEKT, MENZIL, TORPAQ
- Status tracking: YENI, GOZLEMEDE, BEH_VERILIB, SATILIB, ICAREYE_VERILIB
- Purpose classification: SATIS (sale) or ICARE (rent)
- Document types: CIXARIS, MUQAVILE, SERENCAM

## Key Features

### Dashboard Analytics
- Monthly transaction charts using Recharts
- Statistics cards for key metrics
- Recent activity tracking
- Performance optimized with React.memo and lazy loading

### Data Export
- Excel export functionality for properties and transactions
- API endpoints: `/api/export/properties` and `/api/export/transactions`
- Uses xlsx library for spreadsheet generation

### Performance Optimizations
- Bundle splitting configured in next.config.js
- Image optimization with Next.js Image component
- React Query for API state management and caching
- Lazy loading for non-critical components
- Development performance monitoring available

## Development Guidelines

### Component Patterns
- Use shadcn/ui components as base building blocks
- Follow New York style guide from components.json
- Implement loading states for all async operations
- Use React Hook Form for form management

### API Development
- Follow RESTful conventions for API routes
- Implement proper error handling with try-catch blocks
- Use Prisma for all database operations
- Include proper TypeScript typing for all endpoints

### Styling Conventions
- Use Tailwind CSS v4 with CSS variables
- Follow existing utility-first approach
- Maintain responsive design patterns
- Use Lucide React for consistent iconography

## Environment Setup

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: NextAuth.js secret key
- `NEXTAUTH_URL`: Application URL for auth callbacks

### Docker Support
- Dockerfile available for containerized deployment
- Standalone output configured for optimal container size
- .dockerignore excludes unnecessary files

## Performance & Security

### Build Optimizations
- Bundle splitting with custom chunk strategies in next.config.js
- Package import optimization for major libraries (Recharts, Lucide)
- Critical CSS optimization with Critters
- Console removal in production builds
- Webpack module concatenation enabled

### Security Configuration
- Comprehensive security headers configured
- Content Security Policy for SVG handling
- XSS protection and frame options
- Strict Transport Security implementation
- Rate limiting support in middleware

## Architecture Patterns

### Component Organization
- Domain-driven component structure under `src/components/[entity]/`
- Auto-logout provider with session warning system
- React.memo and lazy loading for performance-critical components
- Responsive design with mobile-first approach using Tailwind CSS v4

### API Design
- RESTful endpoints under `/api/` with proper HTTP methods
- Middleware protection for all API routes
- TypeScript typing for all request/response objects
- Excel export endpoints: `/api/export/properties` and `/api/export/transactions`

### Localization
- Azerbaijani language support throughout the application
- Database enums and UI text in Azerbaijani
- Real estate industry-specific terminology and workflows



## Using Gemini CLI for Large Codebase Analysis

Use `gemini -p` for analyzing large codebases:

```bash
# Single file
gemini -p "@src/main.py Explain this file's purpose"

# Multiple files
gemini -p "@package.json @src/index.js Analyze dependencies"

# Entire directory
gemini -p "
@src
/ Summarize the architecture"

# Current directory
gemini -p "@./ Give me an overview of this project"
# Or use --all_files flag
gemini --all_files -p "Analyze the project structure"
```

Use Gemini CLI when:
- Analyzing entire codebases or large directories
- Current context window is insufficient
- Working with files totaling more than 100KB
- Verifying specific features or patterns across codebase