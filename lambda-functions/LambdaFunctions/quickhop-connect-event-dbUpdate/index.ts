/**
 * When the call is disconnected, the eventBridge emits this function through Step Functions.
 * Background info: when call is disconnected, the AWS Connect saves the recording in S3, and this 
 * function gets the key of the recording and saves the key in DB, 
 * and updates the DB to save the datetime when the call interview is completed.
 * 
 * This function does the following: 
 *  - update the OpportunityResults table in DB:
 *      > recordingUri field: to store the recordingKey (passed from quickhop-connect-event-recording Lambda by state functions)
 *      >  interviewCompletionDate field: to store the call completing datetime 
 */
import {
    DatabaseConfiguration,
    ErrorResponse,
    Response,
    UpdateTwoFieldsDatabase
} from '../../Common/constants';
import handleException from '../../Common/handleException/handleException';

import { updateDB } from '../../Common/updateDB/updateDB';
import { SecretManager } from '../../Common/SecretManager/SecretManager';
import dotenv from 'dotenv'
dotenv.config();

const dbConfig: DatabaseConfiguration = {
    host: process.env.DB_HOST || '', // e.g., 'your-database-endpoint.amazonaws.com'
    port: parseInt(process.env.DB_PORT || "5432", 10), // default PostgreSQL port
    user: process.env.DB_USER || '', // database username
    password: '',
    database: process.env.DB_NAME || '', // database name
    ssl: {
        require: true,
        rejectUnauthorized: false,
    }
};
const DB_PASSWORD_ARN = process.env.DB_PASSWORD_ARN || ''; // ARN Secret Manager for the password

const TABLE_NAME = 'OpportunityResults';
const URI_RECORDING_DB_FIELD_NAME = 'recordingUri';
const INTERVIEW_DATE_DB_FIELD_NAME = 'interviewCompletionDate';

export const handler = async (event: any): Promise<Response | ErrorResponse> => {
    try {
        console.log(">>> event passed from State Function = ", JSON.stringify(event))
        if (dbConfig.password === '') {
            // if password not saved from previous call, then retrieve it 
            dbConfig.password = await SecretManager(DB_PASSWORD_ARN);
        }
        console.log(">>> dbConfig= ", JSON.stringify(dbConfig))
        if (dbConfig.password === '') {
            return handleException({
                statusCode: 500,
                message: 'Error from  SecretManager()'
            },
                'handler quickhop-connect-event-dbUpdate()'
            );
        }

        const response: Response = {
            statusCode: 200
        };

        // Extract expected passed values from the State Functions:
        const recordingKey: string = event.recordingKey;
        const datetime: string = event.datetime;
        const rowIdToUpdate: string = event.OpportunityResultId;

        // Prepare values for OpportunityResult table in order to update interviewCompletionDate
        const row: UpdateTwoFieldsDatabase = {
            tableName: TABLE_NAME,
            field1: INTERVIEW_DATE_DB_FIELD_NAME,
            value1: datetime,
            field2: URI_RECORDING_DB_FIELD_NAME,
            value2: recordingKey,
            condition: {
                column: 'id',
                value: rowIdToUpdate
            }
        }

        console.log(">>> row= ", JSON.stringify(row));

        const dbRes: Response | ErrorResponse = await updateDB(dbConfig, row);
        console.log(">>> dbRes= ", JSON.stringify(dbRes));
        if (dbRes.statusCode !== 200) {
            // An error occurred
            return handleException(
                {
                    statusCode: dbRes.statusCode,
                    message: 'Error returned from updateDB() '
                },
                'handler handler quickhop-connect-event-dbUpdate()'
            );
        }
        console.log(">>> response= ", JSON.stringify(response));
        return response;
    } catch (error) {
        return handleException(error, 'handler quickhop-connect-event-dbUpdate()');
    }
};