/**
 * Based on OneTimeAccessKey, the function returns the item (some info about the caller) that 
 * matches OneTimeAccessKey.
 * This function returns the result for AWS Connect flow if the candidate can proceed or not.
 * If cannot proceed, the msgReult indicate an error type, so the appropriate prompt will be played for 
 * the caller.
 */


import * as dotenv from 'dotenv';
import { dynamoGetItem } from '../../../Common/dynamoGetItem/dynamoGetItem.ts';
import { ErrorResponse, DynamoItemReq, DynamoItemRes } from '../../../Common/constants.ts';
import handleException from '../../../Common/handleException/handleException.ts'

import { CallerRecordResponse, RESULTS } from '../constants/constants.ts'
import { isWithinLimit } from './isWithinLimit.ts';

/**
 * To compare time stamp
 * @param jonPostingDateTime : unix time stamp
 * @returns : true if expired, false if still valid
 */
const isExpired = (jonPostingDateTime: number): boolean => {
    const currentDateTime: number = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
    // Check if jonPostingDateTime is expired
    if (jonPostingDateTime <= currentDateTime) {
        return true;
    } else {
        return false;
    }
}

/**
 * This function calls Lambda Layer "" to get item from DynamoDB
 * Then, it checks IF:
 *  - if there are Error
 *  - if item exist
 *  - if the job due date (TTL) is still valid
 *  - if the caller made the call before (DidCall) 
 * @param itemReq 
 * @returns CallerRecordResponse or ErrorResponse
 */

const getCallerRecord = async (
    itemReq: DynamoItemReq,
    phoneNumber: string,
    CALLER_COUNTER_TABLE_NAME: string,
    CALLER_COUNTER_PRIMARY_FIELD: string,
    CALLER_COUNTER_COUNTER_FIELD: string,
): Promise<CallerRecordResponse | ErrorResponse> => {
    try {
        let response: CallerRecordResponse = {
            statusCode: 200,
            msgResult: RESULTS.FOUND,
            body: {
                OneTimeAccessKey: '',
                Name: '',
                JobPostId: '',
                OpportunityResultId: '',
                JobSeekerEmail: '',
                RecruiterEmail: '',
                maxCandidates: '',
                DidCall: true,
                TTL: 0,
                PhoneNumber: '',
                isActive: true,
            }
        };

        const itemRes: DynamoItemRes = await dynamoGetItem(itemReq);
        console.log('getCallerRecord() itemRes: ', itemRes);
        if (itemRes.statusCode === 200) {
            console.log('getCallerRecord(), with statusCode=200, itemRes:', itemRes);
            if (!itemRes.body) {
                // No item is found in DynamoDB
                response.msgResult = RESULTS.NOT_FOUND;
                return response;
            }
            // Check if phoneNumbers do not match
            if (itemRes.body.PhoneNumber !== phoneNumber) {
                response.msgResult = RESULTS.PHONE_NOT_MATCH;
                return response;
            }
            // Check DidCall
            if (itemRes.body!.DidCall) {
                // already called before, and each caller has one call chance
                response.msgResult = RESULTS.ALREADY_CALLED;
                return response;
            }
            // Check if job posting is still valid, and if still active
            if (isExpired(itemRes.body!.TTL) || !itemRes.body.isActive) {
                response.msgResult = RESULTS.JOB_EXPIRED;
                return response;
            }
            // Check if the total accepted candidates have been exceeded
            const isInLimit = await isWithinLimit(
                itemRes.body.maxCandidates,
                itemRes.body.JobPostId,
                CALLER_COUNTER_TABLE_NAME,
                CALLER_COUNTER_PRIMARY_FIELD,
                CALLER_COUNTER_COUNTER_FIELD,
            );
            if (!isInLimit) {
                response.msgResult = RESULTS.NOT_ACCEPTING_CANDIDATES;
                return response;
            }
            // if pass, everything is fine
            // Prepare response
            response.body!.OneTimeAccessKey = itemRes.body!.OneTimeAccessKey;
            response.body!.Name = itemRes.body!.Name;
            response.body!.JobPostId = itemRes.body!.JobPostId;
            response.body!.OpportunityResultId = itemRes.body!.OpportunityResultId;
            response.body!.JobSeekerEmail = itemRes.body!.JobSeekerEmail;
            response.body!.RecruiterEmail = itemRes.body!.RecruiterEmail;
            response.body!.DidCall = itemRes.body!.DidCall;
            response.body!.TTL = itemRes.body!.TTL as number;
            response.body!.PhoneNumber = itemRes.body!.PhoneNumber;
            response.body!.isActive = itemRes.body!.isActive;

            return response;
        } else {
            // throw error
            return handleException(
                {
                    statusCode: itemRes.statusCode,
                    message: 'Error returned from dynamoGetItem() '
                },
                'getCallerRecord()'
            );
        }
    } catch (ex) {
        return handleException(ex, 'getCallerRecord()')
    }
};

export default getCallerRecord;