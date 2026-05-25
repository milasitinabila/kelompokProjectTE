FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api-server/package.json api-server/
COPY artifacts/ ./artifacts/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source
COPY . .

# Build
RUN cd api-server && pnpm run build

EXPOSE 3000

CMD ["node", "api-server/dist/index.js"]