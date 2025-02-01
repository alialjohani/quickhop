// src/controllers/userController.ts
import { NextFunction, Request, Response } from 'express';
import {
    getAllJobPostsService,
    getJobPostByIdService,
    createJobPostService,
    updateJobPostService,
    deleteJobPostService
} from '../services/DB/jobPostService';
import { sendSuccessResponse } from '../utils/responseHandler';
import { validateAllFields, validateAtLeastOneField, validateDeletedRecord, validateFoundRecord, validateAndGetId } from '../utils/validationUtils';
import { filterDefinedFields } from '../utils/helpers';
import JobPost from '../models/jobPostModel';
import { checkAuthorization } from '../utils/authorizationHelper';
import { USERS } from '../interfaces/common';
import { newJobPostProcessController } from './newJobPostProcessController';
import logger from '../utils/logger';

const enum CALLER {
    getAll = "getAllJobPostsController",
    getById = "getJobPostController",
    create = "createJobPostController",
    update = "updateJobPostController",
    delete = "deleteJobPostController",
};


export const getAllJobPostsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getAll}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.getAll, req.authUserData?.role, [USERS.ADMIN]);
        const jobPosts = await getAllJobPostsService();
        logger.info(`${CALLER.getAll}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<JobPost[] | null>(res, 'Fetched data.', jobPosts);
    } catch (error) {
        next(error);
    }
};

export const getJobPostByIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getById}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.getById, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.getById, req.params.id) as number;

        const jobPost = await getJobPostByIdService(id);
        validateFoundRecord(CALLER.getById, !jobPost);
        logger.info(`${CALLER.getById}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<JobPost | null>(res, 'Retrieved data', jobPost);
    } catch (error) {
        next(error);
    }
};

export const createJobPostController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.create}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.create, req.authUserData?.role, [USERS.ADMIN, USERS.RECRUITER]);
        const { recruiterId,
            status,
            title,
            description,
            responsibility,
            preferredQualification,
            requiredQualification,
            maxCandidates,
            minMatchingPercentage,
            aiCallsStartingDate,
            aiCallsEndDate,
            jobKB,
            aiInterviewQuestions
        } = req.body;

        // Exclude the nullable fields
        validateAllFields(CALLER.create, [
            recruiterId,
            status,
            title,
            description,
            responsibility,
            //preferredQualification,
            //requiredQualification,
            maxCandidates,
            minMatchingPercentage,
            aiCallsStartingDate,
            aiCallsEndDate,
            //jobKB,
            aiInterviewQuestions
        ]);

        const newJobPost = await createJobPostService({
            recruiterId,
            status,
            title,
            description,
            responsibility,
            preferredQualification,
            requiredQualification,
            maxCandidates,
            minMatchingPercentage,
            aiCallsStartingDate,
            aiCallsEndDate,
            jobKB,
            aiInterviewQuestions
        });
        validateFoundRecord(CALLER.create, !newJobPost);
        logger.info(`${CALLER.create}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<JobPost | null>(res, 'Created data.', newJobPost, 201);

        // Perform background task: make matching between the job post and all job seekers
        if (newJobPost) {
            setImmediate(async () => {
                try {
                    await newJobPostProcessController(newJobPost);
                } catch (error) {
                    // Handle the error without crashing the process
                    logger.error(`${CALLER.create}() x-forwarded-for={${req.headers['x-forwarded-for']}}, Error in background task newJobPostProcessController: ${error}`);
                }
            });
        }

    } catch (error) {
        next(error);
    }
};

export const updateJobPostController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.update}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.update, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.update, req.params.id) as number;

        const { recruiterId,
            status,
            title,
            description,
            responsibility,
            preferredQualification,
            requiredQualification,
            maxCandidates,
            minMatchingPercentage,
            aiCallsStartingDate,
            aiCallsEndDate,
            jobKB,
            aiInterviewQuestions
        } = req.body;

        // Exclude the nullable fields
        validateAllFields(CALLER.update, [
            recruiterId,
            status,
            title,
            description,
            responsibility,
            //preferredQualification,
            //requiredQualification,
            maxCandidates,
            minMatchingPercentage,
            aiCallsStartingDate,
            aiCallsEndDate,
            //jobKB,
            aiInterviewQuestions
        ]);

        const updatedJobPost = await updateJobPostService(id, {
            recruiterId,
            status,
            title,
            description,
            responsibility,
            preferredQualification,
            requiredQualification,
            maxCandidates,
            minMatchingPercentage,
            aiCallsStartingDate,
            aiCallsEndDate,
            jobKB,
            aiInterviewQuestions
        });
        validateFoundRecord(CALLER.update, !updatedJobPost);
        logger.info(`${CALLER.update}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<JobPost | null>(res, 'Updated data.', updatedJobPost);
    } catch (error) {
        next(error);
    }
};

export const deleteJobPostController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.delete}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.delete, req.authUserData?.role, [USERS.ADMIN, USERS.RECRUITER]);
        const id: number = validateAndGetId(CALLER.delete, req.params.id) as number;

        const affectedRecords: number = (await deleteJobPostService(id) || 0);
        validateDeletedRecord(CALLER.delete, affectedRecords);
        logger.info(`${CALLER.delete}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<null>(res, 'Data is deleted.', null);

    } catch (error) {
        next(error);
    }
};