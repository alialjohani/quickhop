#!/bin/bash

# Variables (to be manually added)
# REGION="ca-central-1"
# MAIN_PROJECT_NAME="quickhop"
# FRONTEND_PROJECT_NAME="web-app-frontend"
# BACKEND_PROJECT_NAME="web-app-backend"
# LAMBDA_PROJECT_NAME="lambda-functions"
# EC2InstanceImageId=ami-0bee12a638c7a8942 ## imageId must be compatible with the Region
# S3_BUCKET_NAME="quickhop-stack-bucket" ## S3 bucket already created

# REPO_GIT="https://git-codecommit.ca-central-1.amazonaws.com/v1/repos/quickhop"


MAIN_STACK_NAME="quickhop-stack"
# Main files' names (to be manually added)
FILE_SSMParameters_NAME="SSMParameters.yaml"
FILE_CognitoResources_NAME="CognitoResources.yaml"
FILE_RoleResources_NAME="RoleResources.yaml"
FILE_SGResources_NAME="SGResources.yaml"
FILE_DynamodbResources_NAME="DynamodbResources.yaml"
FILE_DBResources_NAME="DBResources.yaml"
FILE_LambdaResources_NAME="LambdaResources.yaml"
FILE_LexResources_NAME="LexResources.yaml"
FILE_StepFunctionResources_NAME="StepFunctionResources.yaml"
FILE_EventBridgeRuleResources_NAME="EventBridgeRuleResources.yaml"
FILE_BackendAppEC2Instance_NAME="BackendAppEC2Instance.yaml"
FILE_FrontendAppEC2Instance_NAME="FrontendAppEC2Instance.yaml"
FILE_TargetGroupResources_NAME="TargetGroupResources.yaml"
FILE_LoadBalancerResources_NAME="LoadBalancerResources.yaml"
FILE_MAIN_TEMPLATE="main.yaml"

# # TEMPORARY FILES' NAMES DEFINATION
# TMP_BASE="temporary_file_"
# TEMP_FILE_MAIN_TEMPLATE="${TMP_BASE}${FILE_MAIN_TEMPLATE}"
# TEMP_FILE_FrontendAppEC2Instance_NAME="${TMP_BASE}${FILE_FrontendAppEC2Instance_NAME}"
# TEMP_FILE_BackendAppEC2Instance_NAME="${TMP_BASE}${FILE_BackendAppEC2Instance_NAME}"

# Replace placeholders with the actual S3 bucket name in the main-template.yaml file
# echo "Replacing the placeholders ..."

# # Replace vars in main.yaml
# sed -e "s|\${{S3BucketName}}|$S3_BUCKET_NAME|g" \
# -e "s|\${{REGION}}|$REGION|g" \
# -e "s|\${{TEMP_FILE_FrontendAppEC2Instance_NAME}}|$TEMP_FILE_FrontendAppEC2Instance_NAME|g" \
# -e "s|\${{TEMP_FILE_BackendAppEC2Instance_NAME}}|$TEMP_FILE_BackendAppEC2Instance_NAME|g" \
# $FILE_MAIN_TEMPLATE > $TEMP_FILE_MAIN_TEMPLATE

# Replace vars in Frontend Resource file
# sed -e "s|\${{REGION}}|$REGION|g" \
# -e "s|\${{MAIN_PROJECT_NAME}}|$MAIN_PROJECT_NAME|g" \
# -e "s|\${{FRONTEND_PROJECT_NAME}}|$FRONTEND_PROJECT_NAME|g" \
# -e "s|\${{EC2InstanceImageId}}|$EC2InstanceImageId|g" \
# -e "s|\${{REPO_GIT}}|$REPO_GIT|g" \
# $FILE_FrontendAppEC2Instance_NAME > $TEMP_FILE_FrontendAppEC2Instance_NAME


# Replace vars in Backend Resource file
# sed -e "s|\${{REGION}}|$REGION|g" \
# -e "s|\${{MAIN_PROJECT_NAME}}|$MAIN_PROJECT_NAME|g" \
# -e "s|\${{BACKEND_PROJECT_NAME}}|$BACKEND_PROJECT_NAME|g" \
# -e "s|\${{LAMBDA_PROJECT_NAME}}|$LAMBDA_PROJECT_NAME|g" \
# -e "s|\${{EC2InstanceImageId}}|$EC2InstanceImageId|g" \
# -e "s|\${{REPO_GIT}}|$REPO_GIT|g" \
# $FILE_BackendAppEC2Instance_NAME > $TEMP_FILE_BackendAppEC2Instance_NAME

 # Replace the command with your region if an error occurred here
REGION=$(grep -A 1 '"ParameterKey": "awsRegion"' parameters.json | grep '"ParameterValue"' | sed -E 's/.*"ParameterValue": *"([^"]*)".*/\1/')
# Replace the command with your s3 bucket name if an error occurred here
S3_BUCKET_NAME=$(grep -A 1 '"ParameterKey": "awsS3BucketName"' parameters.json | grep '"ParameterValue"' | sed -E 's/.*"ParameterValue": *"([^"]*)".*/\1/')

echo "S3_BUCKET_NAME:: $S3_BUCKET_NAME"

# Upload templates to S3
echo "Uploading templates to S3..."
aws s3 cp $FILE_CognitoResources_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $FILE_SSMParameters_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $FILE_RoleResources_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $FILE_SGResources_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $FILE_DynamodbResources_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $FILE_DBResources_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $FILE_LambdaResources_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $FILE_LexResources_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $FILE_StepFunctionResources_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $FILE_EventBridgeRuleResources_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $FILE_BackendAppEC2Instance_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $FILE_FrontendAppEC2Instance_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $FILE_TargetGroupResources_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $FILE_LoadBalancerResources_NAME s3://$S3_BUCKET_NAME/ --region $REGION
aws s3 cp $FILE_MAIN_TEMPLATE s3://$S3_BUCKET_NAME/ --region $REGION


# Deploy the CloudFormation stack
echo "Creating the CloudFormation stack..."
aws cloudformation create-stack \
  --stack-name $MAIN_STACK_NAME \
  --template-url https://$S3_BUCKET_NAME.s3.$REGION.amazonaws.com/$FILE_MAIN_TEMPLATE \
  --region $REGION \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters file://parameters.json

echo "Waiting for the CloudFormation stack creation to complete..."
aws cloudformation wait stack-create-complete \
  --stack-name $MAIN_STACK_NAME \
  --region $REGION
  
# ##  Clean S3 bucket
aws s3 rm s3://$S3_BUCKET_NAME/ --region $REGION --recursive

# # Clean temporary files
# rm $TEMP_FILE_MAIN_TEMPLATE
# rm $TEMP_FILE_FrontendAppEC2Instance_NAME
# rm $TEMP_FILE_BackendAppEC2Instance_NAME