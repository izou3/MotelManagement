#Build Environment
FROM nginx:1.16.0-alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY ./build/index.html /etc/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
