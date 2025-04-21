<a href="https://agentset.ai">
  <img alt="Agentset is the open-source RAG platform." src="https://repository-images.githubusercontent.com/945763259/9a3ddd06-12c2-4122-990e-d9390101ce31">
</a>

<h3 align="center">Agentset</h3>

<p align="center">
    The open-source RAG platform.
    <br />
    <a href="https://agentset.ai"><strong>Learn more »</strong></a>
    <br />
    <br />
    <a href="#introduction"><strong>Introduction</strong></a> ·
    <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
    <a href="#self-hosting"><strong>Self-hosting</strong></a>
</p>

<p align="center">
  <a href="https://github.com/agentset-ai/agentset/blob/main/LICENSE.md">
    <img src="https://img.shields.io/github/license/agentset-ai/agentset?label=license&logo=github&color=000&logoColor=fff" alt="License" />
  </a>
</p>

<br/>

## Introduction

Agentset is the open-source RAG platform for developers.

## Tech Stack

- [Next.js](https://nextjs.org/) – framework
- [TypeScript](https://www.typescriptlang.org/) – language
- [Tailwind](https://tailwindcss.com/) – CSS
- [Upstash](https://upstash.com/) – redis, workflows
- [Supabase](https://supabase.com/) – database
- [Prisma](https://prisma.io/) – database
- [BetterAuth](https://better-auth.com/) – auth
- [Turborepo](https://turbo.build/repo) – monorepo
- [Stripe](https://stripe.com/) – payments
- [Resend](https://resend.com/) – emails
- [Vercel](https://vercel.com/) – deployments

## Self-Hosting

_A complete self-hosting guide is coming soon. For now, you can follow the steps below to get the platform up and running on your local machine._

## Development

1. Install dependencies:

```bash
pnpm install
```

2. Copy `.env.example` to `.env` and set the environment variables:

```bash
cp .env.example .env
```

3. Migrate the database:

```bash
pnpm db:deploy
```

4.Start Upstash workflows local server:

```bash
pnpm dev:upstash
```

After it starts, copy the `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY` that appear in the terminal and paste them in the `.env` file.

5. Run the development server:

```bash
pnpm dev:web
```

## License

Agentset is open-source under the MIT License. You can [find it here](https://github.com/agentset-ai/agentset/blob/main/LICENSE).
