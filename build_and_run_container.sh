#!/bin/bash

IMAGE_NAME="my-scrapper"
CONTAINER_NAME="my-scrapper-container"

echo "🔄 Stopping and removing old containers..."
docker ps -a --filter "ancestor=$IMAGE_NAME" -q | xargs -r docker rm -f

echo "🛠 Building the Docker image..."
docker build -t $IMAGE_NAME:latest .

echo "🚀 Running the container..."
docker run -it --env-file .env --name $CONTAINER_NAME $IMAGE_NAME:latest
