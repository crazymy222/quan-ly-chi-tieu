FROM node:22-alpine3.21 AS builder
WORKDIR /repo
RUN corepack enable

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/client ./apps/client

ARG NEXT_PUBLIC_API_URL

RUN pnpm install --frozen-lockfile --filter @qlct/client...
RUN pnpm --filter @qlct/client build

FROM node:22-alpine3.21 AS runner
WORKDIR /app

COPY --from=builder /repo/apps/client/public ./apps/client/public
COPY --from=builder /repo/apps/client/.next/standalone ./
COPY --from=builder /repo/apps/client/.next/static ./apps/client/.next/static

EXPOSE 3001
CMD ["node", "apps/client/server.js"]
