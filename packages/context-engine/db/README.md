# @context-engine/db

Database layer for Context Engine. PostgreSQL + pgvector for semantic search.

## Setup

```bash
# 1. Start PostgreSQL with pgvector
docker-compose -f ../docker-compose.yml up -d

# 2. Update .env with your credentials
cp env.example .env
# Edit .env with your DATABASE_URL and VOYAGE_API_KEY

# 3. Initialize database
yarn db:init
```

## Scripts

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `yarn db:init`     | Full setup (push schema + pgvector features) |
| `yarn db:push`     | Push Drizzle schema to database              |
| `yarn db:setup`    | Run setup.sql for pgvector                   |
| `yarn db:studio`   | Open Drizzle Studio                          |
| `yarn db:generate` | Generate migrations                          |
| `yarn db:migrate`  | Run migrations                               |

## Environment Variables

| Variable         | Description                      |
| ---------------- | -------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string     |
| `VOYAGE_API_KEY` | Voyage AI API key for embeddings |
