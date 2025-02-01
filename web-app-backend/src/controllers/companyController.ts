// src/controllers/userController.ts
import { NextFunction, Request, Response } from 'express';
import { getAllCompaniesService, getCompanyByIdService, createCompanyService, updateCompanyService, deleteCompanyService } from '../services/DB/companyService';
import { validateAllFields, validateAtLeastOneField, validateDeletedRecord, validateFoundRecord, validateAndGetId } from '../utils/validationUtils';
import { sendSuccessResponse } from '../utils/responseHandler';
import Company from '../models/companyModel';
import { filterDefinedFields } from '../utils/helpers';
import { checkAuthorization } from '../utils/authorizationHelper';
import { USERS } from '../interfaces/common';
import logger from '../utils/logger';

const enum CALLER {
    getAll = "getAllCompaniesController",
    getById = "getCompanyByIdController",
    create = "createCompanyController",
    update = "updateCompanyController",
    delete = "deleteCompanyController",
};

export const getAllCompaniesController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getAll}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.getAll, req.authUserData?.role, [USERS.ADMIN]);
        const companies = await getAllCompaniesService();
        logger.info(`${CALLER.getAll}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<Company[] | null>(res, 'Fetched data.', companies);
    } catch (error) {
        next(error);
    }
};

export const getCompanyByIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.getById}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.getById, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.getById, req.params.id) as number;

        const company = await getCompanyByIdService(id);
        validateFoundRecord(CALLER.getById, !company);
        logger.info(`${CALLER.getById}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<Company | null>(res, 'Retrieved data', company);
    } catch (error) {
        next(error);
    }
};

export const createCompanyController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.create}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.create, req.authUserData?.role, [USERS.ADMIN]);
        const { name, knowledge_base } = req.body;
        validateAllFields(CALLER.create, [name, knowledge_base]);

        const newCompany = await createCompanyService({ name, knowledge_base });
        validateFoundRecord(CALLER.create, !newCompany);
        logger.info(`${CALLER.create}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<Company | null>(res, 'Created data.', newCompany, 201);
    } catch (error) {
        next(error);
    }
};

export const updateCompanyController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.update}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.update, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.update, req.params.id) as number;

        const { name, knowledge_base } = req.body;
        validateAllFields(CALLER.update, [name, knowledge_base]);

        const updatedCompany = await updateCompanyService(id, { name, knowledge_base });
        validateFoundRecord(CALLER.update, !updatedCompany);
        logger.info(`${CALLER.update}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<Company | null>(res, 'Updated data.', updatedCompany);
    } catch (error) {
        next(error);
    }
};

export const deleteCompanyController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${CALLER.delete}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        checkAuthorization(CALLER.delete, req.authUserData?.role, [USERS.ADMIN]);
        const id: number = validateAndGetId(CALLER.delete, req.params.id) as number;

        const affectedRecords: number = (await deleteCompanyService(id) || 0);
        validateDeletedRecord(CALLER.delete, affectedRecords);
        logger.info(`${CALLER.delete}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<null>(res, 'Data is deleted.', null);

    } catch (error) {
        next(error);
    }
};
