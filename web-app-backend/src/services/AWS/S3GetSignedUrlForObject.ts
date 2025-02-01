
import { S3Client, GetObjectTaggingCommand, GetObjectCommandInput, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AppError } from '../../errors/AppError';
import { AWS_S3_RESUME_FOLDER, AWS_S3_TAG_JOBSEEKER, AWS_S3_TAG_RECRUITER } from '../../interfaces/common';
import dotenv from 'dotenv';
dotenv.config();

const CALLER = "getSignedUrlForResume";

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;


// Create S3 client
const s3 = new S3Client({
    region: process.env.AWS_REGION!,
});

export const S3GetSignedUrlForObject = async (email: string, objectKey: string): Promise<string> => {
    try {

        // Verify if the object tag matches the user's email
        const commandInput: GetObjectCommandInput = {
            Bucket: BUCKET_NAME,
            Key: objectKey,
        };

        // Retrieve object metadata
        const { TagSet } = await s3.send(new GetObjectTaggingCommand(commandInput));
        if (TagSet === undefined) {
            throw new AppError(
                CALLER,
                500,
                "Error with the S3 object."
            );
        } else {
            // Check if the tag matches the user's email
            const tag1 = TagSet.find(tag => tag.Key === AWS_S3_TAG_RECRUITER);
            const tag2 = TagSet.find(tag => tag.Key === AWS_S3_TAG_JOBSEEKER);
            if (email === tag1?.Value || email === tag2?.Value) {
                // Generate pre-signed URL
                const command = new GetObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: objectKey,
                })
                const signedUrl = await getSignedUrl(s3, command, {
                    expiresIn: 60 // the url will expire after 1 minute
                });
                return signedUrl;
            } else {
                throw new AppError(
                    CALLER,
                    403,
                    "S3 Access denied."
                );
            }
        }
    } catch (error) {
        throw new AppError(
            CALLER,
            500,
            "S3 error downloading file: " + error
        );
    }
}