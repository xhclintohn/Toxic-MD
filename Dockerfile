# Use the official Node.js image.
# https://hub.docker.com/_/node
FROM node:16-alpine

# Install pm2
RUN npm install -g pm2

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files.
COPY package*.json ./

# Install the dependencies.
RUN npm install --production

# Copy the rest of the application code.
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Run the web service on container startup.
CMD [ "pm2-runtime", "start", "toxic.js" ]