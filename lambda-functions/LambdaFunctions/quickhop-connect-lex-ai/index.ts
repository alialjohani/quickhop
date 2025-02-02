/**
 * This function is called continuously from Lex (for each request to LLM ex. OpenAI)
 * LLM is stateless, therefore, sessionAttribute is used to keep the session data,
 * so it will be sent for LLM.
 * For first req, there are no session (sessionAttribute messages), we only need to get initial message,
 * to direct LLM of its role.
 * For second req and after, we get sessionAttribute data from the event to access the previous context.
 * So, we keep all data in the sessionAttribute.
 */

import { LexEvent, LexV2Event } from 'aws-lambda';
import prepareMessages from './custom_modules/prepareMessages';
import requestOpenAi from './custom_modules/requestOpenAi';

import handleException from '../../Common/handleException/handleException';
import { ItemKey, ErrorResponse } from '../../Common/constants';

import { PrepareMessagesResponse, OpenAiResponse, Role } from './constants/constants';
import dotenv from 'dotenv'
dotenv.config();

// All required env variables for this Lambda function:
// process.env.MODEL
// process.env.API_KEY,
// process.env.ORGANIZATION,
// process.env.PROJECT,
const INTENT_NAME = process.env.LEX_INTENT_NAME;
const TABLE_Initial_LLM_Message = process.env.TABLE_Initial_LLM_Message as string;

/**
 *
 * @param event: expected it is passed from AWS Lex. sessionAttributes is defined from Lex.
 * @returns response in specific format according to Lex required response.
 *          sessionAttributes in response collects messagesto provide LLM context.
 */
export const handler = async (event: LexV2Event): Promise<any> => {
    // console.log("handler() at request")
    // console.log("handler() at request event: ", JSON.stringify(event))
    try {

        // Get values from Connect flow
        const initialMsgKey: ItemKey = {
            JobPostId: event!.sessionState!.sessionAttributes!.JobPostId, // Passed from Connect Flow
        };
        const userName: string = event!.sessionState!.sessionAttributes!.Name; // Passed from Connect Flow
        // Start processing for the response
        let response: any;
        let previousMsgs: string = event!.sessionState!.sessionAttributes!.msgs ?? ''; // Get all previous conversations if already exist
        const userMsg: string = event.inputTranscript ?? "";
        let allMsgs: PrepareMessagesResponse; // to hold all prompt messages (previous and new msgs)
        // console.log("handler() at request, event:", JSON.stringify(event));
        //console.log("handler() at request, previousMsgs:", JSON.stringify(previousMsgs));

        // start prepare msgs (either as first time or more)
        allMsgs = await prepareMessages(previousMsgs, userMsg, userName, initialMsgKey, TABLE_Initial_LLM_Message);
        // check if the preparation has no errors
        //console.log("handler allMsgs:", JSON.stringify(allMsgs));
        if (allMsgs.statusCode === 200) {
            // send all msgs to ai and get back its msg response
            const AIMsgResponse: ErrorResponse | OpenAiResponse = await requestOpenAi(allMsgs.msgs);
            //console.log("handler AIMsgResponse:", JSON.stringify(AIMsgResponse));

            if (AIMsgResponse.statusCode === 200) {
                const AIRes: OpenAiResponse = AIMsgResponse as OpenAiResponse;
                allMsgs?.msgs?.push({
                    role: Role.ASSISTANT,
                    content: AIRes.msg ?? '',
                });
                // console.log('>>> AIRes: ', JSON.stringify(AIRes));
                const maxSpeechDuration = 30000;
                const maxLength = 15000;
                response = {
                    sessionState: {
                        sessionAttributes: {
                            'x-amz-lex:max-speech-duration-ms:*:*': maxSpeechDuration.toString(),
                            'x-amz-lex:audio:max-length-ms:*:*': maxLength.toString(),
                            // 'x-amz-lex:allow-interrupt:*:*': true,
                            msgs: JSON.stringify(allMsgs.msgs),
                        },
                        dialogAction: {
                            type: AIRes.isConversationEnded ? "Close" : "ElicitIntent", // if interview ended, close Lex
                        },
                        intent: {
                            name: INTENT_NAME,
                            state: AIRes.isConversationEnded ? "Fulfilled" : "InProgress" // if interview ended, fulfill intent in Lex
                        }
                    },
                    messages: [
                        {
                            contentType: "PlainText",
                            content: AIRes.msg ?? '',
                        },
                    ],
                };
                console.log('handler() response: ', JSON.stringify(response));
                return response;
            }
            else {
                return handleException(
                    {
                        statusCode: AIMsgResponse.statusCode,
                        message: 'Error returned from requestOpenAi()'
                    },
                    'handler()'
                );
            }
        }
        else {
            return handleException(
                {
                    statusCode: allMsgs.statusCode,
                    message: 'Error returned from prepareMessages()'
                },
                'handler()'
            );
        }
    } catch (ex) {
        return handleException(ex, 'handler()');
    }
};
