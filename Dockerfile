FROM node:22-alpine

WORKDIR /app

# 1. Aktifkan pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 2. Langsung COPY SEMUA kode dari awal
COPY . .

# 3. Install dependencies (karena semua kode sudah ada, symlink akan terjalin sempurna)
RUN pnpm install --no-frozen-lockfile

# 4. Build aplikasi dengan filter cerdas dari pnpm
# Tanda "..." di belakang api-server menyuruh pnpm untuk secara otomatis
# mem-build dependency-nya (db & api-zod) TERLEBIH DAHULU sebelum mem-build api-server.
RUN pnpm --filter api-server... run build

# 5. Command untuk menjalankan server (Sesuaikan dengan file hasil build Anda)
CMD ["pnpm", "--filter", "api-server", "run", "start"]