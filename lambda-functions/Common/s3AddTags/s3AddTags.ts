/**
 * At the end of the call, Amazon Connect creates the recording in S3 bucket.
 * The name of the object (the key) is needed to update the database and to add tags.
 * This function receives: bucket name, prefix, the contactId (by eventBridge from Connect), and returns the key.
 */
import {
    S3Client,
    PutObjectTaggingCommand,
    PutObjectTaggingCommandInput,
    PutObjectTaggingCommandOutput
} from "@aws-sdk/client-s3";
import { ErrorResponse, Response, S3TagItemReq } from '../constants';
import handleException from "../handleException/handleException";

const client = new S3Client({});

/**
 * Expected a table name and a key to return the item from DynamoDB Table.
 * @param event: S3TagItemReq 
 * @returns response: ItemRes
 */
export const s3AddTags = async (event: S3TagItemReq): Promise<Response | ErrorResponse> => {

    try {
        let response: Response = {
            statusCode: 200,
        };

        const input: PutObjectTaggingCommandInput = {
            Bucket: event.bucket,
            Key: event.key,
            Tagging: {
                TagSet: [
                    { Key: event.firstTagKey, Value: event.firstTagValue },
                    { Key: event.secondTagKey, Value: event.secondTagValue },
                ],
            },
        };
        const command = new PutObjectTaggingCommand(input);
        const output: PutObjectTaggingCommandOutput = await client.send(command);

        // Check if the response is NOT success
        if (output.$metadata.httpStatusCode !== 200) {
            console.error(`s3AddTags(), input= ${JSON.stringify(input)}`);
            console.error(`s3AddTags(), output= ${JSON.stringify(output)}`);
            return handleException('Failed to add tags', 's3AddTags()')
        }
        // All success
        return response;
    } catch (ex) {
        return handleException(ex, 's3AddTags()');
    }
};