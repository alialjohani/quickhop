import { AppError } from '../../errors/AppError';
import Company from '../../models/companyModel';
import { deleteService } from './common/deleteService';
import { updateService } from './common/updateService';

const enum CALLER {
    getAll = "getAllCompaniesService",
    getById = "getCompanyByIdService",
    create = "createCompanyService",
    update = "updateCompanyService",
    delete = "deleteCompanyService",
}

export const getAllCompaniesService = async (): Promise<Company[] | null> => {
    try {
        return await Company.findAll();
    } catch (error) {
        throw new AppError(
            CALLER.getAll,
            500,
            "An error occurred while accessing the database: " + error
        );
    }
};

export const getCompanyByIdService = async (id: number): Promise<Company | null> => {
    try {
        return await Company.findByPk(id);
    } catch (error) {
        throw new AppError(
            CALLER.getById,
            500,
            "An error occurred while accessing the database: " + error
        );
    }

};

export const createCompanyService = async (
    companyData: { name: string; knowledge_base: string }
): Promise<Company | null> => {
    try {
        return await Company.create(companyData);
    } catch (error) {
        throw new AppError(
            CALLER.create,
            500,
            "An error occurred while accessing the database: " + error
        );
    }
};

export const updateCompanyService = async (
    id: number,
    companyData: Partial<Company>
): Promise<Company | null> => {
    return await updateService(CALLER.update, Company, id, companyData);
};

export const deleteCompanyService = async (id: number): Promise<number | void> => {
    return await deleteService(CALLER.delete, Company, id);
};


