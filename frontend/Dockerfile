# frontend/Dockerfile
FROM node:22.14.0-alpine

# 1. Create app directory
WORKDIR /app

# 2. Copy package manifests and install deps
COPY package.json package-lock.json ./
RUN npm ci --silent

# 3. Copy rest of source
COPY . /app

# 4. Expose port and start dev server
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
