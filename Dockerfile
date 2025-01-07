# Use an official Node.js image as a parent
FROM node:18-alpine

# Create directory for the application
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the default Next.js port
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "run", "start"]