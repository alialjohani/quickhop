#!/bin/bash

# Variables (to be manually added)
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