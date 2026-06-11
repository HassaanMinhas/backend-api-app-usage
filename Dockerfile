FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm ci --network-timeout=600000 --fetch-retries=5

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install system dependencies if needed
RUN apk add --no-cache netcat-openbsd

EXPOSE 5000
CMD ["node", "dist/main.js"]