project := qckstrt
stage := dev

aws_account := $(shell aws sts get-caller-identity --query "Account" --output text)
aws_region := us-west-1

nextjs_image := $(project)-$(stage)-nextjs
nginx_image := $(project)-$(stage)-nginx

image_tag := latest

# Build docker images
build:
	docker compose --env-file .env.docker.dev build

# Push images to AWS ECR (Note: AWS ALB is used to terminate TLS. Nginx Ingress is not currently used)
push: push-nextjs push-nginx

# Push Nextjs to AWS ECR. If EKS cluster is up and running, the new image will be automatically deployed
push-nextjs:
	aws --region $(aws_region) ecr get-login-password | docker login --username AWS --password-stdin $(aws_account).dkr.ecr.$(aws_region).amazonaws.com;

	docker tag $(nextjs_image):$(image_tag) $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(nextjs_image):$(image_tag)
	docker push $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(nextjs_image):$(image_tag)

# Push Nginx image to AWS ECR. (Not used in production. This is here only for reference)
push-nginx:
	# aws --region $(aws_region) ecr get-login-password | docker login --username AWS --password-stdin $(aws_account).dkr.ecr.$(aws_region).amazonaws.com;

	# docker tag $(nginx_image):$(image_tag) $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(nginx_image):$(image_tag)
	# docker push $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(nginx_image):$(image_tag)