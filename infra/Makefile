project := qckstrt
stage := dev

aws_account := $(shell aws sts get-caller-identity --query "Account" --output text)
aws_region := us-west-1

frontend_nextjs := $(project)-$(stage)-nextjs
frontend_nginx := $(project)-$(stage)-nginx

backend_api := $(project)-$(stage)-api
backend_users := $(project)-$(stage)-users
backend_posts := $(project)-$(stage)-posts

image_tag = latest

deployment_yaml = $(project)-$(stage)-deployment.yaml

# 1. Build AWS Images
images-all: images-frontend images-backend

images-frontend: 
	cd ../apps/frontend && $(MAKE) build

images-backend:
	cd ../apps/backend && $(MAKE) build

# 2. Setup AWS Cloud
cloud-setup:
	terraform init;
	terraform plan -var-file=./infra.tfvars -var project=$(project) -var stage=$(stage) -out terraform.tfplan;

cloud: cloud-setup
	terraform apply -auto-approve -var-file=./infra.tfvars -var project=$(project) -var stage=$(stage)

# 2. Destroy AWS Cloud
deform:
	terraform destroy -auto-approve -var-file=./infra.tfvars -var project="$(project)" -var stage="$(stage)"

# EXTRA: If the AWS cloud has already been formed, use the following to push (and deploy) new (dev) images
push-all: push-frontend push-backend

push-frontend:
	aws --region $(aws_region) ecr get-login-password | docker login --username AWS --password-stdin $(aws_account).dkr.ecr.$(aws_region).amazonaws.com;

	docker tag $(frontend_nextjs):$(image_tag) $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(frontend_nextjs):$(image_tag)
	docker push $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(frontend_nextjs):$(image_tag)

	# docker tag $(frontend_nginx):$(image_tag) $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(frontend_nginx):$(image_tag)
	# docker push $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(frontend_nginx):$(image_tag)

push-backend:
	aws --region $(aws_region) ecr get-login-password | docker login --username AWS --password-stdin $(aws_account).dkr.ecr.$(aws_region).amazonaws.com;

	docker tag $(backend_api):$(image_tag) $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(backend_api):$(image_tag)
	docker push $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(backend_api):$(image_tag)

	docker tag $(backend_users):$(image_tag) $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(backend_users):$(image_tag)
	docker push $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(backend_users):$(image_tag)

	docker tag $(backend_posts):$(image_tag) $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(backend_posts):$(image_tag)
	docker push $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(backend_posts):$(image_tag)

