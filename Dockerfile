# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.14.0
ARG PNPM_VERSION=10.14.0

################################################################################
# Use node image for base image for all stages.
# Multi-platform support (works on both ARM64 and AMD64)
FROM node:${NODE_VERSION}-alpine as base

# Set working directory for all build stages.
WORKDIR /usr/src/app

# Install pnpm.
RUN npm install -g pnpm@${PNPM_VERSION}

# Copy dependency manifests first (for caching)
COPY package.json pnpm-lock.yaml* ./

################################################################################
# Create a stage for installing production dependecies.
FROM base as deps

# Download dependencies as a separate step to take advantage of Docker's caching.
RUN pnpm install --prod --frozen-lockfile

################################################################################
# Create a stage for building the application.
FROM deps as build

# Download additional development dependencies before building, as some projects require
# "devDependencies" to be installed to build. If you don't need this, remove this step.
RUN pnpm install --frozen-lockfile

# Copy the rest of the source files into the image.
COPY . .

# Run the build script.
RUN pnpm run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base as final

# Use production node environment by default.
ENV NODE_ENV production

# Run the application as a non-root user.
USER node

# Copy package.json so that package manager commands can be used.
COPY package.json .

# Copy ALL dependencies (including devDependencies for migrations)
# This includes drizzle-kit needed for db:push, db:generate, db:migrate
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

# Copy source files for migrations (drizzle-kit needs schema.ts)
COPY --from=build /usr/src/app/src ./src
COPY --from=build /usr/src/app/drizzle.config.ts ./drizzle.config.ts
COPY --from=build /usr/src/app/tsconfig.json ./tsconfig.json

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD pnpm start
