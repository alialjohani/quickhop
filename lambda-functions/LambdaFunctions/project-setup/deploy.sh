#!/bin/bash
# cd where the project folder is in your shell, then run this script from the project folder
# ex: ~/hr-getCallerInfoByJobMatchingId$  ../project-setup/deploy.sh 

# Variables
PROJECT_NAME=$(node -p "require('./package.json').projectName")
S3BUCKET="quickhop-stack-bucket" # Bucket created only to upload zip to Lambda functions
REGION="ca-central-1"


# Build
echo ">> Build: $PROJECT_NAME"
rm -rf dist
esbuild index.ts --bundle --minify --sourcemap --platform=node --target=es2020 --outfile=dist/index.js

# Deploy
cd ./dist
echo ">> Deploy: $PROJECT_NAME"
zip -r index.zip index.js* > /dev/null
mv index.zip $PROJECT_NAME.zip #Rename to match an existing Lamnda name on AWS

echo ">> ZIP CREATED: $PROJECT_NAME"
aws s3 cp $PROJECT_NAME.zip s3://$S3BUCKET --region $REGION --quiet
echo ">> ZIP UPLOADED TO S3: $PROJECT_NAME"
aws lambda update-function-code --function-name "$PROJECT_NAME" \
	--s3-bucket $S3BUCKET \
	--s3-key $PROJECT_NAME.zip \
	--region $REGION > /dev/null
echo ">> LAMBDA CODE UPDATED: $PROJECT_NAME"

aws s3 rm s3://$S3BUCKET/$PROJECT_NAME.zip --region $REGION --quiet
echo ">> ZIP REMOVED FROM S3: $PROJECT_NAME"
echo ">> COMPLETED: $PROJECT_NAME"