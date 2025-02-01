// src/controllers/userController.ts
import { NextFunction, Request, Response } from 'express';
import {
    getAllEducationsService,
    getEducationByIdService,
    createEducationService,
    updateEducationService,
    deleteEducationService
} from '../services/DB/educationService';
import { sendSuccessResponse } from '../utils/responseHandler';
import {
    validateAllFields,
    validateDeletedRecord,
    validateFoundRecord,
    validateAndGetId
} from '../utils/validationUtils';
import Education from '../models/educationModel';
import { checkAuthorization } from '../utils/authorizationHelper';
import { USERS } from '../interfaces/common';
import logger from '../utils/logger';

const enum CALLER {
    getAll = "getAllEducationsController",
    getById = "getEducationController",
    create = "createEducationController",
    update = "updateEducationController",
    delete = "deleteEducationController",
};


export const getAllEducationsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getAll}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.getAll, req.authUserData?.role, [USERS.ADMIN]);
        const educations = await getAllEducationsService();
        logger.info(`${CALLER.getAll}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<Education[] | null>(res, 'Fetched data.', educations);
    } catch (error) {
        next(error);
    }
};

export const getEducationByIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getById}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.getById, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.getById, req.params.id) as number;

        const education = await getEducationByIdService(id);
        validateFoundRecord(CALLER.getById, !Education);
        logger.info(`${CALLER.getById}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<Education | null>(res, 'Retrieved data', education);
    } catch (error) {
        next(error);
    }
};

export const createEducationController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.create}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.create, req.authUserData?.role, [USERS.ADMIN]);
        const jobSeekerId: number = validateAndGetId(CALLER.update, req.body.jobSeekerId) as number;
        const {
            degree,
            fieldOfStudy,
            school,
            location,
            description,
            isEnrolled,
            startDate,
            endDate,
        } = req.body;

        validateAllFields(CALLER.create, [
            jobSeekerId,
            degree,
            fieldOfStudy,
            school,
            location,
            description,
            isEnrolled,
            startDate,
            endDate,
        ]);

        const newEducation = await createEducationService({
            jobSeekerId,
            degree,
            fieldOfStudy,
            school,
            location,
            description,
            isEnrolled,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
        });
        validateFoundRecord(CALLER.create, !newEducation);

        res.status(201).json(newEducation);
        logger.info(`${CALLER.create}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<Education | null>(res, 'Created data.', newEducation, 201);

    } catch (error) {
        next(error);
    }
};

export const updateEducationController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.update}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.update, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.update, req.params.id) as number;
        const jobSeekerId: number = validateAndGetId(CALLER.update, req.body.jobSeekerId) as number;

        const {
            degree,
            fieldOfStudy,
            school,
            location,
            description,
            isEnrolled,
            startDate,
            endDate,
        } = req.body;

        validateAllFields(CALLER.update, [
            jobSeekerId,
            degree,
            fieldOfStudy,
            school,
            location,
            description,
            isEnrolled,
            startDate,
            endDate,
        ]);

        const updatedEducation = await updateEducationService(id, {
            jobSeekerId,
            degree,
            fieldOfStudy,
            school,
            location,
            description,
            isEnrolled,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
        });
        validateFoundRecord(CALLER.update, !updatedEducation);
        logger.info(`${CALLER.update}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<Education | null>(res, 'Updated data.', updatedEducation);
    } catch (error) {
        next(error);
    }
};

export const deleteEducationController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.delete}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.delete, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.delete, req.params.id) as number;

        const affectedRecords: number = (await deleteEducationService(id) || 0);
        validateDeletedRecord(CALLER.delete, affectedRecords);
        logger.info(`${CALLER.delete}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<null>(res, 'Data is deleted.', null);

    } catch (error) {
        next(error);
    }
};