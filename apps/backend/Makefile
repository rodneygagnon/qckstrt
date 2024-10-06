project := qckstrt
stage := dev

aws_account := $(shell aws sts get-caller-identity --query "Account" --output text)
aws_region := us-west-1

organizations_image := $(project)-$(stage)-organizations
persons_image := $(project)-$(stage)-persons
roles_image := $(project)-$(stage)-roles

image_tag = latest

#Build docker images
build: build-local build-aws

build-local:
	docker build -f docker/Dockerfile.organizations.local --platform=linux/amd64 --tag $(organizations_image)-local .
	docker build -f docker/Dockerfile.persons.local --platform=linux/amd64 --tag $(persons_image)-local .
	docker build -f docker/Dockerfile.roles.local --platform=linux/amd64 --tag $(roles_image)-local .

build-aws:
	docker build -f docker/Dockerfile.organizations.aws --platform=linux/amd64 --tag $(organizations_image)-aws .
	docker build -f docker/Dockerfile.persons.aws --platform=linux/amd64 --tag $(persons_image)-aws .
	docker build -f docker/Dockerfile.roles.aws --platform=linux/amd64 --tag $(roles_image)-aws .

push: build-aws

push:
	aws --region $(aws_region) ecr get-login-password | docker login --username AWS --password-stdin $(aws_account).dkr.ecr.$(aws_region).amazonaws.com;

	docker tag $(organizations_image)-aws:$(image_tag) $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(organizations_image):$(image_tag)
	docker push $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(organizations_image):$(image_tag)

	docker tag $(persons_image)-aws:$(image_tag) $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(persons_image):$(image_tag)
	docker push $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(persons_image):$(image_tag)

	docker tag $(roles_image)-aws:$(image_tag) $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(roles_image):$(image_tag)
	docker push $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(roles_image):$(image_tag)