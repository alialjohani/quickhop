// src/controllers/userController.ts
import { NextFunction, Request, Response } from 'express';
import {
    getAllCertificationsService,
    getCertificationByIdService,
    createCertificationService,
    updateCertificationService,
    deleteCertificationService
} from '../services/DB/certificationService';
import { sendSuccessResponse } from '../utils/responseHandler';
import {
    validateAllFields,
    validateDeletedRecord,
    validateFoundRecord,
    validateAndGetId
} from '../utils/validationUtils';
import Certification from '../models/certificationModel';
import { checkAuthorization } from '../utils/authorizationHelper';
import { USERS } from '../interfaces/common';
import logger from '../utils/logger';

const enum CALLER {
    getAll = "getAllCertificationsController",
    getById = "getCertificationController",
    create = "createCertificationController",
    update = "updateCertificationController",
    delete = "deleteCertificationController",
};


export const getAllCertificationsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getAll}() x-forwarded-for={${req.headers['x-forwarded-for']}}`)
        checkAuthorization(CALLER.getAll, req.authUserData?.role, [USERS.ADMIN]);
        const certifications = await getAllCertificationsService();
        logger.info(`${CALLER.getAll}() x-forwarded-for={${req.headers['x-forwarded-for']}} COMPLETED`)
        sendSuccessResponse<Certification[] | null>(res, 'Fetched data.', certifications);
    } catch (error) {
        next(error);
    }
};

export const getCertificationByIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getById}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.getById, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.getById, req.params.id) as number;

        const certification = await getCertificationByIdService(id);
        validateFoundRecord(CALLER.getById, !Certification);
        logger.info(`${CALLER.getById}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<Certification | null>(res, 'Retrieved data', certification);
    } catch (error) {
        next(error);
    }
};

export const createCertificationController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.create}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.create, req.authUserData?.role, [USERS.ADMIN]);
        const jobSeekerId: number = validateAndGetId(CALLER.update, req.body.jobSeekerId) as number;
        const {
            name,
            issuingOrganization,
            credentialUrl,
            description,
            noExpirationDate,
            issueDate,
            expirationDate,
        } = req.body;

        validateAllFields(CALLER.create, [
            jobSeekerId,
            name,
            issuingOrganization,
            credentialUrl,
            description,
            noExpirationDate,
            issueDate,
            expirationDate,
        ]);

        const newCertification = await createCertificationService({
            jobSeekerId,
            name,
            issuingOrganization,
            credentialUrl,
            description,
            noExpirationDate,
            issueDate: new Date(issueDate),
            expirationDate: expirationDate ? new Date(expirationDate) : null,
        });
        validateFoundRecord(CALLER.create, !newCertification);

        res.status(201).json(newCertification);
        logger.info(`${CALLER.create}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<Certification | null>(res, 'Created data.', newCertification, 201);

    } catch (error) {
        next(error);
    }
};

export const updateCertificationController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.update}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.update, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.update, req.params.id) as number;
        const jobSeekerId: number = validateAndGetId(CALLER.update, req.body.jobSeekerId) as number;

        const {
            name,
            issuingOrganization,
            credentialUrl,
            description,
            noExpirationDate,
            issueDate,
            expirationDate,
        } = req.body;

        validateAllFields(CALLER.update, [
            jobSeekerId,
            name,
            issuingOrganization,
            credentialUrl,
            description,
            noExpirationDate,
            issueDate,
            expirationDate,

        ]);

        const updatedCertification = await updateCertificationService(id, {
            jobSeekerId,
            name,
            issuingOrganization,
            credentialUrl,
            description,
            noExpirationDate,
            issueDate: new Date(issueDate),
            expirationDate: expirationDate ? new Date(expirationDate) : null,
        });
        validateFoundRecord(CALLER.update, !updatedCertification);
        logger.info(`${CALLER.update}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<Certification | null>(res, 'Updated data.', updatedCertification);
    } catch (error) {
        next(error);
    }
};

export const deleteCertificationController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.delete}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.delete, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.delete, req.params.id) as number;

        const affectedRecords: number = (await deleteCertificationService(id) || 0);
        validateDeletedRecord(CALLER.delete, affectedRecords);
        logger.info(`${CALLER.delete}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<null>(res, 'Data is deleted.', null);

    } catch (error) {
        next(error);
    }
};