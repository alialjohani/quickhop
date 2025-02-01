/**
 * aiGenerateInterviewQuestionsService.ts
 * Let AI to suggest interview questions that will be approved by the recruiter.
 * These questions would be generated when the recruiter in the process of creating a new job post.
 * After the job post is created successfully with the interview questions, these questions will be used
 * by AI to conduct a call interview with a job seeker.
 */

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

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
    temperature: 0.8,
    apiKey: OPENAI_API_KEY,
});

const enum CALLER {
    generateInterviewQuestions = "aiGenerateInterviewQuestionsService",
};

const schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "question": {
                "type": "string"
            }
        },
        "required": ["question"],
        "additionalProperties": false
    }
};
const schemaString = JSON.stringify(schema).replace(/{/g, '{{').replace(/}/g, '}}');

export const aiGenerateInterviewQuestionsService = async (
    jobTitle: string,
    jobDescription: string,
    jobResponsibility: string,
    requiredQualification: string,
    preferredQualification: string,
    totalQuestions: number,
    questions?: string[],
): Promise<string[] | void> => {
    try {

        const prompt = ChatPromptTemplate.fromTemplate(
            `
            Help a recruiter by generating ${totalQuestions} interview questions that is suitable for 
            a quick call interview over the phone.

            **Requirements:**
            - The questions must be aligned with the following information:
            Job Title: {jobTitle}.
            Job Description: {jobDescription}.
            Job Responsibility: {jobResponsibility}.
            Required Qualification: {requiredQualification}.
            Preferred Qualification: {preferredQualification}.

            **Additional Requirements**:
            - The questions MUST be short-answer type, designed to elicit concise, direct responses that can be answered in 1-2 sentences, a number, or a brief phrase.
            - Each question MUST start **with exactly one of the following phrases (no variations):**
            How long, How many, How much, Where, Which, Do you, Have you, Is your, Who is, How often, When, Are you.
            - Avoid any starting phrases outside this list. Only generate questions based on these starting words.

            ${questions && questions?.length > 0 ? "**Exclude and avoid any similarities to the following questions:** " + questions?.map(q => q).join(", ") : ""}

            Use the following JSON Schema when you provide your response. 
            It MUST be a JSON OBJECT in which each question is placed in the array.

            Use this schema: ${schemaString}.
        `
        );

        const chain = prompt.pipe(modal);
        const response = await chain.invoke({
            jobTitle,
            jobDescription,
            jobResponsibility,
            requiredQualification,
            preferredQualification
        });

        // Extract the content
        const rawContent = response.content as string;
        logger.info(`${CALLER.generateInterviewQuestions}(), 
                    jobTitle: ${jobTitle}, 
                    jobDescription: ${jobDescription}, 
                    jobResponsibility: ${jobResponsibility}, 
                    requiredQualification: ${requiredQualification}, 
                    preferredQualification: ${preferredQualification}, 
                    rawContent: ${rawContent}`
        );
        return getCleanedArrayFromAiResponse(rawContent);
    } catch (error) {
        throw new AppError(
            CALLER.generateInterviewQuestions,
            500,
            "An error occurred while interacting with AI model: " + error
        );
    }

}