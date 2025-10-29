# Step 1: Build React app
FROM node:18 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

# ✅ Pass VITE_API_URL dynamically during build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine

# Replace default Nginx config to use port 8080 (for Cloud Run)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
