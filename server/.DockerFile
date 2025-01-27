FROM node:alpine
ENV TZ=Europe/Paris
COPY . .
WORKDIR /server
RUN npm install --ignore-scripts
CMD ["npm", "run", "start:prod"]
EXPOSE 4000