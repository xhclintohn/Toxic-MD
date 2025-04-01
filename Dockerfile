# Use the official Node.js image with Alpine
FROM node:16-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    ffmpeg

# Install PM2 globally
RUN npm install -g pm2

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package files first for better layer caching
COPY package*.json ./

# Install app dependencies with legacy peer deps flag
RUN npm install --legacy-peer-deps --production

# Copy the rest of the application
COPY . .

# Build the application if needed
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD node healthcheck.js || exit 1

# Run the web service on container startup
CMD ["pm2-runtime", "toxic.js"]