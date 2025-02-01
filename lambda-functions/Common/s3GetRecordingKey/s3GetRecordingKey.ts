/**
 * At the end of the call, Amazon Connect creates the recording in S3 bucket.
 * The name of the object (the key) is needed to update the database and to add tags.
 * This function receives: bucket name, prefix, the contactId (by eventBridge from Connect), and returns the key.
 */
import {
    S3Client,
    ListObjectsV2Command,
    ListObjectsV2CommandInput,
    ListObjectsV2CommandOutput
} from "@aws-sdk/client-s3";
import { ErrorResponse, S3UriItemReq, S3UriItemRes } from '../constants';
import handleException from "../handleException/handleException";

const client = new S3Client({});

/**
 * Expected a table name and a key to return the item from DynamoDB Table.
 * @param event: S3UriItemReq 
 * @returns response: S3UriItemRes | ErrorResponse
 */
export const s3GetRecordingKey = async (event: S3UriItemReq): Promise<S3UriItemRes | ErrorResponse> => {

    try {
        let response: S3UriItemRes = {
            statusCode: 200,
            body: {
                uri: '',
                key: ''
            },
        };
        const bucket = event.bucket;
        const prefix = event.prefix;
        const objectKeyPartial = event.objectKeyPartial;

        const input: ListObjectsV2CommandInput = { // ListObjectsV2Request
            Bucket: bucket, // required
            Prefix: prefix,
        };
        const command = new ListObjectsV2Command(input);
        const output: ListObjectsV2CommandOutput = await client.send(command);

        // Check if the response is NOT success
        if (output.$metadata.httpStatusCode !== 200) {
            console.error(`s3GetRecordingKey(), input= ${JSON.stringify(input)}`);
            console.error(`s3GetRecordingKey(), output= ${JSON.stringify(output)}`);
            return handleException('Failed to list all objects in S3', 's3GetRecordingKey()')
        }

        const foundObject = output.Contents?.find(item =>
            item.Key?.includes(objectKeyPartial)
        );

        // Check if no object was found
        if (typeof foundObject === 'undefined') {
            console.error(`s3GetRecordingKey(), objectKeyPartial= ${JSON.stringify(objectKeyPartial)}`);
            console.error(`s3GetRecordingKey(), output= ${JSON.stringify(output)}`);
            return handleException('Failed to find the specific object in S3', 's3GetRecordingKey()');
        }

        // All success
        const uri = bucket + "/" + prefix + "/" + foundObject.Key;
        const key = foundObject.Key || '';
        response = {
            statusCode: 200,
            body: { uri, key }
        };
        return response;
    } catch (ex) {
        return handleException(ex, 's3GetRecordingKey()')
    }
};