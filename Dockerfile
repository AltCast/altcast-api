FROM node:boron
WORKDIR /opt/altcast-api

COPY package.json .
COPY package.json package-lock.json ./

RUN npm install --production

COPY . .

CMD [ "npm", "start" ]
