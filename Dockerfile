FROM node:20-alpine

WORKDIR /app

# 1. Copy root configurations
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 2. Copy ALL workspace package.json files
COPY artifacts/api-server/package.json artifacts/api-server/

# PERBAIKAN: Ubah artifacts menjadi lib sesuai struktur folder Anda
COPY lib/db/package.json lib/db/
COPY lib/api-zod/package.json lib/api-zod/

# (Catatan: Jika api-server Anda juga meng-import 'api-spec', buka komentar di bawah ini)
# COPY lib/api-spec/package.json lib/api-spec/

# 3. Install dependencies (pnpm will now link the workspaces)
RUN pnpm install --no-frozen-lockfile

# 4. Copy the actual source code
COPY . .

# 5. Build
RUN cd artifacts/api-server && pnpm run build