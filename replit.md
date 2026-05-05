# Workspace

## Overview

pnpm workspace monorepo using TypeScript. This is the **Karya Mandiri** Sistem Transaksi Elektronik — a full-stack web app for electronics repair shop management.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind + shadcn/ui + TanStack Query

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- After codegen, manually fix `lib/api-zod/src/index.ts` to only have: `export * from "./generated/api";`
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Application Modules

1. **Dashboard** — KPI summary, revenue chart (recharts), contract pipeline, recent activity
2. **POS** — Point of Sale with session management, product grid, cart, multi-payment checkout
3. **Kontrak** — Contract management, e-signature, service type: Hitachi / Electrolux only
4. **Transaksi** — Transaction history with filters, invoice detail, payment records
5. **Inventaris** — Product/spare part inventory with low stock alerts
6. **Pelanggan** — Customer management with search
7. **Keamanan** — Security layers dashboard, audit logs, event monitoring

## Auth

Simple localStorage-based auth (no backend). Accounts:
- admin / admin123
- kasir / kasir123
- teknisi / teknisi123

## Service Types

Contract service types are limited to **Hitachi** and **Electrolux** (enum: `hitachi`, `electrolux`).

## DB Tables

customers, products, contracts, pos_sessions, transactions, transaction_items, payments, audit_logs

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
