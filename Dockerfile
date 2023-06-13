FROM node:16-alpine

WORKDIR /CHATGPT

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=3000

EXPOSE $PORT

CMD ["npm","start"]