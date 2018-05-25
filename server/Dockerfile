FROM node:6

RUN mkdir -p /backend
WORKDIR /backend

COPY package.json /backend
RUN npm install
COPY . /backend

EXPOSE 3000
CMD [ "npm", "start" ]