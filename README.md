## Prerequisites
pnpm 


## Docker Commands

docker build --file=Dockerfile.backend --platform=linux/amd64 --tag qckstrt-backend .
docker build --file=Dockerfile.frontend --platform=linux/amd64 --tag qckstrt-frontend .

docker run --platform linux/amd64 -p 3000:3000 qckstrt-frontend
docker run --platform linux/amd64 -p 4000:4000 qckstrt-backend