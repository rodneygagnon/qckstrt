project := qckstrt
stage := dev

aws_account := $(shell aws sts get-caller-identity --query "Account" --output text)
aws_region := us-west-1

aws_frontend_nextjs := $(project)-$(stage)-nextjs
aws_frontend_nginx := $(project)-$(stage)-nginx

aws_backend_organizations := $(project)-$(stage)-organizations
aws_backend_persons := $(project)-$(stage)-persons
aws_backend_roles := $(project)-$(stage)-roles

aws_lambdas := \
	"$(aws_backend_organizations)", \
	"$(aws_backend_persons)", \
	"$(aws_backend_roles)"

local_backend_organizations := $(project)-$(stage)-organizations-local
local_backend_persons := $(project)-$(stage)-persons-local
local_backend_roles := $(project)-$(stage)-roles-local

image_tag = latest

deployment_yaml = $(project)-$(stage)-deployment.yaml

images-all: images-frontend images-aws-backend images-local-backend
images-all-aws: images-frontend images-aws-backend
images-all-local: images-frontend images-local-backend

images-frontend: 
	cd ../apps/frontend; docker compose --env-file .env.docker.dev build

# Local testing
images-local-backend:
	cd ../apps/backend; \
		docker compose --file docker/dc-microservices.yaml --env-file docker/.env.docker.local build

# 1. Build AWS Images
# docker build --file=Dockerfile.backend.aws --build-arg svc_name=organizations --platform=linux/amd64 --tag $(aws_backend_organizations) .;
images-aws-backend:
	cd ../apps/backend; \
		docker compose --file docker/dc-microservices.yaml --env-file docker/.env.docker.aws build

# 2. Setup AWS Cloud
cloud-setup:
	terraform init;
	terraform plan -var-file=./infra.tfvars -var project=$(project) -var stage=$(stage) -out terraform.tfplan;

# 2. Create AWS Cloud
cloud: cloud-setup
	terraform apply -auto-approve -var-file=./infra.tfvars -var project=$(project) -var stage=$(stage)

# 3. Tag and push the docker images
push-all: push-frontend push-backend

push-frontend:
	aws --region $(aws_region) ecr get-login-password | docker login --username AWS --password-stdin $(aws_account).dkr.ecr.$(aws_region).amazonaws.com;

	docker tag $(aws_frontend_nextjs):$(image_tag) $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(aws_frontend_nextjs):$(image_tag)
	docker push $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(aws_frontend_nextjs):$(image_tag)

	# docker tag $(aws_frontend_nginx):$(image_tag) $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(aws_frontend_nginx):$(image_tag)
	# docker push $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(aws_frontend_nginx):$(image_tag)

push:
	aws --region $(aws_region) ecr get-login-password | docker login --username AWS --password-stdin $(aws_account).dkr.ecr.$(aws_region).amazonaws.com;

	docker tag $(aws_frontend_www):$(image_tag) $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(aws_frontend_www):$(image_tag)
	docker push $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(aws_frontend_www):$(image_tag)

	docker tag $(aws_backend_organizations):$(image_tag) $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(aws_backend_organizations):$(image_tag)
	docker push $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(aws_backend_organizations):$(image_tag)

	docker tag $(aws_backend_persons):$(image_tag) $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(aws_backend_persons):$(image_tag)
	docker push $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(aws_backend_persons):$(image_tag)

	docker tag $(aws_backend_roles):$(image_tag) $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(aws_backend_roles):$(image_tag)
	docker push $(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(aws_backend_roles):$(image_tag)

# 3. Deploy docker images
deploy-frontend:
	cd ../apps/frontend/kubernetes; \
		aws --region $(aws_region) eks update-kubeconfig --name $(project)-$(stage)-cluster; \
		#sed -e 's,PRJ,'$(project)',g' -e 's,ENV,'$(stage)',g' -e 's,ECR_IMAGE,'$(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(aws_frontend_nextjs):$(image_tag)',g' < nextjs-template.yaml > nextjs-deployment.yaml; \
		#sed -e 's,PRJ,'$(project)',g' -e 's,ENV,'$(stage)',g' -e 's,ECR_IMAGE,'$(aws_account).dkr.ecr.$(aws_region).amazonaws.com/$(aws_frontend_nginx):$(image_tag)',g' < nginx-template.yaml > nginx-deployment.yaml; \
		#kubectl create namespace $(project)-$(stage) || true; \
		#kubectl create secret docker-registry regcred \
    	--docker-server=$(aws_account).dkr.ecr.$(aws_region).amazonaws.com \
    	--docker-username=AWS \
    	--docker-password="$(shell aws ecr get-login-password --region $(aws_region))" \
    	--namespace=$(project)-$(stage) || true; \
		# kubectl apply -f $(deployment_yaml)

deform:
	terraform destroy -auto-approve -var-file=./infra.tfvars -var project="$(project)" -var stage="$(stage)" -var 'lambdas=[$(aws_lambdas)]'
