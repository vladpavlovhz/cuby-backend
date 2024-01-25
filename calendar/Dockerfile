FROM node:alpine

RUN mkdir -p /usr/src/app

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY ./code/package*.json /usr/src/app

# Install the application dependencies
RUN npm install

# Copy the local code to the container
COPY ./code /usr/src/app

# Expose port 3015
EXPOSE 3015

# Run npm install and npm run dev when the container launches
CMD ["npm install && npm run dev"]
