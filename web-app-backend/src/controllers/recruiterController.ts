// src/controllers/userController.ts
import { NextFunction, Request, Response } from 'express';
import {
    getAllRecruitersService,
    getRecruiterByIdService,
    createRecruiterService,
    updateRecruiterService,
    deleteRecruiterService
} from '../services/DB/recruiterService';
import Recruiter from '../models/recruiterModel';
import { sendSuccessResponse } from '../utils/responseHandler';
import {
    validateAllFields,
    validateDeletedRecord,
    validateFoundRecord,
    validateAndGetId
} from '../utils/validationUtils';
import { checkAuthorization } from '../utils/authorizationHelper';
import { RecruiterProfile, USERS } from '../interfaces/common';
import logger from '../utils/logger';

const enum CALLER {
    getAll = "getAllRecruitersController",
    getById = "getRecruiterController",
    create = "createRecruiterController",
    update = "updateRecruiterController",
    delete = "deleteRecruiterController",
};


export const getAllRecruitersController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getAll}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.getAll, req.authUserData?.role, [USERS.ADMIN]);
        const recruiters = await getAllRecruitersService();
        logger.info(`${CALLER.getAll}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<Recruiter[] | null>(res, 'Fetched data.', recruiters);
    } catch (error) {
        next(error);
    }
};

export const getRecruiterByIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getById}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.getById, req.authUserData?.role, [USERS.ADMIN, USERS.RECRUITER]);
        const id: number = validateAndGetId(CALLER.getById, req.params.id) as number;

        const recruiterProfile = await getRecruiterByIdService(id);
        validateFoundRecord(CALLER.getById, !recruiterProfile);
        logger.info(`${CALLER.getById}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<RecruiterProfile | null>(res, 'Retrieved data', recruiterProfile);
    } catch (error) {
        next(error);
    }
};

export const createRecruiterController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.create}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.create, req.authUserData?.role, [USERS.ADMIN]);
        const { companyId, email, firstName, lastName, phone } = req.body;
        validateAllFields(CALLER.create, [companyId, email, firstName, lastName, phone]);

        const newRecruiter = await createRecruiterService({ companyId, email, firstName, lastName, phone });
        validateFoundRecord(CALLER.create, !newRecruiter);
        logger.info(`${CALLER.create}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        //res.status(201).json(newRecruiter);
        sendSuccessResponse<Recruiter | null>(res, 'Created data.', newRecruiter, 201);

    } catch (error) {
        next(error);
    }
};

export const updateRecruiterController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.update}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.update, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.update, req.params.id) as number;

        const { email, firstName, lastName, phone } = req.body;
        validateAllFields(CALLER.update, [email, firstName, lastName, phone]);

        const updatedRecruiter = await updateRecruiterService(id, { email, firstName, lastName, phone });
        validateFoundRecord(CALLER.update, !updatedRecruiter);
        logger.info(`${CALLER.update}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<Recruiter | null>(res, 'Updated data.', updatedRecruiter);
    } catch (error) {
        next(error);
    }
};

export const deleteRecruiterController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.delete}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.delete, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.delete, req.params.id) as number;

        const affectedRecords: number = (await deleteRecruiterService(id) || 0);
        validateDeletedRecord(CALLER.delete, affectedRecords);
        logger.info(`${CALLER.delete}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<null>(res, 'Data is deleted.', null);

    } catch (error) {
        next(error);
    }
};