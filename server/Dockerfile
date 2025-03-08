FROM node:16
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy shared schema
COPY ../shared/schema.ts ./shared/schema.ts

# Copy server files
COPY . .

# Compile TypeScript
RUN npm run build

# Expose the server port
EXPOSE 5000

# Start the server
CMD ["node", "dist/index.js"]