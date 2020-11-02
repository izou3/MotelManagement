#Build Environment
FROM nginx:1.16.0-alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY ./build/index.html /etc/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
# FROM node:10-alpine as build

# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm install --silent

# RUN npm install react-scripts@3.0.1 -g --silent

# COPY . .

# RUN npm run build

# Production Environment
# FROM nginx:1.16.0-alpine

# COPY --from=build /usr/src/app/build /usr/share/nginx/html

# EXPOSE 3000

# ENTRYPOINT ["serve", "-s", "build", "-p", "3000"]

# RUN rm /etc/nginx/conf.d/default.conf

# COPY nginx.conf /etc/nginx/conf.d

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]
