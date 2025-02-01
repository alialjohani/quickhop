/**
 * aiResumeService.ts
 * Let AI to decide whether a given section in a CV is relative to the job post or not. 
 */

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";


import { AppError } from "../../errors/AppError";

import { AiMatchingInput, AiResumeOutput } from "../../interfaces/common";
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
});

const enum CALLER {
    resume = "aiResumeService",
};


const schema = {
    type: "object",
    properties: {
        candidate: {
            type: "object",
            properties: {
                education_history: {
                    type: "array",
                    items: {
                        $ref: "#/definitions/EducationWithBulletPoints"
                    }
                },
                work_history: {
                    type: "array",
                    items: {
                        $ref: "#/definitions/WorkWithBulletPoints"
                    }
                },
                CV_certifications: {
                    type: "array",
                    items: {
                        $ref: "#/definitions/CertificationWithBulletPoints"
                    }
                }
            }
        }
    },
    definitions: {
        EducationWithBulletPoints: {
            type: "object",
            properties: {
                id: { type: "number" },
                jobSeekerId: { type: "number" },
                degree: { type: "string" },
                fieldOfStudy: { type: "string" },
                school: { type: "string" },
                location: { type: "string" },
                description: { type: "array", items: { type: "string" } },
                isEnrolled: { type: "boolean" },
                startDate: { type: "string", format: "date-time" },
                endDate: { type: ["string", "null"], format: "date-time" }
            }
        },
        WorkWithBulletPoints: {
            type: "object",
            properties: {
                id: { type: "number" },
                jobSeekerId: { type: "number" },
                title: { type: "string" },
                company: { type: "string" },
                location: { type: "string" },
                description: { type: "array", items: { type: "string" } },
                isStillWorking: { type: "boolean" },
                startDate: { type: "string", format: "date-time" },
                endDate: { type: ["string", "null"], format: "date-time" }
            }
        },
        CertificationWithBulletPoints: {
            type: "object",
            properties: {
                id: { type: "number" },
                jobSeekerId: { type: "number" },
                name: { type: "string" },
                issuingOrganization: { type: "string" },
                credentialUrl: { type: "string" },
                description: { type: "array", items: { type: "string" } },
                noExpirationDate: { type: "boolean" },
                issueDate: { type: "string", format: "date-time" },
                expirationDate: { type: ["string", "null"], format: "date-time" }
            }
        }
    }
};

const schemaString = JSON.stringify(schema).replace(/{/g, '{{').replace(/}/g, '}}');

// Detailed Algorithm Steps:
const algorithm = `
1. **Input Parsing**:
   - Extract job details from the input: \`title\`, \`description\`, \`responsibility\`, \`required_qualifications\`, \`preferred_qualifications\`.
   - Extract candidate sections from the input: \`education_history\`, \`work_history\`, and \`CV_certifications\`.

2. **Generate Bullet Points for Candidate Sections**:
   - For each section (education history, work history, certifications):
     - If the section is \`undefined\` or \`null\`, return an empty array.
     - If the section is valid:
       1. Sort the entries in the section by the most recent \`endDate\` (or \`startDate\` if \`endDate\` is missing) in descending order.
       2. Use \`generateBulletPoints\` to convert the description into an array of bullet points.
       3. Only retain bullet points that are relevant to the job description; remove irrelevant ones.

3. **Constructing the Output**:
   - Ensure each section has been filtered according to the job description's alignment.
   - If no relevant points are found in \`education_history\`, \`work_history\`, or \`CV_certifications\`, return empty arrays for these sections.

4. **Final Output**:
   - Return the updated candidate object with filtered and sorted sections.
   - If no relevant points are found in \`education_history\`, \`work_history\`, or \`CV_certifications\`, return empty arrays for these sections.

`;

const algorithmSteps = JSON.stringify(algorithm).replace(/{/g, '{{').replace(/}/g, '}}');

export const aiResumeService = async (
    userInput: AiMatchingInput
): Promise<AiResumeOutput> => {
    try {

        const prompt = ChatPromptTemplate.fromMessages([
            // System message to set the context
            ["system",
                `You are a sophisticated AI resume generator. Your task is to analyze a candidate's resume sections 
                and align them with a provided job description. Each section contains an array of statements. 
                Evaluate each statement and:
                    - Retain only the relevant points.
                    - Remove irrelevant points.
                    - If a section contains no relevant points, mark it as an empty array.
                ### Algorithm to follow ###
                ${algorithmSteps}
- The output JSON object should follow this schema:
${JSON.stringify(schemaString)}
Do not include any explanations or extra text. Only return the updated JSON object.`
            ],
            ["user", "{input}"]
        ]);

        const chain = prompt.pipe(modal);
        const input = JSON.stringify({ ...userInput });
        const response = await chain.invoke({ input });
        const rawContent = response.content as string;

        logger.info(`${CALLER.resume}(), input: ${input}, rawContent: ${rawContent}`);

        const cleanedResponse = rawContent.replace(/^```json\n|\n```$/g, '');
        const parsedResponse = JSON.parse(cleanedResponse);

        return parsedResponse;

    } catch (error) {
        throw new AppError(
            CALLER.resume,
            500,
            "An error occurred while interacting with AI model: " + error
        );
    }

}