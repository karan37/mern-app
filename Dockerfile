# Use an official Node.js image as the base
FROM node:18

# Set the working directory to /app in the container
WORKDIR /app

# Copy root package.json and package-lock.json
COPY package*.json ./

# Install root dependencies
RUN npm install

# Set the working directory to /app/client
WORKDIR /app/client

# Copy the client package.json and package-lock.json
COPY client/package*.json ./

# Install client dependencies
RUN npm install

# Copy the rest of the app's files
WORKDIR /app
COPY . .

# Build the client app
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Set the default command to start the server
CMD ["npm", "start"]
