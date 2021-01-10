FROM  node:10 as base

FROM base as api

WORKDIR /usr/src/app

COPY ./package*.json ./

RUN npm install

COPY ./dist .

EXPOSE 3001

CMD ["npm", "run", "start:prodAPI"]


FROM base as jobs

WORKDIR /usr/src/app

COPY ./package*.json .

RUN npm install

COPY ./dist .

EXPOSE 3002

CMD ["npm", "run", "start:prodJobs"]
