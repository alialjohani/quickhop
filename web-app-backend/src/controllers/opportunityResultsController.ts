// src/controllers/userController.ts
import { NextFunction, Request, Response } from 'express';
import {
    getAllOpportunityResultsService,
    getOpportunityResultsByIdService,
    createOpportunityResultsService,
    updateOpportunityResultsService,
    deleteOpportunityResultsService
} from '../services/DB/opportunityResultsService';
import { sendSuccessResponse } from '../utils/responseHandler';
import {
    validateAllFields,
    validateDeletedRecord,
    validateFoundRecord,
    validateAndGetId
} from '../utils/validationUtils';
import OpportunityResults from '../models/opportunityResultsModel';
import { checkAuthorization } from '../utils/authorizationHelper';
import { USERS } from '../interfaces/common';
import logger from '../utils/logger';

const enum CALLER {
    getAll = "getAllOpportunityResultsController",
    getById = "getOpportunityResultsController",
    create = "createOpportunityResultsController",
    update = "updateOpportunityResultsController",
    delete = "deleteOpportunityResultsController",
};


export const getAllOpportunityResultsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getAll}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.getAll, req.authUserData?.role, [USERS.ADMIN]);
        const opportunityResults = await getAllOpportunityResultsService();
        logger.info(`${CALLER.getAll}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<OpportunityResults[] | null>(res, 'Fetched data.', opportunityResults);
    } catch (error) {
        next(error);
    }
};

export const getOpportunityResultsByIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getById}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.getById, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.getById, req.params.id) as number;

        const opportunityResults = await getOpportunityResultsByIdService(id);
        validateFoundRecord(CALLER.getById, !OpportunityResults);
        logger.info(`${CALLER.getById}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<OpportunityResults | null>(res, 'Retrieved data', opportunityResults);
    } catch (error) {
        next(error);
    }
};

export const createOpportunityResultsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.create}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.create, req.authUserData?.role, [USERS.ADMIN]);
        const jobSeekerId: number = validateAndGetId(CALLER.update, req.body.jobSeekerId) as number;
        const jobPostId: number = validateAndGetId(CALLER.update, req.body.jobPostId) as number;
        const {
            oneTimeAccessKey,
            matchingScore,
            interviewCompletionDate,
            status,
            recordingUri,
        } = req.body;

        validateAllFields(CALLER.create, [
            jobSeekerId,
            jobPostId,
            oneTimeAccessKey,
            matchingScore,
        ]);

        const newOpportunityResults = await createOpportunityResultsService({
            jobSeekerId,
            jobPostId,
            oneTimeAccessKey,
            matchingScore,
            interviewCompletionDate: interviewCompletionDate ? new Date(interviewCompletionDate) : null,
            status,
            recordingUri,
        });
        validateFoundRecord(CALLER.create, !newOpportunityResults);

        // res.status(201).json(newOpportunityResults);
        logger.info(`${CALLER.create}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<OpportunityResults | null>(res, 'Created data.', newOpportunityResults, 201);

    } catch (error) {
        next(error);
    }
};

export const updateOpportunityResultsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.update}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.update, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.update, req.params.id) as number;
        const jobSeekerId: number = validateAndGetId(CALLER.update, req.body.jobSeekerId) as number;
        const jobPostId: number = validateAndGetId(CALLER.update, req.body.jobPostId) as number;

        const {
            oneTimeAccessKey,
            matchingScore,
            interviewCompletionDate,
            status,
            recordingUri,
        } = req.body;

        validateAllFields(CALLER.update, [
            jobSeekerId,
            jobPostId,
            oneTimeAccessKey,
            matchingScore,
            //interviewCompletionDate,
            status,
            //recordingUri,
        ]);

        const updatedOpportunityResults = await updateOpportunityResultsService(id, {
            jobSeekerId,
            jobPostId,
            oneTimeAccessKey,
            matchingScore,
            interviewCompletionDate: interviewCompletionDate ? new Date(interviewCompletionDate) : null,
            status,
            recordingUri,
        });
        validateFoundRecord(CALLER.update, !updatedOpportunityResults);
        logger.info(`${CALLER.update}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<OpportunityResults | null>(res, 'Updated data.', updatedOpportunityResults);
    } catch (error) {
        next(error);
    }
};

export const deleteOpportunityResultsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.delete}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.delete, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.delete, req.params.id) as number;

        const affectedRecords: number = (await deleteOpportunityResultsService(id) || 0);
        validateDeletedRecord(CALLER.delete, affectedRecords);
        logger.info(`${CALLER.delete}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<null>(res, 'Data is deleted.', null);

    } catch (error) {
        next(error);
    }
};