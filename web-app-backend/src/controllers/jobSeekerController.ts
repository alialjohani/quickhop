// src/controllers/userController.ts
import { NextFunction, Request, Response } from 'express';
import {
    getAllJobSeekersService,
    getJobSeekerByIdService,
    createJobSeekerService,
    updateJobSeekerService,
    deleteJobSeekerService
} from '../services/DB/jobSeekerService';
import {
    validateAllFields,
    validateDeletedRecord,
    validateFoundRecord,
    validateAndGetId
} from '../utils/validationUtils';
import { sendSuccessResponse } from '../utils/responseHandler';
import JobSeeker from '../models/jobSeekerModel';
import { checkAuthorization } from '../utils/authorizationHelper';
import { USERS } from '../interfaces/common';
import logger from '../utils/logger';

const enum CALLER {
    getAll = "getAllJobSeekersController",
    getById = "getJobSeekerByIdController",
    create = "createJobSeekerController",
    update = "updateJobSeekerController",
    delete = "deleteJobSeekerController",
};

export const getAllJobSeekersController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getAll}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.getAll, req.authUserData?.role, [USERS.ADMIN]);
        const jobSeekers = await getAllJobSeekersService();
        logger.info(`${CALLER.getAll}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<JobSeeker[] | null>(res, 'Fetched data.', jobSeekers);
    } catch (error) {
        next(error);
    }
};

export const getJobSeekerByIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getById}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.getById, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.getById, req.params.id) as number;

        const jobSeeker = await getJobSeekerByIdService(id);
        validateFoundRecord(CALLER.getById, !jobSeeker);
        logger.info(`${CALLER.getById}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<JobSeeker | null>(res, 'Retrieved data', jobSeeker);
    } catch (error) {
        next(error);
    }
};

export const createJobSeekerController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.create}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.create, req.authUserData?.role, [USERS.ADMIN]);
        const { firstName, lastName, email, phone, linkedin, country, region, city } = req.body;
        validateAllFields(CALLER.create, [firstName, lastName, email, phone, country, region, city]);

        const newJobSeeker = await createJobSeekerService({
            firstName,
            lastName,
            email,
            phone,
            linkedin,
            country,
            region,
            city
        });
        validateFoundRecord(CALLER.create, !newJobSeeker);
        logger.info(`${CALLER.create}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<JobSeeker | null>(res, 'Created data.', newJobSeeker, 201);
    } catch (error) {
        next(error);
    }
};

export const updateJobSeekerController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.update}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.update, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.update, req.params.id) as number;

        const { firstName, lastName, email, phone, linkedin, country, region, city } = req.body;
        validateAllFields(CALLER.update, [firstName, lastName, email, phone, linkedin, country, region, city]);

        const updatedJobSeeker = await updateJobSeekerService(id, {
            firstName,
            lastName,
            email,
            phone,
            linkedin,
            country,
            region,
            city
        });
        validateFoundRecord(CALLER.update, !updatedJobSeeker);
        logger.info(`${CALLER.update}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<JobSeeker | null>(res, 'Updated data.', updatedJobSeeker);
    } catch (error) {
        next(error);
    }
};

export const deleteJobSeekerController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.delete}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.delete, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.delete, req.params.id) as number;

        const affectedRecords: number = (await deleteJobSeekerService(id) || 0);
        validateDeletedRecord(CALLER.delete, affectedRecords);
        logger.info(`${CALLER.delete}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<null>(res, 'Data is deleted.', null);

    } catch (error) {
        next(error);
    }
};
