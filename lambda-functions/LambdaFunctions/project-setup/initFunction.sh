#!/bin/bash
# Used to set up a function for Lambda (not layer) 
# Pass new project name as: ./initFuntion.sh {NAME}

FOLDER="project-setup" # DO NOT CHANGE THIS

# Create: folder, install dependencies, index.ts, update package.json for later build
mkdir ../$1
cd ../$1
echo $1
npm init -y
npm install -D @types/aws-lambda # Assure esbuild is installed: sudo apt install esbuild
npm install @types/node
npm pkg set projectName=$1
npm pkg set scripts.build="../$FOLDER/deploy.sh" # set this for later use with: npm run build
cp ../$FOLDER/index-template.ts.txt ./index.ts