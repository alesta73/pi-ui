# Start with Node.js
FROM node:20-alpine

# Set the folder inside the container
WORKDIR /app

# Copy package files and install ALL dependencies
COPY package*.json ./
RUN npm install

# Copy your source code (server.js, src folder, etc)
COPY . .

# Build the React app (creates the 'dist' folder)
RUN npm run build

# Open the port and start the server
EXPOSE 3001
CMD ["node", "server.js"]