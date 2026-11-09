FROM node:22-bookworm-slim

WORKDIR /app

# Enable Corepack and activate the project's pnpm version
RUN corepack enable && corepack prepare pnpm@10.34.7 --activate

# Copy the complete monorepo
COPY . .

# Install Auth Service dependencies and its workspace dependencies
RUN pnpm install --filter auth-service... --frozen-lockfile

# Build Auth Service
RUN pnpm --filter auth-service build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["pnpm", "--filter", "auth-service", "start"]