# Step 1: Build React app
FROM node:18 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

# ✅ Correct: use REACT_APP_API_URL (CRA only reads REACT_APP_)
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine

# Replace default Nginx config to use port 8080 (for Cloud Run)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
