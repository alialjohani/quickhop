/**
 * OpenAI SDK request/response messages
 * @param msgs: msgs to be sent for LLM
 * @returns returning the response directly
 */
import OpenAI from "openai";
import * as dotenv from 'dotenv';

import handleException from '../../../Common/handleException/handleException';
import { ErrorResponse } from '../../../Common/constants';


import { OpenAiResponse } from "../constants/constants";
const MODEL: string = process.env.MODEL ?? '';

const openai = new OpenAI({
    apiKey: process.env.API_KEY,
    organization: process.env.ORGANIZATION,
    project: process.env.PROJECT,
});

const CHECKING_SPECIL_CHARS_RANGE = 20;
/**
 * The function is to check if the message from openai/LLM has the special character ($$$$) or not
 * @param msg: Last received msg form ai
 * 
 */
const isMsgHavingSpecialChar = (req: OpenAiResponse): OpenAiResponse => {
    try {
        if (req.msg!.slice(-CHECKING_SPECIL_CHARS_RANGE).includes('{END_CONVERSATION}')) {
            // change isConversationEnded
            req.isConversationEnded = true;
            // console.log('>>> LAST CONV: remove {END_CONVERSATION}');
            req.msg = req.msg?.replace('{END_CONVERSATION}', '');
        }
        // console.log('isMsgHavingSpecialChar() req: ', req);
        // console.log("requestOpenAi() at response");
    } catch (ex) {
        handleException(ex, 'isMsgHavingSpecialChar()')
    } finally {
        return req;
    }
}

// msgs: Array<PrepareMessagesResponse>
const requestOpenAi = async (msgs: any): Promise<OpenAiResponse | ErrorResponse> => {
    // console.log("requestOpenAi() at request");
    try {
        const completion = await openai.chat.completions.create({
            model: MODEL,
            messages: msgs,
            temperature: 0.1,
            top_p: 1.0,
            max_tokens: 100,
            presence_penalty: 0.3,
            frequency_penalty: 0.3
        });
        const aiMsg: string = completion.choices[0].message.content ?? '';

        let response: OpenAiResponse = {
            statusCode: 200,
            msg: aiMsg,
            isConversationEnded: false
        };
        // console.log("requestOpenAi() response: ", JSON.stringify(response));
        return isMsgHavingSpecialChar(response);
    } catch (ex) {
        return handleException(ex, 'requestOpenAi()')
    }
};

export default requestOpenAi;