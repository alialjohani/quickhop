#!/bin/bash

# Variables
REGION="ca-central-1"
EC2InstanceImageId=ami-0bee12a638c7a8942 ## imageId must be compatible with the Region
S3_BUCKET_NAME="quickhop-stack-bucket"
MAIN_STACK_NAME="quickhop-stack"
REPO_GIT_FRONTEND="https://git-codecommit.ca-central-1.amazonaws.com/v1/repos/hr-web-app-frontend"
REPO_GIT_BACKEND="https://git-codecommit.ca-central-1.amazonaws.com/v1/repos/hr-web-app-backend"

# Main files' names
FILE_SSMParameters_NAME="SSMParameters.yaml"
FILE_RoleResources_NAME="RoleResources.yaml"
FILE_SGResources_NAME="SGResources.yaml"
FILE_DBResources_NAME="DBResources.yaml"
FILE_FrontendAppEC2Instance_NAME="FrontendAppEC2Instance.yaml"
FILE_BackendAppEC2Instance_NAME="BackendAppEC2Instance.yaml"
FILE_TargetGroupResources_NAME="TargetGroupResources.yaml"
FILE_LoadBalancerResources_NAME="LoadBalancerResources.yaml"
FILE_MAIN_TEMPLATE="main.yaml"

# TEMPORARY FILES' NAMES DEFINATION
TMP_BASE="temporary_file_"
TEMP_FILE_MAIN_TEMPLATE="${TMP_BASE}${FILE_MAIN_TEMPLATE}"
TEMP_FILE_FrontendAppEC2Instance_NAME="${TMP_BASE}${FILE_FrontendAppEC2Instance_NAME}"
TEMP_FILE_BackendAppEC2Instance_NAME="${TMP_BASE}${FILE_BackendAppEC2Instance_NAME}"

# Step 1: Replace placeholders with the actual S3 bucket name in the main-template.yaml file
echo "Replacing the placeholders ..."

sed -e "s|\${{S3BucketName}}|$S3_BUCKET_NAME|g" \
-e "s|\${{REGION}}|$REGION|g" \
-e "s|\${{TEMP_FILE_FrontendAppEC2Instance_NAME}}|$TEMP_FILE_FrontendAppEC2Instance_NAME|g" \
-e "s|\${{TEMP_FILE_BackendAppEC2Instance_NAME}}|$TEMP_FILE_BackendAppEC2Instance_NAME|g" \
$FILE_MAIN_TEMPLATE > $TEMP_FILE_MAIN_TEMPLATE

sed -e "s|\${{REGION}}|$REGION|g" \
-e "s|\${{EC2InstanceImageId}}|$EC2InstanceImageId|g" \
-e "s|\${{REPO_GIT_FRONTEND}}|$REPO_GIT_FRONTEND|g" \
$FILE_FrontendAppEC2Instance_NAME > $TEMP_FILE_FrontendAppEC2Instance_NAME

sed -e "s|\${{REGION}}|$REGION|g" \
-e "s|\${{EC2InstanceImageId}}|$EC2InstanceImageId|g" \
-e "s|\${{REPO_GIT_BACKEND}}|$REPO_GIT_BACKEND|g" \
$FILE_BackendAppEC2Instance_NAME > $TEMP_FILE_BackendAppEC2Instance_NAME


# Upload templates to S3
echo "Uploading templates to S3..."
aws s3 cp $FILE_SSMParameters_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $FILE_RoleResources_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $FILE_SGResources_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $FILE_DBResources_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $FILE_TargetGroupResources_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $FILE_LoadBalancerResources_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $TEMP_FILE_FrontendAppEC2Instance_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $TEMP_FILE_BackendAppEC2Instance_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $TEMP_FILE_MAIN_TEMPLATE s3://$S3_BUCKET_NAME/ --region $REGION


# Deploy the CloudFormation stack
echo "Creating the CloudFormation stack..."
aws cloudformation create-stack \
  --stack-name $MAIN_STACK_NAME \
  --template-url https://$S3_BUCKET_NAME.s3.$REGION.amazonaws.com/$TEMP_FILE_MAIN_TEMPLATE \
  --region $REGION \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters file://parameters.json

echo "Waiting for the CloudFormation stack creation to complete..."
aws cloudformation wait stack-create-complete \
  --stack-name $MAIN_STACK_NAME \
  --region $REGION
  
# ##  Clean S3 bucket
aws s3 rm s3://$S3_BUCKET_NAME/ --region $REGION --recursive

# Clean temporary files
rm $TEMP_FILE_MAIN_TEMPLATE
rm $TEMP_FILE_FrontendAppEC2Instance_NAME
rm $TEMP_FILE_BackendAppEC2Instance_NAME