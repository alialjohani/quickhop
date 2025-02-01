/**
 * When the call is disconnected, the eventBridge emits this function through Step Functions.
 * Background info: when call is disconnected, the AWS Connect saves the recording in S3, and this 
 * function then adds tags to the recording.
 * 
 * This function does the following: 
 *  - update the call recording tags that saved in S3 at the end of the call,
 */

import { ErrorResponse, RecordingEventRes, Response, S3TagItemReq, S3UriItemReq, S3UriItemRes } from '../../Common/constants';
import handleException from '../../Common/handleException/handleException';
import { s3GetRecordingKey } from '../../Common/s3GetRecordingKey/s3GetRecordingKey';
import { s3AddTags } from '../../Common/s3AddTags/s3AddTags';
import dotenv from 'dotenv'
dotenv.config();

const S3_BUCKET = process.env.S3_BUCKET ?? 'quickhop';
const S3_RECORDING_BASE_PREFIX = process.env.s3_RECORDING_BASE_PREFIX ?? 'connect/testingenv/CallRecordings/ivr/';

const AWS_S3_TAG_RECRUITER = 'allowed-email-recruiter'; // This defined in Backed Web App, same var name
const AWS_S3_TAG_JOBSEEKER = 'allowed-email-JOBSEEKER'; // This defined in Backed Web App, same var name

export const handler = async (event: any): Promise<string | ErrorResponse> => {
    try {
        let response: RecordingEventRes = {
            statusCode: 200,
            recordingKey: ''
        };
        // Extract required fields from the event, and prepared  
        const contactId: string = event.detail.contactId;
        const datetime: string = event.detail.disconnectTimestamp;
        const JobSeekerEmail: string = event.detail.tags.JobSeekerEmail;
        const RecruiterEmail: string = event.detail.tags.RecruiterEmail;

        // Find the new added Recording in the bucket that is related to the contactId
        // Prepare the 'Prefix' path to get the recording object
        const [year, month, day] = datetime.split("T")[0].split('-');
        const item: S3UriItemReq = {
            bucket: S3_BUCKET,
            prefix: S3_RECORDING_BASE_PREFIX + year + '/' + month + '/' + day + '/',
            objectKeyPartial: contactId
        };
        const keyResponse: S3UriItemRes | ErrorResponse = await s3GetRecordingKey(item);
        if (keyResponse.statusCode !== 200) {
            // An error occurred
            return handleException(
                {
                    statusCode: keyResponse.statusCode,
                    message: 'Error returned from s3GetRecordingKey() '
                },
                'handler handler quickhop-connect-event-recording()'
            );
        }
        // Now add tags to the recording object, 
        // so these tags will be evaluated when a request is made on these object from Backend Web App
        const key = (keyResponse as S3UriItemRes).body?.key || '';
        const itemTagReq: S3TagItemReq = {
            bucket: S3_BUCKET,
            key: key,
            firstTagKey: AWS_S3_TAG_RECRUITER,
            firstTagValue: JobSeekerEmail,
            secondTagKey: AWS_S3_TAG_JOBSEEKER,
            secondTagValue: RecruiterEmail
        }
        const tagsRes: Response | ErrorResponse = await s3AddTags(itemTagReq);
        if (tagsRes.statusCode !== 200) {
            return handleException(
                {
                    statusCode: tagsRes.statusCode,
                    message: 'Error returned from s3AddTags() '
                },
                'handler handler quickhop-connect-event-recording()'
            );
        }
        response.recordingKey = key;
        console.log('response: ', JSON.stringify(response));
        return response;
    } catch (error) {
        return handleException(error, 'handler quickhop-connect-event-recording()');
    }
};