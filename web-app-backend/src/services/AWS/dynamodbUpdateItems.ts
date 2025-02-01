/**
 * dynamodbUpdateItems.ts
 * This function is only to update items while the partitionKey's value is unknown,
 * so it updates by any other attribute (name, and value) given to the function.
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { AppError } from "../../errors/AppError";
import logger from "../../utils/logger";


interface UpdateDynamoItems {
    tableName: string;
    partitionKeyName: string;
    updateAttributeName: string;
    updateAttributeValue: any;
    conditionAttributeName: string;
    conditionAttributeValue: any;
}
const CALLER = "dynamodbUpdateItems";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export default async (itemsDetails: UpdateDynamoItems): Promise<void> => {
    const {
        tableName,
        partitionKeyName,
        updateAttributeName,
        updateAttributeValue,
        conditionAttributeName,
        conditionAttributeValue,
    } = itemsDetails;
    try {
        // Step 1: Scan the table to find the partition key value
        const scanCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: `${conditionAttributeName} = :conditionValue`,
            ExpressionAttributeValues: {
                ":conditionValue": conditionAttributeValue,
            },
        });

        const scanResult = await docClient.send(scanCommand);

        if (!scanResult.Items || scanResult.Items.length === 0) {
            logger.error(`${CALLER}, No matching items found to be updated.`);
            return;
        }

        for (const item of scanResult.Items) {
            const partitionKeyValue = item[partitionKeyName];
            if (!partitionKeyValue) {
                logger.error(`${CALLER}, Partition key ${partitionKeyName} not found in item.`);
                continue;
            }

            // Step 2: Update the matching item
            const updateCommand = new UpdateCommand({
                TableName: tableName,
                Key: {
                    [partitionKeyName]: partitionKeyValue,
                },
                UpdateExpression: `SET ${updateAttributeName} = :updateValue`,
                ExpressionAttributeValues: {
                    ":updateValue": updateAttributeValue,
                },
            });

            const updateResult = await docClient.send(updateCommand);
            logger.info(`${CALLER}, item updated successfully, result={${JSON.stringify(updateResult)}}.`);

        }
    } catch (error) {
        throw new AppError(
            CALLER,
            500,
            `Error={${error}} updating itemDetails={${JSON.stringify(itemsDetails)}}}.`
        );
    }
};