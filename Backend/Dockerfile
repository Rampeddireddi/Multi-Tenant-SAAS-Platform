FROM node:18-alpine

# Install curl for healthcheck
RUN apk --no-cache add curl

WORKDIR /app

COPY package*.json ./

# Clean install dependencies
RUN npm install

COPY . .

# Expose the specific port
EXPOSE 5000

# Start command handles migration AND server start
CMD ["npm", "start"]