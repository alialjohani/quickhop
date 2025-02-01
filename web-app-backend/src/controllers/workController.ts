// src/controllers/userController.ts
import { NextFunction, Request, Response } from 'express';
import {
    getAllWorksService,
    getWorkByIdService,
    createWorkService,
    updateWorkService,
    deleteWorkService
} from '../services/DB/workService';
import { sendSuccessResponse } from '../utils/responseHandler';
import {
    validateAllFields,
    validateDeletedRecord,
    validateFoundRecord,
    validateAndGetId
} from '../utils/validationUtils';
import Work from '../models/workModel';
import { checkAuthorization } from '../utils/authorizationHelper';
import { USERS } from '../interfaces/common';
import logger from '../utils/logger';

const enum CALLER {
    getAll = "getAllWorksController",
    getById = "getWorkController",
    create = "createWorkController",
    update = "updateWorkController",
    delete = "deleteWorkController",
};


export const getAllWorksController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getAll}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.getAll, req.authUserData?.role, [USERS.ADMIN]);
        const works = await getAllWorksService();
        logger.info(`${CALLER.getAll}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<Work[] | null>(res, 'Fetched data.', works);
    } catch (error) {
        next(error);
    }
};

export const getWorkByIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getById}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.getById, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.getById, req.params.id) as number;

        const work = await getWorkByIdService(id);
        validateFoundRecord(CALLER.getById, !work);
        logger.info(`${CALLER.getById}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<Work | null>(res, 'Retrieved data', work);
    } catch (error) {
        next(error);
    }
};

export const createWorkController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.create}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.create, req.authUserData?.role, [USERS.ADMIN]);
        const jobSeekerId: number = validateAndGetId(CALLER.update, req.body.jobSeekerId) as number;
        const {
            title,
            company,
            location,
            description,
            isStillWorking,
            startDate,
            endDate,
        } = req.body;

        validateAllFields(CALLER.create, [
            jobSeekerId,
            title,
            company,
            location,
            description,
            isStillWorking,
            startDate,
            endDate,
        ]);

        const newWork = await createWorkService({
            jobSeekerId,
            title,
            company,
            location,
            description,
            isStillWorking,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
        });
        validateFoundRecord(CALLER.create, !newWork);

        // res.status(201).json(newWork);
        logger.info(`${CALLER.create}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<Work | null>(res, 'Created data.', newWork, 201);

    } catch (error) {
        next(error);
    }
};

export const updateWorkController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.update}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.update, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.update, req.params.id) as number;
        const jobSeekerId: number = validateAndGetId(CALLER.update, req.body.jobSeekerId) as number;

        const {
            title,
            company,
            location,
            description,
            isStillWorking,
            startDate,
            endDate,
        } = req.body;

        validateAllFields(CALLER.update, [
            jobSeekerId,
            title,
            company,
            location,
            description,
            isStillWorking,
            startDate,
            endDate,
        ]);

        const updatedWork = await updateWorkService(id, {
            jobSeekerId,
            title,
            company,
            location,
            description,
            isStillWorking,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
        });
        validateFoundRecord(CALLER.update, !updatedWork);
        logger.info(`${CALLER.update}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<Work | null>(res, 'Updated data.', updatedWork);
    } catch (error) {
        next(error);
    }
};

export const deleteWorkController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.delete}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.delete, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.delete, req.params.id) as number;

        const affectedRecords: number = (await deleteWorkService(id) || 0);
        validateDeletedRecord(CALLER.delete, affectedRecords);
        logger.info(`${CALLER.delete}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<null>(res, 'Data is deleted.', null);

    } catch (error) {
        next(error);
    }
};