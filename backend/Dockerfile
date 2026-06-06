FROM node:20-alpine
WORKDIR /usr/src/app
RUN apk add --no-cache poppler-utils
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
