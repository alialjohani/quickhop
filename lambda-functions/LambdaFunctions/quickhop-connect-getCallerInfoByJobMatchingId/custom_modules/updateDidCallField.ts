/**
 * This function is only to update the DidCall attribute to true,
 * so it prevents in future to make another call.
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, UpdateCommandOutput } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

import { ErrorResponse, DynamoItemReq } from '../../../Common/constants.ts';

import { DID_CALL_ATTRIBUTE } from '../constants/constants.ts'
import handleException from "../../../Common/handleException/handleException.ts";

const updateDidCallField = async (itemReq: DynamoItemReq): Promise<void | ErrorResponse> => {
    try {
        const command: UpdateCommand = new UpdateCommand({
            TableName: itemReq.tableName,
            Key: itemReq.key,
            UpdateExpression: `set ${DID_CALL_ATTRIBUTE} = :didCall`,
            ExpressionAttributeValues: {
                ":didCall": true,
            },
        });
        const response: UpdateCommandOutput = await docClient.send(command);
        console.log("updateDidCallField() response: ", response);
    } catch (ex) {
        return handleException(ex, 'updateDidCallField()');
    }
}

export default updateDidCallField;