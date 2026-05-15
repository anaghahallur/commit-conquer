# Use Node 20 as base
FROM node:20-slim AS base
WORKDIR /app

# Stage 1: Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
# Only copy package.json files that actually exist
COPY apps/storefront/package.json ./apps/storefront/
COPY packages/server/package.json ./packages/server/

RUN npm install

# Stage 2: Build and Run
FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Expose ports for Backend and Frontend
EXPOSE 4000
EXPOSE 5173

# Default command to start the full stack
CMD ["npm", "start", "--workspace=apps/storefront"]
