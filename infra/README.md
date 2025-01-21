# Terraform Cloud Formation
![Qckstrt AWS Diagram](./illustrations/Qckstrt%20AWS%20Diagram.png?raw=true)

## Prerequisites
- [Create an AWS Account](https://aws.amazon.com/resources/create-account/)
- [Install & Configure AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)

### AWS Manual Config
1. Create `qckstrt-tf-state` S3 bucket
2. Create `qckstrt-tf-state-lock` Dynamo DB Table with Partition key <= `LockID` value
3. Cognito User Pool creation will return an error on the initial run. Verify Email Request that was sent and then rerun `make cloud` (NOTE: This will be fixed in the future) (NOTE 2: Review emails from SES to ensure domain records were successfully created)

### Makefile Variables
Change the following variables in the `Makefile`
- `project` - your project name (default: `qckstrt`)
- `stage` - your development stage (default: `dev`)
- `aws_region` - your aws region (default: `us-west-2`)

### Terraform Input Variables
Copy `project-tfvars.example` to `<your-project>.tfvars` and change the following variables
- `profile` - your AWS CLI profile (default: `qckstrt`)
- `region` - your aws region (default: `us-west-2`)
- `domain_name` - your domain name
- `email_identity` - your email address

#### Local PostgresSQL Configuration
- `host` - your database host
- `database` - your database name
- `username` - your username
- `password` - your password

#### OpenAI Configuration
- `apiKey` - your api key