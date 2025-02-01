/**
 * This function is called from IVR, it has two purposes that:
 *      - read item from DynamoDB table (get caller info)
 *      - and update the attribute (DidCall) on the item to be True.
 * In IVR, Caller enters oneTimeAccessKey, then this function is called.
 * Based on oneTimeAccessKey, the function returns the item (some info about the caller) that
 * matches oneTimeAccessKey.
 * The item has following attributes:
 *  - name,
 *  - JobPostId: this would be used later to search another table to get initial existing prompt for LLM,
 *  - DidCall: if caller made the call before or not (for job posting a candidate has one interview),
 *  - TTL: if job posting is still valid (each job posting has an end date/time)
 *    (Note: TTL means time to live)
 * After it gets the item, it also would update DidCall to true to indicate this call is made.
 */
import { ConnectContactFlowEvent } from 'aws-lambda';
import { ErrorResponse, DynamoItemReq } from '../../Common/constants.ts';
import handleException from '../../Common/handleException/handleException.ts';

import { ONE_TIME_ACCESS_KEY, CallerRecordResponse, RESULTS } from './constants/constants.ts'
import getCallerRecord from './custom_modules/getCallerRecord.ts';
import updateDidCallField from './custom_modules/updateDidCallField.ts';
import dotenv from 'dotenv'
dotenv.config();

const TABLE_NAME = process.env.TABLE_NAME ?? '';
const CALLER_COUNTER_TABLE_NAME = process.env.CALLER_COUNTER_TABLE_NAME ?? '';
const CALLER_COUNTER_PRIMARY_FIELD = process.env.CALLER_COUNTER_PRIMARY_FIELD ?? ''
const CALLER_COUNTER_COUNTER_FIELD = process.env.CALLER_COUNTER_COUNTER_FIELD ?? ''

export const handler = async (event: ConnectContactFlowEvent): Promise<CallerRecordResponse | ErrorResponse> => {
    try {
        const phoneNumber: string = event.Details.ContactData.CustomerEndpoint!.Address;
        const OneTimeAccessKey: string = event.Details.Parameters["OneTimeAccessKey"]; // Defined field from connect flow 
        console.log('handler() phoneNumber: ', phoneNumber);
        console.log('handler() OneTimeAccessKey: ', OneTimeAccessKey);
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
        // Get caller record (item)
        const itemReq: DynamoItemReq = {
            tableName: TABLE_NAME,
            key: {
                [ONE_TIME_ACCESS_KEY]: OneTimeAccessKey
            }
        };



        const callerResult: CallerRecordResponse | ErrorResponse = await getCallerRecord(
            itemReq,
            phoneNumber,
            CALLER_COUNTER_TABLE_NAME,
            CALLER_COUNTER_PRIMARY_FIELD,
            CALLER_COUNTER_COUNTER_FIELD
        );
        if (callerResult.statusCode === 200) {
            const result = callerResult as CallerRecordResponse;
            if (
                result.body.OneTimeAccessKey !== '' // assure there are body data populated in result.body; if not, then no item
                && result.msgResult !== RESULTS.PHONE_NOT_MATCH
                && result.msgResult !== RESULTS.ALREADY_CALLED
                && result.msgResult !== RESULTS.JOB_EXPIRED
            ) {
                // Change the attribute DidCall to True
                console.log('handler() calling updateDidCallField() with itemReq: ', itemReq);
                const updateDidCallRes: void | ErrorResponse = await updateDidCallField(itemReq);
                if (updateDidCallRes?.statusCode) {
                    // An error occurred
                    return handleException(
                        {
                            statusCode: updateDidCallRes.statusCode,
                            message: 'Error returned from updateDidCallField() '
                        },
                        'handler hr-getCallerInfoByOneTimeAccessKey()'
                    );
                }
            }
            response.statusCode = result.statusCode;
            response.body = result.body;
            response.msgResult = result.msgResult;
            console.log('handler() response: ', response);
            return response;

        } else {
            // An error occurred
            return handleException(
                {
                    statusCode: callerResult.statusCode,
                    message: 'Error returned from getCallerRecord() '
                },
                'handler hr-getCallerInfoByOneTimeAccessKey()'
            );
        }

    } catch (ex) {
        return handleException(ex, 'handler hr-getCallerInfoByOneTimeAccessKey')
    }
};
