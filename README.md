# Groundwork

**RAG. Optimized for maximum performance.**

Groundwork is an open-source platform for building, evaluating, and shipping production-ready RAG and agentic applications. It provides end-to-end tooling: ingestion, vector indexing, evaluation and benchmarks, a chat playground, hosting, and a developer-friendly API.

> **Note:** workspace packages and scripts retain their original `@agentset/*` identifiers — every command below is copy-paste accurate.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
- [Scripts](#scripts)
- [Self-Hosting](#self-hosting)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Turnkey RAG** — ingestion, chunking, embeddings, and retrieval out of the box
- **Model agnostic** — works with your choice of LLM, embedding model, and vector database
- **Chat playground** — message editing and inline citations
- **Production hosting** — preview links and custom domains
- **API and typed SDKs** — with a published OpenAPI spec
- **Built-in multi-tenancy**
- **Billing and usage** — subscription handling and analytics built in
- **Background jobs** — durable ingestion and indexing pipelines
- **Webhooks** — event delivery to your own systems

Built with TypeScript, Next.js, the AI SDK, Prisma, Supabase, and Trigger.dev.

## Architecture

```
┌──────────────────────────────────────────────┐
│                  Web app                     │
│      Next.js · playground · dashboard        │
└───────────────────┬──────────────────────────┘
                    │
        ┌───────────┴────────────┐
        ▼                        ▼
┌──────────────┐         ┌───────────────┐
│    engine    │         │     jobs      │
│ RAG pipeline │         │  ingestion &  │
│ chunk·embed· │         │   indexing    │
│   retrieve   │         │  (background) │
└──────┬───────┘         └───────┬───────┘
       │                         │
       ▼                         ▼
┌──────────────┐  ┌──────────┐  ┌────────────┐  ┌───────────┐
│      db      │  │ storage  │  │  tinybird  │  │  stripe   │
│ Prisma/      │  │  files & │  │ analytics  │  │  billing  │
│ Postgres     │  │  uploads │  │            │  │           │
└──────────────┘  └──────────┘  └────────────┘  └───────────┘
```

Documents flow through the **engine** package (chunking, embedding, retrieval) with long-running ingestion handled by **jobs**. Metadata and tenancy live in **db**, raw files in **storage**, usage analytics in **tinybird**, and subscriptions in **stripe**. **Webhooks** and **emails** handle outbound notification.

## Repository Structure

This is a Turborepo monorepo managed with Bun.

```
.
├── apps/
│   └── web/            # Next.js application (dashboard, playground, API)
├── packages/
│   ├── engine/         # Core RAG pipeline — chunking, embeddings, retrieval
│   ├── jobs/           # Background ingestion and indexing
│   ├── db/             # Prisma schema, migrations, client
│   ├── storage/        # File storage abstraction
│   ├── stripe/         # Billing and subscriptions
│   ├── tinybird/       # Usage analytics
│   ├── webhooks/       # Outbound event delivery
│   ├── emails/         # Transactional email templates
│   ├── ui/             # Shared component library
│   ├── validation/     # Shared schemas
│   ├── utils/          # Shared utilities
│   └── demo/           # Demo assets and examples
├── tooling/
│   ├── eslint/  prettier/  typescript/   # Shared configs
├── docs/               # Public documentation
└── turbo.json
```

## Quick Start

### Prerequisites

- **Bun** 1.3+
- **Node.js** 22.12+
- A PostgreSQL database

### Local development

```bash
# 1) Copy env and fill in the required values
cp .env.example .env

# 2) Install dependencies
bun install

# 3) Run database migrations (from the repo root)
bun db:deploy

# 4) Start the app
bun dev:web
```

## Scripts

| Command | Description |
|---|---|
| `bun dev` | Run all workspaces in watch mode |
| `bun dev:web` | Run only the web app |
| `bun dev:emails` | Run the email template previewer |
| `bun dev:stripe` | Forward Stripe webhooks to the local server |
| `bun build` | Build all workspaces |
| `bun db:deploy` | Apply migrations |
| `bun db:migrate` | Create and apply a new migration |
| `bun db:generate` | Regenerate the Prisma client |
| `bun db:studio` | Open Prisma Studio |
| `bun lint` / `bun lint:fix` | Lint the repo |
| `bun format` / `bun format:fix` | Format the repo |
| `bun typecheck` | Type-check all workspaces |
| `bun clean` | Remove `node_modules` |

## Self-Hosting

Groundwork is fully self-hostable. Configure the required services in `.env` — database, storage, embedding and LLM providers, and any optional integrations (billing, analytics, background jobs) — then build and run the web app:

```bash
bun install
bun db:deploy
bun build
```

See the `docs/` directory for the complete self-hosting guide, including prerequisites and provider configuration.

## Contributing

Contributions of every size are welcome:

- Open an issue for bugs and feature ideas
- Submit a pull request with focused changes
- Improve the documentation or examples

Please run `bun lint` and `bun typecheck` before opening a pull request.

## License

MIT — see [LICENSE.md](LICENSE.md).
