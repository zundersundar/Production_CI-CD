FROM node:18-alpine
RUN apk add --no-cache python3 make gcc g++
WORKDIR /app
COPY package*.json ./
RUN npm cache clean --force && \
    npm install
COPY . .
RUN npm install react-spinners
RUN npm run build
FROM node:18-alpine
WORKDIR /app
COPY --from=0 /app/build ./build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
