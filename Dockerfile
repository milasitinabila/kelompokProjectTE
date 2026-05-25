FROM node:20-alpine

# Install pnpm using corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api-server/package.json api-server/
COPY artifacts/ ./artifacts/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy all source code
COPY . .

# Build backend
RUN cd api-server && pnpm run build

EXPOSE 3000

CMD ["node", "api-server/dist/index.js"]