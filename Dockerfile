# Use the official Node.js image as a base
FROM node:18-alpine

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application to the container
COPY . .

# Build the application
RUN npm run build

# Expose the port Next.js will run on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
