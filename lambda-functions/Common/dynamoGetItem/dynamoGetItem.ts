/** 
 * This is general function to get an item from any table.
 * To read an item, this function needs: item key to get an item, and the table name.
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, DynamoDBDocumentClient, GetCommandOutput } from "@aws-sdk/lib-dynamodb";

import { ErrorResponse, DynamoItemReq, DynamoItemRes } from '../constants';
import handleException from "../handleException/handleException";

const client: DynamoDBClient = new DynamoDBClient({});
const docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client);



/**
 * Expected a table name and a key to return the item from DynamoDB Table.
 * @param event: DynamoItemReq 
 * @returns response: DynamoItemRes
 */
export const dynamoGetItem = async (event: DynamoItemReq): Promise<DynamoItemRes | ErrorResponse> => {

    try {
        let response: DynamoItemRes = {
            statusCode: 200,
            body: {},
        };
        const tableName = event.tableName;
        const key = event.key;
        const command = new GetCommand({
            TableName: tableName,
            Key: key,
        });
        const output: GetCommandOutput = await docClient.send(command);

        // Check if the response is NOT success
        if (output.$metadata.httpStatusCode !== 200) {
            console.error(`dynamoGetItem(), command= ${JSON.stringify(command)}`);
            console.error(`dynamoGetItem(), output= ${JSON.stringify(output)}`);
            return handleException('Failed to get items', 'dynamoGetItem()');
        }

        response = {
            statusCode: 200,
            body: output.Item
        };
        return response;
    } catch (ex) {
        return handleException(ex, 'dynamoGetItem()');
    }
};
