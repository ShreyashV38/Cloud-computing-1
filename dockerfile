FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

ENV DB_HOST=localhost
ENV DB_USER=root
ENV DB_PASSWORD=4019
ENV DB_PORT=3306
ENV DB_NAME=ecom_db

CMD ["node", "server.js"]
    