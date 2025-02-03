#!/bin/bash
# This shell goes on each Lambda function directory, 
# and runs the 'deploy.sh' script that exists in 'project-setup' 
# ex: ~/hr-getCallerInfoByJobMatchingId$  ../project-setup/deploy.sh


# Loop through all Common directories to install dependencies
cd ./Common
for dir in */; do
    # Remove trailing slash from the directory name
    dir_name="${dir%/}"
    # Skip 'handleException'
    if [ "$dir_name" == "handleException" ]; then
        continue
    fi

    echo "Common: $dir_name"

    # Navigate into the directory
    cd "$dir_name" || continue
    
    # Deploy
    npm install
    echo "Completed:: $dir_name"
    # Navigate back
    cd ..
done



# Loop through all Lambda directories (except 'project-setup' directory)
cd ../LambdaFunctions
for dir in */; do
    # Remove trailing slash from the directory name
    dir_name="${dir%/}"

    # Skip 'project-setup'
    if [ "$dir_name" == "project-setup" ]; then
        continue
    fi

    echo "deploy-all-lambda.sh::Deploy:: $dir_name"

    # Navigate into the directory
    cd "$dir_name" || continue
    
    # Deploy
    ../project-setup/deploy.sh
    echo "deploy-all-lambda.sh::Completed:: $dir_name"
    # Navigate back
    cd ..
done