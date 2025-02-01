/**
 * prepare msgs (all msgs contexts) to be sent to LLM, LLM is stateless, so context should be sent
 * @param {*} allMsgs: either there are no msgs as first time call, or there would be msgs.
 * @param {*} userMsg : contains user msg.
 * @returns returning msgs after user-msg is added, as well as, in case first call, system initial direction is added.
 */


import handleException from '../../../Common/handleException/handleException';
import { ItemKey, ErrorResponse } from '../../../Common/constants';

import getInitialMsg from "./getInitialMsg";
import {
    Prompt,
    PrepareMessagesResponse,
    Role,
    InitialMsgResponse
} from "../constants/constants";



const prepareMessages = async (
    previousMsgs: string,
    userMsg: string,
    userName: string,
    key: ItemKey,
    TABLE_Initial_LLM_Message: string
): Promise<PrepareMessagesResponse | ErrorResponse> => {
    // console.log("prepareMessages() at request");
    // console.log(`
    //     prepareMessages(),
    //     previousMsgs=${previousMsgs},
    //     userMsg=${userMsg},
    //     userName=${userName},
    //     key=${key},
    //     TABLE_Initial_LLM_Message=${TABLE_Initial_LLM_Message},
    // `);
    try {
        // general init
        let response: PrepareMessagesResponse = {
            statusCode: 200,
            msgs: []
        };
        let msgs: Array<Prompt> = [];
        if (previousMsgs) {
            // sessionAtt has msgs field, so this is not first call
            //console.log('prepareMessages(): not a first call.');
            msgs = JSON.parse(previousMsgs);
        } else {
            // sessionAtt does not have msgs field, so this is the first call
            //console.log('prepareMessages(): this is the first call.');
            // get initial msgs            
            const result: InitialMsgResponse = await getInitialMsg(TABLE_Initial_LLM_Message, key);
            //console.log('prepareMessages(): getInitialMsg(), result=', JSON.stringify(result));
            // Check if there are errors at getting init mesgs
            if (result.statusCode === 200) {
                //console.log("prepareMessages() Msg:", result?.body?.Msg);
                const tmpContent = result.body!.message.replaceAll("{USER_NAME}", userName);
                //console.log('prepareMessages(): replaced {USER_NAME}');
                msgs.push({
                    role: Role.SYSTEM,
                    content: tmpContent
                });
                //console.log('prepareMessages(): msgs: ', JSON.stringify(msgs));
            } else {
                return handleException(
                    {
                        statusCode: result.statusCode,
                        message: 'Error returned from getInitialMsg() '
                    },
                    'prepareMessages()'
                );
            }
        }
        // Add new user msg to msgs
        msgs.push({
            role: Role.USER,
            content: userMsg,
        });
        response = {
            statusCode: 200,
            msgs: msgs,
        };
        //console.log('prepareMessages(): response: ', JSON.stringify(response));
        // console.log("prepareMessages() at response");
        return response;
    } catch (ex) {
        return handleException(ex, 'prepareMessages()')
    }
};

export default prepareMessages;