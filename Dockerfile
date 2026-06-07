# Ubah baris ini:
FROM node:22-alpine

WORKDIR /app

# 0. Aktifkan pnpm melalui corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# 1. Copy root configurations
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 2. Copy ALL workspace package.json files
COPY artifacts/api-server/package.json artifacts/api-server/
COPY lib/db/package.json lib/db/
COPY lib/api-zod/package.json lib/api-zod/

# 3. Install dependencies (pnpm will now link the workspaces)
RUN pnpm install --no-frozen-lockfile

# 4. Copy the actual source code
COPY . .

# 5. Build
RUN cd artifacts/api-server && pnpm run build

# 6. Start the server (Pastikan Anda menambahkan perintah untuk menjalankan server)
# Contoh: CMD ["node", "artifacts/api-server/build.mjs"] 
# Sesuaikan dengan perintah start yang ada di package.json api-server Anda.