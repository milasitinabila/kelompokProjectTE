FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY artifacts/api-server/package.json artifacts/api-server/

RUN pnpm install --no-frozen-lockfile

COPY . .

RUN cd artifacts/api-server && pnpm run build

EXPOSE 3000

CMD ["node", "artifacts/api-server/dist/index.mjs"]