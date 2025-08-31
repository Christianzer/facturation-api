# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS-based invoicing application ("facturation-app") built with TypeScript, MySQL, and TypeORM. The application provides complete invoice and credit note management with JWT authentication, PDF generation, and Swagger documentation.

## Development Commands

### Core Development
- `npm run start:dev` - Start development server with hot reload
- `npm run start:debug` - Start with debugger attached  
- `npm run build` - Build the application
- `npm run start:prod` - Run production build

### Code Quality
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier

### Testing
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests

## Project Architecture

### Database Configuration
- MySQL database with TypeORM
- Entities: User, Customer, Product, Invoice, InvoiceItem, CreditNote
- Relations: One-to-Many between Customer-Invoice, Invoice-InvoiceItem
- Auto-synchronization enabled in development

### Module Structure
- **AuthModule**: JWT authentication with Passport strategies
- **UsersModule**: User management with bcrypt password hashing
- **CustomersModule**: Customer CRUD operations
- **ProductsModule**: Product catalog management
- **InvoicesModule**: Invoice creation with automatic total calculations
- **CreditNotesModule**: Credit note management for returns/refunds
- **PdfModule**: PDF generation using jsPDF for invoices and credit notes

### Key Features
- JWT-based authentication with guards
- Automatic invoice numbering (YYYY-NNNN format)
- Automatic credit note numbering (CN-YYYY-NNNN format)
- Real-time total calculations (subtotal, VAT, total)
- Invoice status management (draft, sent, paid, overdue, cancelled)
- Credit note status management (draft, issued, applied, cancelled)
- PDF generation and preview for invoices and credit notes
- Comprehensive validation using class-validator
- Swagger API documentation at `/api`

### Environment Variables
Required in `.env` file:
- Database: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
- JWT: JWT_SECRET, JWT_EXPIRES_IN
- Application: PORT, NODE_ENV

### API Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `/users/*` - User management (protected)
- `/customers/*` - Customer management (protected)
- `/products/*` - Product management (protected)
- `/invoices/*` - Invoice management (protected)
- `/credit-notes/*` - Credit note management (protected)
- `/pdf/invoice/:id` - Generate invoice PDF
- `/pdf/credit-note/:id` - Generate credit note PDF

### Database Setup
Ensure MySQL server is running and create the database specified in DB_NAME before starting the application.