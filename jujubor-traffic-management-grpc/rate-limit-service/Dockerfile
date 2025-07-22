# Use official Node.js image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the app (e.g., index.js, rls.proto)
COPY . .

# Expose gRPC port
EXPOSE 8081

# Run the gRPC server
CMD ["node", "index.js"]
