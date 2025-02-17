/**
 * aiMatchingService.ts
 * Let AI to decide and calculate if a job seeker fits to a job post. 
 */

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";


import { AppError } from "../../errors/AppError";

import { AiMatchingInput } from "../../interfaces/common";
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
    temperature: 0.3,
    apiKey: OPENAI_API_KEY,
    verbose: false
});

const enum CALLER {
    matching = "aiMatchingService",
};


const schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "description": "The response includes a boolean qualification decision, the calculated matching score, and feedback explaining the decision.",
    "properties": {
        "qualified": {
            "type": "boolean",
            "description": "Whether the candidate is qualified (true) or not (false)."
        },
        "matchingScore": {
            "type": "number",
            "description": "The calculated matching score of the candidate, scaled to a maximum of 100."
        },
        "feedback": {
            "type": "string",
            "description": "Detailed feedback explaining the reasons behind the qualification decision and matching score."
        }
    },
    "required": ["qualified", "matchingScore", "feedback"],
    "additionalProperties": false
};

const schemaString = JSON.stringify(schema).replace(/{/g, '{{').replace(/}/g, '}}');

export const aiMatchingService = async (
    userInput: AiMatchingInput
): Promise<boolean | void> => {
    try {

        const prompt = ChatPromptTemplate.fromMessages([
            // System message to set the context
            ["system",
                `
                You are an advanced evaluation AI. You will evaluate a candidate's CV against a job posting and determine whether the candidate is qualified based on the following detailed instructions:
                
                ### Instructions:
                1. **Evaluate Required Qualifications**:
                   - Check if all items in the "Required Qualifications" section of the job posting are present in the candidate's CV.
                   - If any required qualification is missing:
                     - Set "qualified" to false.
                     - Set "matchingScore" to 0.
                     - Provide a clear explanation in the "feedback" field, detailing which qualifications are missing and why the candidate is not qualified.
                     - Respond without further evaluation.
        
                2. **Assign a Matching Score**:
                   - If all required qualifications are met, evaluate the CV based on the job posting criteria and calculate a **Matching Score**:
                     - **Matching Score Formula**:
                       - **Education**: Weighted at 25% of the total score.
                         - Match CV education details against:
                           - Job Description (50% match)
                           - Preferred Qualifications (30% match)
                           - Job Responsibility (20% match)
                       - **Work History**: Weighted at 65% of the total score.
                         - Match CV work history details against:
                           - Job Responsibility (60% match)
                           - Job Description (30% match)
                           - Preferred Qualifications (10% match)
                       - **Certifications**: Weighted at 10% of the total score.
                         - Match CV certifications against:
                           - Preferred Qualifications (50% match)
                           - Job Description (30% match)
                           - Job Responsibility (20% match)
                     - Ensure that each section contributes proportionally to the final Matching Score.
                     - Scale the score for each section to a maximum of 100 before applying the weight.
                     - Calculate the **total Matching Score** by adding up the weighted contributions from each section.
                   - Provide a detailed explanation in the "feedback" field, outlining how the score was calculated for each section and how it contributes to the total score.
        
                3. **Compare Against Minimum Score**:
                   - If the **Matching Score** is **less than** the "Minimum Accepted Matching Score":
                     - Set "qualified" to false.
                     - Provide an explanation in the "feedback" field about the insufficient score and how it falls short of the required minimum.
                   - If the **Matching Score** is **greater than or equal to** the "Minimum Accepted Matching Score":
                     - Set "qualified" to true.
                     - Provide feedback explaining the factors contributing to the successful qualification.
        
                4. **Final Decision**:
                   - Return the evaluation result as an object with three fields:
                       "qualified": true/false,
                       "matchingScore": calculated_score,
                       "feedback": detailed explanation
                   - Ensure your response strictly adheres to this format using the schema ${schemaString}.`
            ],
            // User's input
            ["user", "{input}"],
            ["user", `Evaluate the candidate strictly based on these instructions. Your response must include "qualified" (boolean), "matchingScore" (number), and "feedback" (string), adhering to the schema.`]
        ]);




        const chain = prompt.pipe(modal);
        const input = JSON.stringify({ ...userInput });
        const response = await chain.invoke({ input });


        const rawContent = response.content as string;
        logger.info(`${CALLER.matching}(), input: ${input}, rawContent: ${rawContent}`);
        const cleanedResponse = rawContent.replace(/^```json\n|\n```$/g, '');
        const parsedResponse = JSON.parse(cleanedResponse);

        const result = parsedResponse.qualified === true
            ? true
            : parsedResponse.qualified === false
                ? false
                : (() => {
                    throw new AppError(
                        CALLER.matching,
                        500,
                        "An error occurred while interacting with AI model: not returning a boolean."
                    );
                })();

        return result;

    } catch (error) {
        throw new AppError(
            CALLER.matching,
            500,
            "An error occurred while interacting with AI model: " + error
        );
    }

}