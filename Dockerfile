FROM node:18
RUN mkdir -p /var/app
WORKDIR /var/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["node", "dist/main.js"]