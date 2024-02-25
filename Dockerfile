FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm" PATH="$PNPM_HOME:$PATH"
ENV API_BASE="" HTTP_HOST="0.0.0.0" HTTP_PORT="80" API_ROOT="./api/"


RUN corepack enable
COPY . /usr/src/pgo-ca-codes
WORKDIR /usr/src/pgo-ca-codes

# Install dev dependencies and build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm -r run build

# Prune dev dependencies so only prod deps are included
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Remove unneeded source code
RUN rm -r backend/src frontend/src

EXPOSE 80
CMD [ "pnpm", "start" ]
