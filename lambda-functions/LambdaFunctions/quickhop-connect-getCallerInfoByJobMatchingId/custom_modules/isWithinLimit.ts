/**
 * isWithinLimit.ts
 * 
 * This file check if the caller (candidate) is within the allowed maxCandidate number.
 * Each proceeded candidate adds a one to the Table to track how many candidate so far we have.
 * This function deals with concurrent by using DynamoDB transactions.
 */
import {
    DynamoDBClient,
    UpdateItemCommand,
    GetItemCommand,
} from "@aws-sdk/client-dynamodb";


const client: DynamoDBClient = new DynamoDBClient({});

// Function to check if the counter is within the limit
const checkLimit = async (
    jobPostId: string,
    CALLER_COUNTER_TABLE_NAME: string,
    CALLER_COUNTER_PRIMARY_FIELD: string,
    CALLER_COUNTER_COUNTER_FIELD: string,
    allowedTotalNumber: number
): Promise<boolean> => {
    const getParams = {
        TableName: CALLER_COUNTER_TABLE_NAME,
        Key: {
            [CALLER_COUNTER_PRIMARY_FIELD]: { S: jobPostId },
        },
        ProjectionExpression: CALLER_COUNTER_COUNTER_FIELD, // Fetch only the counter field
    };

    const getResult = await client.send(new GetItemCommand(getParams));

    const currentValue = getResult.Item?.[CALLER_COUNTER_COUNTER_FIELD]?.N
        ? parseInt(getResult.Item[CALLER_COUNTER_COUNTER_FIELD].N, 10)
        : 0;

    console.log("checkLimit(): Current counter value:", currentValue);
    return currentValue < allowedTotalNumber;
};

// Function to increment the counter
const incrementCounter = async (
    jobPostId: string,
    CALLER_COUNTER_TABLE_NAME: string,
    CALLER_COUNTER_PRIMARY_FIELD: string,
    CALLER_COUNTER_COUNTER_FIELD: string
): Promise<void> => {
    const updateParams = {
        TableName: CALLER_COUNTER_TABLE_NAME,
        Key: {
            [CALLER_COUNTER_PRIMARY_FIELD]: { S: jobPostId },
        },
        UpdateExpression: "SET #count = #count + :inc",
        ExpressionAttributeNames: {
            "#count": CALLER_COUNTER_COUNTER_FIELD,
        },
        ExpressionAttributeValues: {
            ":inc": { N: "1" },
        },
        ReturnValues: "UPDATED_NEW" as const,
    };

    const updateResult = await client.send(new UpdateItemCommand(updateParams));
    console.log("incrementCounter(): Counter incremented. Result:", updateResult);
};

// Main function
export const isWithinLimit = async (
    allowedTotalNumber: number,
    jobPostId: string,
    CALLER_COUNTER_TABLE_NAME: string,
    CALLER_COUNTER_PRIMARY_FIELD: string,
    CALLER_COUNTER_COUNTER_FIELD: string
): Promise<boolean> => {
    console.log(`
        isWithinLimit():
        allowedTotalNumber=${allowedTotalNumber},
        jobPostId=${jobPostId},
        CALLER_COUNTER_TABLE_NAME=${CALLER_COUNTER_TABLE_NAME},
        CALLER_COUNTER_PRIMARY_FIELD=${CALLER_COUNTER_PRIMARY_FIELD},
        CALLER_COUNTER_COUNTER_FIELD=${CALLER_COUNTER_COUNTER_FIELD},
    `);

    try {
        // Step 1: Check if the limit condition is met
        const isAllowed = await checkLimit(
            jobPostId,
            CALLER_COUNTER_TABLE_NAME,
            CALLER_COUNTER_PRIMARY_FIELD,
            CALLER_COUNTER_COUNTER_FIELD,
            allowedTotalNumber
        );

        if (!isAllowed) {
            console.log("isWithinLimit(): Condition check failed. Limit reached.");
            return false; // Condition failed, limit reached
        }

        // Step 2: Increment the counter
        await incrementCounter(
            jobPostId,
            CALLER_COUNTER_TABLE_NAME,
            CALLER_COUNTER_PRIMARY_FIELD,
            CALLER_COUNTER_COUNTER_FIELD
        );

        console.log("isWithinLimit(): Successfully incremented counter.");
        return true; // Condition met, and counter incremented
    } catch (err) {
        console.error("isWithinLimit(): Error processing request:", err);
        throw err; // Rethrow errors for the caller to handle
    }
};