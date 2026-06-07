FROM node:20-alpine

WORKDIR /app

# 1. Copy root configurations
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 2. Copy ALL workspace package.json files
COPY artifacts/api-server/package.json artifacts/api-server/
COPY artifacts/db/package.json artifacts/db/
COPY artifacts/api-zod/package.json artifacts/api-zod/
# (Make sure to add any other workspace packages you might have)

# 3. Install dependencies (pnpm will now link the workspaces)
RUN pnpm install --no-frozen-lockfile

# 4. Copy the actual source code
COPY . .

# 5. Build
RUN cd artifacts/api-server && pnpm run build