FROM node:22-alpine3.21 AS builder
WORKDIR /repo
RUN corepack enable

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/server ./apps/server

RUN pnpm install --frozen-lockfile --filter @qlct/server...
RUN pnpm --filter @qlct/constants build
RUN pnpm --filter @qlct/server build

RUN pnpm --filter @qlct/server deploy --legacy --prod /out

FROM node:22-alpine3.21 AS runner
WORKDIR /app

COPY --from=builder /out/dist ./dist
COPY --from=builder /out/node_modules ./node_modules
COPY --from=builder /out/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main.js"]
