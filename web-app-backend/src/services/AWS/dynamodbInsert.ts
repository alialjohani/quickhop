import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { JobPostPhoneCallCounterRecord, JobPostPhoneCallRecord, JobSeekerPhoneCallRecord } from "../../interfaces/common";
import { AppError } from "../../errors/AppError";
import logger from "../../utils/logger";
import dotenv from 'dotenv';
dotenv.config();


const AWS_REGION = process.env.AWS_REGION || '';

const CALLER = "dynamodbInsert";
// Initialize the DynamoDB client
const ddbClient = new DynamoDBClient({ region: AWS_REGION }); // Change region as needed
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Function to insert an item into DynamoDB
export default async (tableName: string, item: JobSeekerPhoneCallRecord | JobPostPhoneCallRecord | JobPostPhoneCallCounterRecord) => {

    const params = {
        TableName: tableName,
        Item: item,
    };
    try {
        const result = await ddbDocClient.send(new PutCommand(params));
        logger.info(`${CALLER}, item inserted successfully, result={${JSON.stringify(result)}}.`);
    } catch (error) {
        throw new AppError(
            CALLER,
            500,
            `Error={${error}} inserting item={${JSON.stringify(item)}}, in table={${tableName}}.`
        );
    }
};
