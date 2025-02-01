import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { AppError } from "../../errors/AppError";
import { AWS_S3_RESUME_FOLDER, AWS_S3_TAG_JOBSEEKER, AWS_S3_TAG_RECRUITER } from "../../interfaces/common";

// Load environment variables from .env file
dotenv.config();

interface UploadFileParams {
    recruiterEmail: string;
    jobSeekerEmail: string;
    fileName: string;
}

const FILE_EXTENSION = '.pdf';
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

const client = new S3Client({
    region: process.env.AWS_REGION!,
    maxAttempts: 3,
    requestHandler: {
        ...new S3Client({}).config.requestHandler, // Maintain existing handler config
        connectionTimeout: 300000, // 5 minutes in milliseconds
        socketTimeout: 300000, // 5 minutes in milliseconds
    }
});

export const S3UploadResume = async ({ recruiterEmail, jobSeekerEmail, fileName }: UploadFileParams): Promise<void> => {
    try {

        const file = './tmp/' + fileName + FILE_EXTENSION; // file to be uploaded to s3
        const key = AWS_S3_RESUME_FOLDER + fileName + FILE_EXTENSION; // file name in s3 bucket 
        const fileStream = fs.createReadStream(file);

        // Upload file
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileStream,
            Tagging: `${AWS_S3_TAG_RECRUITER}=${recruiterEmail}&&${AWS_S3_TAG_JOBSEEKER}=${jobSeekerEmail}`
        };

        const command = new PutObjectCommand(uploadParams);
        const response = await client.send(command);

        // Delete local file
        await fs.promises.unlink(file);

    } catch (error) {
        throw new AppError(
            's3UploadResume',
            500,
            "An error occurred while uploading a resume to S3: " + error
        );
    }
}