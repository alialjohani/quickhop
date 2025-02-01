/**
 * aiGenerateConcisePointsService.ts
 * Let AI to generate the main points from a long texts, and return an array of strings.
 * This will be used as mid step during the matching between the job post and the job seekers, so then
 * the results of this would be sent to AI for the matching process.
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

const enum CALLER {
    concisePoints = "aiGenerateConcisePoints",
};


// many-shots prompt engineering
const aiConcisePointsExamples = [
    // Work Experience example
    new HumanMessage(
        "**Input:** " +
        "The candidate must hold a degree in Computer Science or Engineering. They should demonstrate experience with JavaScript, Python, and database management systems. Having knowledge of DevOps practices like CI/CD is an advantage. Exceptional problem-solving skills are required."
    ),
    new AIMessage(
        `[
            "The candidate must hold a degree in Computer Science or Engineering.",
            "The candidate should demonstrate experience with JavaScript, Python, and database management systems.",
            "Having knowledge of DevOps practices like CI/CD is an advantage.",
            "Exceptional problem-solving skills are required."
        ]`
    ),
];

const schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "array",
    "items": {
        "type": "string"
    }
};
const schemaString = JSON.stringify(schema).replace(/{/g, '{{').replace(/}/g, '}}');

export const aiGenerateConcisePointsService = async (
    userInput: string
): Promise<string[] | void> => {
    try {
        if (userInput === undefined || userInput === null || userInput === "") {
            return [""];
        }

        const prompt = ChatPromptTemplate.fromMessages([
            // System message to set the context
            ["system", `
                You are a precise text-processing assistant. 
                Your task is to transform long text into concise points while adhering strictly to 
                the original content. Follow these rules carefully:
                1. **Input:** You will receive a single long text.
                2. **Output Rules:**
                - Extract points exactly as they appear in the text without adding new concepts, 
                rephrasing, or introducing language that is not in the original text.
                - Each point should directly correspond to a complete thought or requirement found in the input.
                - Preserve the wording and intent of the original text.
                - Do not infer or guess any missing information or concepts.
                3. **Formatting Rules:**
                - Return the output as a JSON array of strings by using this this schema: ${schemaString}, where each string represents a single, verbatim point from the text.
                - Do not modify the meaning or structure of the input beyond dividing it into points.
                4. **Important:** If the input contains ambiguous or unclear content, include it as-is without any changes.
                Here is an example:
            `],
            new MessagesPlaceholder("examples"),
            // User's input
            ["user", "**Input:** {input}"],
        ]);

        const chain = prompt.pipe(modal);
        const response = await chain.invoke({
            input: userInput,
            examples: aiConcisePointsExamples
        });

        // Extract the content
        const rawContent = response.content as string;
        logger.info(`${CALLER.concisePoints}(), input: ${userInput}, examples: ${aiConcisePointsExamples}, rawContent: ${rawContent}`);
        return getCleanedArrayFromAiResponse(rawContent);

    } catch (error) {
        throw new AppError(
            CALLER.concisePoints,
            500,
            "An error occurred while interacting with AI model: " + error
        );
    }

}