FROM node:alpine
ENV TZ=Europe/Paris
COPY . .
WORKDIR /server
RUN npm install --ignore-scripts
CMD ["npm", "run", "start:dev"]
EXPOSE 4000