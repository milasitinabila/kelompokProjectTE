FROM node:20-alpine

# Enable corepack untuk pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy semua file yang diperlukan
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api-server/package.json api-server/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build backend
RUN cd api-server && pnpm run build

EXPOSE 3000

CMD ["node", "api-server/dist/index.js"]