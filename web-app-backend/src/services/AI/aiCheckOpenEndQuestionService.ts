/**
 * aiCheckOpenEndQuestionService.ts
 * Check with AI if the question is an open end question (not short-answer).
 * The open end question is not supported in Amazon Connect with Lex, 
 * because the caller can have up to 15 seconds to finish speaking.
 * So at this time, only short-answer questions are supported due this limitation.
 */
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder, } from "@langchain/core/prompts";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

import { AppError } from "../../errors/AppError";
import { getCleanedArrayFromAiResponse } from "../../utils/helpers";
import * as dotenv from "dotenv";
import logger from "../../utils/logger";
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "";

if (!OPENAI_API_KEY) {
    throw new Error(" >>> OpenAI API key not found in environment variables <<< ");
}

const modal = new ChatOpenAI({
    modelName: OPENAI_MODEL,
    temperature: 0.1,
    apiKey: OPENAI_API_KEY,
});

const CALLER = "aiCheckOpenEndQuestion";

interface AiResult {
    question: string;
    isOpenEnded: boolean
};

const schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
        "question": {
            "type": "string",
            "description": "The interview question to be analyzed"
        },
        "isOpenEnded": {
            "type": "boolean",
            "description": "Indicates whether the question is open-ended (true) or short-answer (false)"
        }
    },
    "required": ["question", "isOpenEnded"]
};

const schemaString = JSON.stringify(schema).replace(/{/g, '{{').replace(/}/g, '}}');

// 'false' is the question that is supported by the system (which we want) 
// 'true' is the question that is not supported by the system 
export const aiCheckOpenEndQuestionService = async (
    userInput: string
): Promise<boolean | void> => {
    try {
        //console.log('>>> userInput: ', userInput)
        if (userInput === undefined || userInput === null || userInput === "") {
            logger.error(CALLER + ', userInput is empty.')
            return true;
        }

        const prompt = ChatPromptTemplate.fromMessages([
            // System message to set the context
            ["system", `
            You are tasked with analyzing interview questions to determine whether they are open-ended or short-answer. 
            Use the following definitions and rules to guide your analysis:

            **Definitions**:
            1. A **short-answer question** is one that can be answered concisely in less than 10 seconds, typically with a single word, 
            number, brief phrase, or one sentence.
            2. An **open-ended question** invites long explanations, detailed responses, multiple sentences, or answers that exceed 10 seconds.

            **EXAMPLE 1**
            question: "How long have you worked in this field?", "isOpenEnded": false

            **EXAMPLE 2**
            "question": "Can you describe your most significant career achievement?", "isOpenEnded": true

            **EXAMPLE 3**
            "question": "Where are you currently based?", "isOpenEnded": false

            **Rules**:
            - If the question can be answered concisely within 10 seconds, return **false** (not an open-ended question).
            - If the question is likely to lead to long explanations, stories, or multiple sentences, return **true** (an open-ended question).
            - Return the output as a JSON by using this this schema: ${schemaString}.
            `],
            // User's input
            ["user", "{input}"],
        ]);

        const chain = prompt.pipe(modal);
        const response = await chain.invoke({
            input: userInput,
        });

        // Extract the content
        const rawContent = response.content as string;
        const cleanedContent = rawContent.replace(/```json|```|\n/g, '').trim();
        const result = JSON.parse(cleanedContent);
        logger.info(`${CALLER}(), input: ${userInput}, result: ${cleanedContent}`);

        return result['isOpenEnded'];

    } catch (error) {
        throw new AppError(
            CALLER,
            500,
            "An error occurred while interacting with AI model: " + error
        );
    }

}