/**
 * This controller is specifically for frontend business logic, while others are just general CRUD of models. 
 */

import { NextFunction, Request, Response } from 'express';
import { validateAllFields, validateFoundRecord, validateAndGetId } from '../utils/validationUtils';
import { sendSuccessResponse } from '../utils/responseHandler';
import Company from '../models/companyModel';
import Recruiter from '../models/recruiterModel';
import { getRecruiterByEmailService, updateRecruiterService } from '../services/DB/recruiterService';
import {
    deactivateJobPostService,
    getAllJobPostsReadyToRunningService,
    getAllJobPostsRunningToCompleteService,
    getAllOpportunityResultsByJobPostIdService,
    getCompanyByRecruiterIdService,
    getJobPostsOpportunitiesByRecruiterIdService,
    getJobSeekerCVService,
    getJobSeekerInterviewResultsService,
    getJobSeekerOpportunitiesService,
    postJobSeekerCVService,
    updateCompanyKBByRecruiterIdService
} from '../services/DB/recruitmentService';
import {
    MappedJobPostOpportunities,
    MappedJobSeekerCV,
    MappedInterviewResultsForJobSeeker,
    MappedOpportunityResultsForRecruiter,
    MappedOpportunitiesForJobSeeker,
    USERS,
    AiFeedbackCVRequest,
    JobPostStatus,
    OpportunityResultsStatus,
    opportunityResultsStatuses
} from '../interfaces/common';
import { JobPost, JobSeeker, OpportunityResults } from '../models';
import { checkAuthorization } from '../utils/authorizationHelper';
import { createJobSeekerService, getJobSeekerByEmailService } from '../services/DB/jobSeekerService';
import { aiGenerateInterviewQuestionsService } from '../services/AI/aiGenerateInterviewQuestionsService';
import { AppError } from '../errors/AppError';
import { aiFeedbackOnJobSeekerCVService } from '../services/AI/aiFeedbackOnJobSeekerCVService';
import logger from '../utils/logger';
import { updateJobPostService } from '../services/DB/jobPostService';
import { updateOpportunityResultsService } from '../services/DB/opportunityResultsService';
import dynamodbUpdateItems from '../services/AWS/dynamodbUpdateItems';
import { aiCheckOpenEndQuestionService } from '../services/AI/aiCheckOpenEndQuestionService';

const TABLE_INTERVIEWEES = process.env.DynamoDB_TABLE_INTERVIEWEES || '';

interface UpdateRecruiterProfileType extends Omit<Recruiter, 'id' | 'email' | 'companyId'> { }

interface UpdateCompanyKBType {
    knowledge_base: string;
}

const enum CALLER {
    getCompanyByRecruiter = "getCompanyByRecruiterIdController",
    updateCompanyKB = "updateRecruiterCompanyKBController",
    updateRecruiterProfile = "updateRecruiterProfileController",
    getJobPosts = "getJobPostsDataController",
    getResultsForPost = "getAllOpportunityResultsByJobPostIdController",
    getRecruiterJobPostsData = "getRecruiterJobPostsDataController",
    deactivateJobPost = "deactivateJobPostController",
    getCV = "getJobSeekerCVController",
    postCV = "postJobSeekerCVController",
    getInterviewResults = "getJobSeekerInterviewResultsController",
    getJobSeekerOpportunities = "getJobSeekerOpportunitiesController",
    aiGenerateInterviewQuestions = "aiGenerateInterviewQuestionsController",
    aiCheckOpenEndQuestion = "aiCheckOpenEndQuestionController",
    aiFeedbackOnCV = "aiFeedbackOnJobSeekerCVController",
    getUserIdByToken = "getUserIdByToken",
    updateAllJobPostStatus = "updateAllJobPostStatus",
    updateAllStatus = "updateAllStatus",
    updateOpportunityResultStatus = "updateOpportunityResultStatusByIdController",
};

// For Recruiter 
export const getCompanyByRecruiterIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getCompanyByRecruiter}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.getCompanyByRecruiter, req.authUserData?.role, [USERS.ADMIN, USERS.RECRUITER]);
        const recruiterId: number = validateAndGetId(CALLER.getCompanyByRecruiter, req.params.id) as number;

        const company = await getCompanyByRecruiterIdService(recruiterId);
        validateFoundRecord(CALLER.getCompanyByRecruiter, !company);
        logger.info(`${CALLER.getCompanyByRecruiter}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<Company | null>(res, 'Retrieved data', company);
    } catch (error) {
        next(error);
    }
};

export const updateCompanyKBByRecruiterIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.updateCompanyKB}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(
            CALLER.updateCompanyKB,
            req.authUserData?.role,
            [USERS.ADMIN, USERS.RECRUITER],
        );

        const id: number = validateAndGetId(CALLER.updateCompanyKB, req.params.id) as number;

        const { knowledge_base }: UpdateCompanyKBType = req.body;
        validateAllFields(CALLER.updateCompanyKB, [knowledge_base]);

        const updatedCompany = await updateCompanyKBByRecruiterIdService(id, { knowledge_base });
        validateFoundRecord(CALLER.updateCompanyKB, !updatedCompany);
        logger.info(`${CALLER.updateCompanyKB}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<Company | null>(res, 'Updated data.', updatedCompany);
    } catch (error) {
        next(error);
    }
};

// For Recruiter 
export const updateRecruiterProfileController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.updateRecruiterProfile}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(
            CALLER.updateRecruiterProfile,
            req.authUserData?.role,
            [USERS.ADMIN, USERS.RECRUITER],
        );
        const id: number = validateAndGetId(CALLER.updateRecruiterProfile, req.params.id) as number;


        const { firstName, lastName, phone }: UpdateRecruiterProfileType = req.body;
        validateAllFields(CALLER.updateRecruiterProfile, [firstName, lastName, phone]);

        const updatedRecruiter = await updateRecruiterService(id, { firstName, lastName, phone });
        validateFoundRecord(CALLER.updateRecruiterProfile, !updatedRecruiter);
        logger.info(`${CALLER.updateRecruiterProfile}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<Recruiter | null>(res, 'Updated data.', updatedRecruiter);
    } catch (error) {
        next(error);
    }
};

// use getAllJobPostsController, and add then a field to know the specific number of opportunities (totalSelectedCandidates)
export const getRecruiterJobPostsDataController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getRecruiterJobPostsData}(), x-forwarded-for={x-forwarded-for={${req.headers['x-forwarded-for']}}}`);
        checkAuthorization(
            CALLER.getRecruiterJobPostsData,
            req.authUserData?.role,
            [USERS.ADMIN, USERS.RECRUITER],
        );
        const id: number = validateAndGetId(CALLER.getJobPosts, req.params.id) as number;
        const recruiterEmail = req.authUserData?.email ?? "";
        const results = await getJobPostsOpportunitiesByRecruiterIdService(id, recruiterEmail);
        logger.info(`${CALLER.getRecruiterJobPostsData}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<MappedJobPostOpportunities[] | null>(res, 'Fetched data.', results);
    } catch (error) {
        next(error);
    }
};


// use deactivateJobPostController, to immediately deactivate the job post
export const deactivateJobPostController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.deactivateJobPost}(), x-forwarded-for={x-forwarded-for={${req.headers['x-forwarded-for']}}}`);
        checkAuthorization(
            CALLER.deactivateJobPost,
            req.authUserData?.role,
            [USERS.ADMIN, USERS.RECRUITER],
        );
        const recruiterId: number = validateAndGetId(CALLER.deactivateJobPost, req.params.id) as number;
        const jobPostId: number = validateAndGetId(CALLER.deactivateJobPost, req.params.jobPostId) as number;

        // update DB: job post to be in complete status
        await deactivateJobPostService(recruiterId, jobPostId);

        // update Dynamodb: to deactivate any incoming phone calls
        // this table holds all candidate's info that are expected to call for the interview
        // these info are needed in the IVR call, and when the call is disconnected
        await dynamodbUpdateItems({
            tableName: TABLE_INTERVIEWEES,
            partitionKeyName: 'OneTimeAccessKey', // this is the main partition key
            updateAttributeName: 'isActive', // update this field to be false
            updateAttributeValue: false,
            conditionAttributeName: 'JobPostId', // for all items that has this jobPostId
            conditionAttributeValue: jobPostId.toString(),
        });

        logger.info(`${CALLER.deactivateJobPost}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<void>(res, 'Updated job post.');
    } catch (error) {
        next(error);
    }
};

// For Recruiter
export const getAllOpportunityResultsByJobPostIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getResultsForPost}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        // Recruiter email: req.authUserData?.email        
        checkAuthorization(
            CALLER.getResultsForPost,
            req.authUserData?.role,
            [USERS.ADMIN, USERS.RECRUITER],
        );

        const id: number = validateAndGetId(CALLER.getJobPosts, req.params.id) as number;
        const recruiterEmail = req.authUserData?.email ?? "";
        const opportunityResults = await getAllOpportunityResultsByJobPostIdService(id, recruiterEmail);
        logger.info(`${CALLER.getResultsForPost}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<MappedOpportunityResultsForRecruiter[] | null>(res, 'Fetched data.', opportunityResults);
    } catch (error) {
        next(error);
    }
};

// For Recruiter 
// Recruiter can update/set the opportunity results status to SELECT, NOT_SELECT
export const updateOpportunityResultStatusByIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.updateOpportunityResultStatus}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(
            CALLER.updateOpportunityResultStatus,
            req.authUserData?.role,
            [USERS.ADMIN, USERS.RECRUITER],
        );
        const id: number = validateAndGetId(CALLER.updateOpportunityResultStatus, req.params.id) as number;

        //console.log('>>> req.body:: ', req.body)
        const { status } = req.body;
        validateAllFields(CALLER.updateOpportunityResultStatus, [status]);

        if (!(opportunityResultsStatuses.includes(status as OpportunityResultsStatus))) {
            throw new AppError(CALLER.updateOpportunityResultStatus, 400, "Status must be one of these values: 'SELECTED', 'NOT_SELECTED', 'PENDING'.");
        }

        const result = await updateOpportunityResultsService(id, { status: status as OpportunityResultsStatus });

        logger.info(`${CALLER.updateOpportunityResultStatus}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<OpportunityResults | null>(res, 'Updated data.', result);
    } catch (error) {
        next(error);
    }
};

export const getJobSeekerCVController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getCV}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(
            CALLER.getCV,
            req.authUserData?.role,
            [USERS.ADMIN, USERS.JOB_SEEKER],
        );

        const jobSeekerId: number = validateAndGetId(CALLER.getCV, req.params.id) as number;

        const cv = await getJobSeekerCVService(jobSeekerId);
        logger.info(`${CALLER.getCV}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<JobSeeker | null>(res, 'Fetched data.', cv);
    } catch (error) {
        next(error);
    }
};

export const postJobSeekerCVController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.postCV}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        // const jobSeekerId: number = validateAndGetId(CALLER.postCV, req.params.id) as number;    
        checkAuthorization(
            CALLER.postCV,
            req.authUserData?.role,
            [USERS.ADMIN, USERS.JOB_SEEKER],
        );

        const bodyData: MappedJobSeekerCV = req.body;
        // Assure, every one posting to his own data
        // If admin, get the email from the body, if not admin, get the email from the token.
        const email = req.authUserData?.role === USERS.ADMIN ? bodyData.email : req.authUserData?.email;
        if (bodyData?.id !== undefined && bodyData.id <= 0) {
            delete bodyData.id;
        }

        validateAllFields(CALLER.postCV, [
            bodyData.firstName,
            bodyData.lastName,
            email,
            bodyData.phone,
            // bodyData.linkedin,
            bodyData.country,
            bodyData.region,
            bodyData.city,
        ]);

        // if Education, Works, or Certifications being provided, check their required fields
        const cv = await postJobSeekerCVService(bodyData);
        logger.info(`${CALLER.postCV}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<JobSeeker | null>(res, 'Fetched data.', cv);
    } catch (error) {
        next(error);
    }
};

export const getJobSeekerInterviewResultsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getInterviewResults}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(
            CALLER.getInterviewResults,
            req.authUserData?.role,
            [USERS.ADMIN, USERS.JOB_SEEKER],
        );

        const jobSeekerId: number = validateAndGetId(CALLER.getInterviewResults, req.params.id) as number;

        const results: MappedInterviewResultsForJobSeeker[] | null =
            await getJobSeekerInterviewResultsService(jobSeekerId);
        validateFoundRecord(CALLER.getInterviewResults, !results);
        logger.info(`${CALLER.getInterviewResults}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<MappedInterviewResultsForJobSeeker[] | null>(res, 'Retrieved data', results);
    } catch (error) {
        next(error);
    }
};


export const getJobSeekerOpportunitiesController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getJobSeekerOpportunities}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(
            CALLER.getJobSeekerOpportunities,
            req.authUserData?.role,
            [USERS.ADMIN, USERS.JOB_SEEKER],
        );

        const jobSeekerId: number = validateAndGetId(CALLER.getJobSeekerOpportunities, req.params.id) as number;

        const results: MappedOpportunitiesForJobSeeker[] | null =
            await getJobSeekerOpportunitiesService(jobSeekerId);
        validateFoundRecord(CALLER.getJobSeekerOpportunities, !results);
        logger.info(`${CALLER.getJobSeekerOpportunities}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<MappedOpportunitiesForJobSeeker[] | null>(res, 'Retrieved data', results);
    } catch (error) {
        next(error);
    }
};

// To get user id
export const getUserIdByToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getUserIdByToken}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        const userType = req.authUserData?.role;
        const email = req.authUserData?.email;
        const response = {
            id: -1,
            email: req.authUserData?.email ?? ""
        };

        if (userType === USERS.RECRUITER && email) {
            const recruiter = await getRecruiterByEmailService(email)
            response.id = recruiter?.id ?? -1;
        } else if (userType === USERS.JOB_SEEKER && email) {
            const jobSeeker = await getJobSeekerByEmailService(email);
            response.id = jobSeeker?.id ?? -1;
        }
        // Create new user if not already exist
        // Only for jobSeeker, Recruiter is as a business logic, must be verified and added before logining
        if (response.id === -1 && userType === USERS.JOB_SEEKER) {
            const result = await createJobSeekerService({
                firstName: '',
                lastName: '',
                email: response.email,
                phone: '',
                linkedin: '',
                country: '',
                region: '',
                city: ''
            });
            response.id = result?.id ?? -1;
        }
        logger.info(`${CALLER.getUserIdByToken}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<{ id: number, email: string }>(res, 'Fetched data.', response);
    } catch (error) {
        next(error);
    }
};

// AI: Generate up to 10 interview questions
export const aiGenerateInterviewQuestionsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.aiGenerateInterviewQuestions}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(
            CALLER.aiGenerateInterviewQuestions,
            req.authUserData?.role,
            [USERS.ADMIN, USERS.RECRUITER],
        );

        const {
            totalQuestions,
            questions,
            jobTitle,
            jobDescription,
            jobResponsibility,
            requiredQualification,
            preferredQualification } = req.body;
        validateAllFields(CALLER.aiGenerateInterviewQuestions, [
            totalQuestions,
            jobTitle,
            jobDescription,
            jobResponsibility,
            // requiredQualification,
            // preferredQualification
        ]);
        if (totalQuestions > 5 || totalQuestions <= 0 || typeof totalQuestions !== 'number') {
            throw new AppError(CALLER.aiGenerateInterviewQuestions, 400, "Check the total questions. The param 'totalQuestions' must be greater than 0 and less than 6.");
        }
        const result = await aiGenerateInterviewQuestionsService(
            jobTitle,
            jobDescription,
            jobResponsibility,
            requiredQualification,
            preferredQualification,
            Number(totalQuestions),
            questions,
        );
        logger.info(`${CALLER.aiGenerateInterviewQuestions}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<String[] | void>(res, 'Retrieved data', result);
    } catch (error) {
        next(error);
    }
};


// AI: Feedback on CV for a job seeker
export const aiFeedbackOnJobSeekerCVController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.aiGenerateInterviewQuestions}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(
            CALLER.aiGenerateInterviewQuestions,
            req.authUserData?.role,
            [USERS.ADMIN, USERS.JOB_SEEKER],
        );

        const body: AiFeedbackCVRequest[] = req.body;
        if (body.length <= 0) {
            throw new AppError(CALLER.aiGenerateInterviewQuestions, 400, "An array of objects must be provided.");
        }
        validateAllFields(CALLER.aiGenerateInterviewQuestions, [body[0].section, body[0].titleOrField, body[0].description]);
        const result = await aiFeedbackOnJobSeekerCVService(body);
        logger.info(`${CALLER.aiGenerateInterviewQuestions}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<String[] | void>(res, 'Retrieved data', result);
    } catch (error) {
        next(error);
    }
};

// AI: check the question if open-end or not (open-end leads to longer answer which is not supported in system)
export const aiCheckOpenEndQuestionController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.aiCheckOpenEndQuestion}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(
            CALLER.aiCheckOpenEndQuestion,
            req.authUserData?.role,
            [USERS.ADMIN, USERS.RECRUITER],
        );

        const { question } = req.body;
        validateAllFields(CALLER.aiCheckOpenEndQuestion, [question]);
        const result = await aiCheckOpenEndQuestionService(question as string);
        logger.info(`${CALLER.aiCheckOpenEndQuestion}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<boolean | void>(res, 'Retrieved data', result);
    } catch (error) {
        next(error);
    }
};


const updateAllStatus = async (jobPosts: JobPost[] | null, status: JobPostStatus): Promise<void> => {
    try {
        if (jobPosts) {
            for (const job of jobPosts) {
                logger.info(`updateAllStatus(): job = {${job}} to be updated to ${status}`);
                await updateJobPostService(job.id, { status: status });
            }
        }
    } catch (error) {
        throw new AppError(
            CALLER.updateAllStatus,
            500,
            "An error occurred while updating job posts status: " + error
        );
    }

}

// Update job post status auto, to be run as a CORN
export const updateAllJobPostStatus =
    async (): Promise<void> => {
        try {
            logger.info('updateAllJobPostStatus()');
            // update from Ready to Running
            await updateAllStatus(await getAllJobPostsReadyToRunningService(), 'RUNNING');
            logger.info('updateAllJobPostStatus(): updated READY to RUNNING status.');

            // update from Running to COMPLETED
            await updateAllStatus(await getAllJobPostsRunningToCompleteService(), 'COMPLETED');
            logger.info('updateAllJobPostStatus(): updated RUNNING to COMPLETED status.');

        } catch (error) {
            throw new AppError(
                CALLER.updateAllJobPostStatus,
                500,
                "An error occurred while updating job posts status: " + error
            );
        }
    };

