FROM node:22

WORKDIR /api

COPY package*.json .

RUN npm install

COPY . .

CMD [ "npm", "run", "start:dev" ]