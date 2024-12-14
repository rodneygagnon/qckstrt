terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.81"
    }

    docker = {
      source  = "kreuzwerker/docker"
      version = ">= 3.0"
    }
  }
 
  backend "s3" {
    bucket         = "rmg-tf-backends"
    key            = "qckstrt/envs/dev/terraform.tfstate"
    region         = "us-west-1"
    dynamodb_table = "rmg-tf-backends"
    profile        = "rmg-west"
  }
}

provider "aws" {
  region  = var.region
  profile = var.profile
}

provider "docker" {
  registry_auth {
    address  = format("%v.dkr.ecr.%v.amazonaws.com", data.aws_caller_identity.this.account_id, data.aws_region.current.name)
    username = data.aws_ecr_authorization_token.token.user_name
    password = data.aws_ecr_authorization_token.token.password
  }
}
