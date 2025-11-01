# Step 1: Build React app
FROM node:18 AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copy the rest of your app
COPY . .

# ✅ Declare build arguments BEFORE the build step
ARG REACT_APP_API_URL
ARG REACT_APP_GOOGLE_CLIENT_ID

# ✅ Inject build args into environment so React picks them up
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID

# ✅ Now build React app with the environment vars embedded
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine

# Replace default Nginx config to use port 8080 (for Cloud Run)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from builder stage
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
