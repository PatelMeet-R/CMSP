# FROM node:20-alpine

# WORKDIR /app

# ARG VITE_API_URL=http://localhost:3000
# ENV VITE_API_URL=$VITE_API_URL

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN npm run build

# EXPOSE 4173

# CMD [ "npm",'run','preview','--','--host','0.0.0.0','--port','4173' ]
FROM node:20-alpine

WORKDIR /app

ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# install static server
RUN npm install -g serve

EXPOSE 4173

CMD ["serve", "-s", "dist", "-l", "4173"]