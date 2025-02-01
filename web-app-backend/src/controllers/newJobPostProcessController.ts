/**
 * newJobPostProcessController.ts
 * This function runs in a background asynchronously without blocking the response.
 * When the new job post is created, after the response being sent to the recruiter,
 * this function runs.
 * By AI, it tests each job seeker in DB with this new job post, if the job seeker fits,
 * then the job seeker will be considered in this position by creating a new opportunity for the job seeker.
 */

import { Model } from "sequelize";
import { AiMatchingInput, AiResumeOutput, CertificationWithBulletPoints, EducationWithBulletPoints, INITIAL_AI_PHONE_MESSAGE_DIRECTIVE, JobPostPhoneCallCounterRecord, JobPostPhoneCallRecord, JobSeekerPhoneCallRecord, MappedJobSeekerCV, WorkWithBulletPoints } from "../interfaces/common";
import { JobPost } from "../models";
import { CertificationAttributes } from "../models/certificationModel";
import { EducationAttributes } from "../models/educationModel";
import { WorkAttributes } from "../models/workModel";
import { aiGenerateConcisePointsService } from "../services/AI/aiGenerateConcisePointsService";
import { aiMatchingService } from "../services/AI/aiMatchingService";
import { aiResumeService } from "../services/AI/aiResumeService";
import { updateJobPostService } from "../services/DB/jobPostService";
import { createOpportunityResultsService } from "../services/DB/opportunityResultsService";
import { getAllJobSeekerCVsService } from "../services/DB/recruitmentService";
import { generateOTP } from "../utils/helpers";
import { ResumePDF } from "../interfaces/ResumePDF";
import { AppError } from "../errors/AppError";
import { S3UploadResume } from "../services/AWS/S3UploadResume";
import { getRecruiterByIdService } from "../services/DB/recruiterService";
import logger from "../utils/logger";
import dynamodbInsert from "../services/AWS/dynamodbInsert";
import dotenv from 'dotenv';
dotenv.config();

const enum CALLER {
    newJobPostProcess = "newJobPostProcessController",
    resumeProcess = "resumeProcess",
};

const TABLE_INTERVIEWEES = process.env.DynamoDB_TABLE_INTERVIEWEES || '';
const TABLE_INITIAL_MESSAGE = process.env.DynamoDB_TABLE_INITIAL_MESSAGE || '';
const DynamoDB_TABLE_COUNTER = process.env.DynamoDB_TABLE_COUNTER || '';


// Convert long text in description to an array of string (Bullet Points)
type BulletPointInput = EducationAttributes | WorkAttributes | CertificationAttributes;
type BulletPointOutput = EducationWithBulletPoints | WorkWithBulletPoints | CertificationWithBulletPoints;
const generateBulletPoints = async (section: BulletPointInput[] | undefined): Promise<BulletPointOutput[]> => {
    if (section === undefined) {
        return [];
    }
    const updatedSection = await Promise.all(
        section.map(async (sec) => {
            // Convert to plain object if necessary
            const plainSec = sec instanceof Model ? sec.get({ plain: true }) : sec;
            const { createdAt, updatedAt, id, jobSeekerId, ...allOtherFields } = plainSec;
            const desc = await aiGenerateConcisePointsService(plainSec.description || "") || [""];
            const updatedSec = {
                ...allOtherFields, // Work with the plain object
                description: desc,
            };
            return updatedSec;
        })
    );
    return updatedSection;
};

/**
 * 
 */
const resumeProcess = async (
    recruiterEmail: string,
    aiMatchingInputData: AiMatchingInput,
    outputFileName: string,
    fullName: string,
    location: string,
    email: string,
    phone: string,
    linkedin?: string,
) => {
    try {
        logger.info('resumeProcess()');
        // Generate tailored resume: ai selects CV sections/points, 
        const resumeAiOutput: AiResumeOutput = await aiResumeService(aiMatchingInputData);
        // create pdf file, 
        const resumePDF = new ResumePDF({
            fullName,
            location,
            email,
            phone,
            linkedin,
            outputFileName: './tmp/' + outputFileName,
            work_history: resumeAiOutput.candidate.work_history,
            education_history: resumeAiOutput.candidate.education_history,
            certifications: resumeAiOutput.candidate.CV_certifications
        });
        await resumePDF.generateResumePDF();
        logger.info('resumeProcess(): PDF created.');
        // upload to AWS S3
        await S3UploadResume({
            recruiterEmail,
            jobSeekerEmail: email,
            fileName: outputFileName
        });
        logger.info('resumeProcess(): PDF uploaded to S3.');
    } catch (error) {
        throw new AppError(
            CALLER.resumeProcess,
            500,
            "An error occurred during the resume process: " + error
        );
    }

}

export const newJobPostProcessController = async (jobPost: JobPost): Promise<void> => {
    try {
        logger.info(CALLER.newJobPostProcess);
        // Change jobPost status to 'SELECTING'
        await updateJobPostService(jobPost.id, { status: "SELECTING" });
        logger.info(CALLER.newJobPostProcess + ': job post status is updated to SELECTING,');

        // Time To Live in DynamoDB: let Dynamo deletes the record auto
        const TTL = Math.floor(new Date(
            jobPost.aiCallsEndDate.getFullYear(),
            jobPost.aiCallsEndDate.getMonth(),
            jobPost.aiCallsEndDate.getDate(),
            23, 59, 59 // Set time to 23:59:59
        ).getTime() / 1000); // UNIX timestamp

        // Get recruiter email
        logger.info(CALLER.newJobPostProcess + ': generating main points from the job post.');
        const recruiter = await getRecruiterByIdService(jobPost.recruiterId);
        if (recruiter === null) {
            throw new AppError(
                CALLER.newJobPostProcess,
                500,
                `The system was not able to retrieve the recruiter details from the DB.`
            );
        }
        // Generate the main points from job post as an array of strings, as middle step to prepare data
        const jobResponsibility: string[] = await aiGenerateConcisePointsService(jobPost.responsibility || "") || [""];
        const jobRequiredQualifications: string[] = await aiGenerateConcisePointsService(jobPost.requiredQualification || "") || [""];
        const jobPreferredQualifications: string[] = await aiGenerateConcisePointsService(jobPost.preferredQualification || "") || [""];

        logger.info(CALLER.newJobPostProcess + ': inserting initial message in DynamoDB to direct AI during phone calls.');
        // Insert the initial message including the questions to direct the AI during a phone call
        const allQuestions = jobPost.aiInterviewQuestions.map((q, index) => `${q.question}`).join("\n");
        const initMessageItem: JobPostPhoneCallRecord = {
            JobPostId: jobPost.id.toString(),
            message: INITIAL_AI_PHONE_MESSAGE_DIRECTIVE.replace("{{QUESTIONS}}", allQuestions),
            TTL
        };
        await dynamodbInsert(TABLE_INITIAL_MESSAGE, initMessageItem);

        // Prepare the counter Table for job post: each job post has a limit number (maxCandidate), so this 
        // table only being used as a counter. Initiate a record for this job post with counter as 0.
        logger.info(CALLER.newJobPostProcess + ': inserting the counter with 0 value in DynamoDB to track caller for the job post.');
        const counterItem: JobPostPhoneCallCounterRecord = {
            JobPostId: jobPost.id.toString(),
            DidCallCounter: 0,
            TTL
        };

        await dynamodbInsert(DynamoDB_TABLE_COUNTER, counterItem);

        // Get all job seekers in DB
        logger.info(CALLER.newJobPostProcess + ': start calculate the matching score between the job post and each job seeker.');
        const allJobSeekers: MappedJobSeekerCV[] = await getAllJobSeekerCVsService();
        for (const jobSeeker of allJobSeekers) {
            if (jobSeeker.id === undefined || jobSeeker.id <= 0) {
                throw new Error('Job Seeker ID is incorrect.');
            }

            // Loop throw each one: 
            //  - request ai to evaluate the job seeker against the job post, 
            const aiInput: AiMatchingInput = {
                job: {
                    title: jobPost.title,
                    description: jobPost.description,
                    responsibility: jobResponsibility,
                    required_qualifications: jobRequiredQualifications,
                    preferred_qualifications: jobPreferredQualifications,
                    minimum_accepted_score: jobPost.minMatchingPercentage,
                },
                candidate: {
                    education_history: await generateBulletPoints(jobSeeker.Education) as EducationWithBulletPoints[],
                    work_history: await generateBulletPoints(jobSeeker.Works) as WorkWithBulletPoints[],
                    CV_certifications: await generateBulletPoints(jobSeeker.Certifications) as CertificationWithBulletPoints[]
                }
            };

            // Start matching
            logger.info(CALLER.newJobPostProcess + ': Calculating matching score for job seeker:' + jobSeeker.id);
            const result = await aiMatchingService(aiInput);
            const uniqueNumber = jobSeeker.id.toString() + jobPost.id.toString() + generateOTP();
            //  - create new opportunity if the job seeker is qualified
            if (result) {
                logger.info(CALLER.newJobPostProcess + ': job seeker id = {{' + jobSeeker.id + '}} was found as qualified.');
                // job seeker is qualified, update DB with a new opportunity for job seeker
                const opportunityResult = await createOpportunityResultsService({
                    jobSeekerId: jobSeeker.id,
                    jobPostId: jobPost.id,
                    oneTimeAccessKey: uniqueNumber,
                    matchingScore: jobPost.minMatchingPercentage,
                    interviewCompletionDate: null,
                    status: "PENDING",
                    recordingUri: null
                });
                if (opportunityResult === null) {
                    throw new AppError(
                        CALLER.newJobPostProcess,
                        500,
                        `The system was not able to create new opportunity for the job seeker id={${jobSeeker.id}}.`
                    );
                }
                // upload data to dynamodb, to be used when the job seeker makes a call for the interview
                logger.info(CALLER.newJobPostProcess + ': job seeker id = {{' + jobSeeker.id + '}}, inserting details in dynamodb.');


                const item: JobSeekerPhoneCallRecord = {
                    OneTimeAccessKey: uniqueNumber,
                    Name: jobSeeker.firstName,
                    JobPostId: jobPost.id.toString(),
                    OpportunityResultId: opportunityResult.id.toString(),
                    JobSeekerEmail: jobSeeker.email,
                    RecruiterEmail: recruiter.email,
                    maxCandidates: jobPost.maxCandidates.toString() || '0',
                    DidCall: false, // the job seeker did not call yet, by default is false
                    TTL: TTL, // Time To Live: remove the record one day after the end interview date
                    PhoneNumber: jobSeeker.phone,
                    isActive: true,
                };

                //console.log('>>>>TABLE_INTERVIEWEES: item: ', item)
                await dynamodbInsert(TABLE_INTERVIEWEES, item);

                // create and upload (to S3): job seeker resume
                logger.info(CALLER.newJobPostProcess + ': job seeker id = {{' + jobSeeker.id + '}}, creating and uploading resume.');
                await resumeProcess(
                    recruiter?.email || "",
                    aiInput,
                    opportunityResult?.id.toString(),
                    jobSeeker.firstName + ' ' + jobSeeker.lastName,
                    jobSeeker.city + ', ' + jobSeeker.region + ', ' + jobSeeker.country,
                    jobSeeker.email,
                    jobSeeker.phone,
                    jobSeeker.linkedin
                );
            }
            logger.info(CALLER.newJobPostProcess + ': job seeker id = {{' + jobSeeker.id + '}}, COMPLETED the process.');
        }

        // Update the job post status to be 'READY'
        await updateJobPostService(jobPost.id, { status: "READY" });
        logger.info(CALLER.newJobPostProcess + ': job post is READY and COMPLETED.');
    } catch (error) {
        throw new AppError(
            CALLER.newJobPostProcess,
            500,
            "An error occurred during the matching process: " + error
        );
    }
};