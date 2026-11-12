
FROM node:22-bookworm-slim

WORKDIR /app

# Enable Corepack and activate the project's pnpm version
RUN corepack enable && corepack prepare pnpm@10.34.7 --activate

# Copy the complete monorepo
COPY . .

# Install Property Service dependencies and workspace dependencies
RUN pnpm install --filter properties-service... --frozen-lockfile

# Build Property Service
RUN pnpm --filter properties-service build

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["pnpm", "--filter", "properties-service", "start"]
