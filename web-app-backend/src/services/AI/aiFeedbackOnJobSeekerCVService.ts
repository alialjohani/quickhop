/**
 * aiFeedbackOnJobSeekerCVService.ts
 * Let AI to generate a feedback on each section in a job seeker CV separately.
 * It helps the job seeker to elaborate with more details.
 */

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder, } from "@langchain/core/prompts";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { AiFeedbackCVRequest } from '../../interfaces/common';

import { AppError } from "../../errors/AppError";
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
    feedbackOnCV = "aiFeedbackOnJobSeekerCV",
};


// many-shots prompt engineering
const aiFeedbackOnCVExamples = [
    // Work Experience example
    new HumanMessage(
        "Section: Work Experience\n" +
        "Job Title: Software Engineer\n" +
        "Description: Managed a team of developers to deliver a web application."
    ),
    new AIMessage(
        "1. Specify the technologies or frameworks you used (e.g., React, Node.js) and how they contributed to the application's success.\n" +
        "2. Highlight any innovative solutions or optimizations you implemented to enhance the application's performance or user experience.\n" +
        "3. Include measurable outcomes, such as reducing project delivery time by 20% or achieving high user satisfaction ratings."
    ),

    // Education example
    new HumanMessage(
        "Section: Education\n" +
        "Field of Study: Artificial Intelligence\n" +
        "Description: Completed a Master's in Artificial Intelligence."
    ),
    new AIMessage(
        "1. Mention specific projects or theses related to AI applications, such as developing predictive models or using neural networks for problem-solving.\n" +
        "2. Include any specialized tools or platforms you mastered, such as TensorFlow or PyTorch, and their relevance to your work.\n" +
        "3. Add notable achievements, like publications, top grades in key courses, or recognition in academic competitions."
    ),

    // Certification example
    new HumanMessage(
        "Section: Certification\n" +
        "Certification Name: Google Professional Cloud Architect\n" +
        "Description: Achieved certification to design secure and compliant cloud solutions."
    ),
    new AIMessage(
        "1. List specific skills acquired, such as designing scalable architectures or optimizing cloud costs using Google Cloud tools.\n" +
        "2. Highlight any practical case studies or projects you completed during the certification, focusing on challenges and results.\n" +
        "3. Describe how this certification has strengthened your ability to deliver secure, efficient cloud solutions."
    ),

    // Additional Work Experience example
    new HumanMessage(
        "Section: Work Experience\n" +
        "Job Title: Data Analyst\n" +
        "Description: Analyzed large datasets to support business decisions."
    ),
    new AIMessage(
        "1. Detail the tools and techniques you used for analysis, such as SQL for querying, Python for scripting, or Tableau for visualization.\n" +
        "2. Provide examples of impactful insights you delivered, such as identifying trends that led to a 15% revenue increase.\n" +
        "3. Highlight how your visualizations or reports influenced strategic decisions by key stakeholders."
    ),

    // Additional Certification example
    new HumanMessage(
        "Section: Certification\n" +
        "Certification Name: Certified Ethical Hacker (CEH)\n" +
        "Description: Certified in penetration testing and vulnerability assessment."
    ),
    new AIMessage(
        "1. Outline the specific areas of expertise gained, such as testing web applications or securing networks against vulnerabilities.\n" +
        "2. Include examples of how you’ve applied these skills, like conducting penetration tests that identified critical security gaps.\n" +
        "3. Explain how this certification has enhanced your ability to safeguard systems and minimize security risks for organizations."
    ),
];



export const aiFeedbackOnJobSeekerCVService = async (
    userInputs: AiFeedbackCVRequest[]
): Promise<string[] | void> => {
    try {
        const prompt = ChatPromptTemplate.fromMessages([
            // System message to set the context
            ["system", `You are a professional CV consultant. Based on the section type, job title, field of study, or certification provided, suggest up to 3 specific enhancements the user can add to improve the description. Focus on helping them highlight role-specific skills, contributions, and outcomes. Avoid evaluative or interview-like questions; instead, guide them to include measurable details and actionable content.`],
            new MessagesPlaceholder("examples"),
            // User's input
            ["user", "Section: {section}"],
            ["user", "Job Title/Field of Study: {titleOrField}"],
            ["user", "Description: {description}"],
        ]);

        const chain = prompt.pipe(modal);
        const batchInput = userInputs.map(input => ({
            ...input, // Spread the input properties (section, titleOrField, description)
            examples: aiFeedbackOnCVExamples
        }));
        const response = await chain.batch(batchInput);

        // Extract the content
        const contents: string[] = [];
        response.forEach(res => contents.push(res.content as string))
        // const rawContent = response.content as string;

        logger.info(`${CALLER.feedbackOnCV}(), contents: ${contents}`);
        return contents;

    } catch (error) {
        throw new AppError(
            CALLER.feedbackOnCV,
            500,
            "An error occurred while interacting with AI model: " + error
        );
    }

}