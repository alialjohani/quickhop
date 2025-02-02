/**  
 *   This function is to read initial msg from TABLE
 *   Each job posting, has its own initial msg (prompt) to start with LLM converations (direct system to assist)
 *   This depends on dynamoGetItem Layer 
 */


import * as dotenv from 'dotenv';

import { dynamoGetItem } from '../../../Common/dynamoGetItem/dynamoGetItem';
import { ItemKey, ErrorResponse, DynamoItemReq } from '../../../Common/constants';
import handleException from '../../../Common/handleException/handleException';

import { InitialMsgResponse } from '../constants/constants';

const getInitialMsg = async (TABLE_Initial_LLM_Message: string, key: ItemKey): Promise<InitialMsgResponse | ErrorResponse> => {
    try {
        // console.log("getInitialMsg() at request");
        const itemReq: DynamoItemReq = {
            tableName: TABLE_Initial_LLM_Message,
            key: key,
        };
        // console.log("getInitialMsg() at response");
        return await dynamoGetItem(itemReq);
    } catch (ex) {
        return handleException(ex, 'getInitialMsg()')
    }
};

export default getInitialMsg;