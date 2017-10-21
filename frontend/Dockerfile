FROM node:6

RUN mkdir -p /frontend
WORKDIR /frontend

COPY package.json /frontend
RUN npm install
RUN npm install -g angluar-cli
COPY . /frontend

EXPOSE 4200
CMD [ "npm", "start","--", "--host", "0.0.0.0", "--poll", "500"]