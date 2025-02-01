import { AppError } from '../../errors/AppError';
import Recruiter from '../../models/recruiterModel';
import { updateService } from './common/updateService';
import { deleteService } from './common/deleteService';
import { checkIdService } from './common/checkIdService';
import Company from '../../models/companyModel';
import { where } from 'sequelize';
import { RecruiterProfile } from '../../interfaces/common';

const enum CALLER {
    getAll = "getAllRecruitersService",
    getById = "getRecruiterByIdService",
    getByEmail = "getRecruiterByEmailService",
    create = "createRecruiterService",
    update = "updateRecruiterService",
    delete = "deleteRecruiterService",
}

export const getAllRecruitersService = async (): Promise<Recruiter[] | null> => {
    try {
        return await Recruiter.findAll();
    } catch (error) {
        throw new AppError(
            CALLER.getAll,
            500,
            "An error occurred while accessing the database: " + error
        );
    }

};

export const getRecruiterByIdService = async (id: number): Promise<RecruiterProfile | null> => {
    try {
        const result = await Recruiter.findOne({
            where: { id },
            include: [
                {
                    model: Company,
                    attributes: ['name']
                }
            ],
            raw: true, // This flattens the response
            nest: true // Keeps nested objects but allows us to access them directly
        });

        const recruiterProfile: RecruiterProfile = {
            id: result?.id ?? 0,
            companyId: result?.companyId ?? 0,
            email: result?.email ?? '',
            firstName: result?.firstName ?? '',
            lastName: result?.lastName ?? '',
            phone: result?.phone ?? '',
            companyName: result?.Company?.name ?? '',
        } as RecruiterProfile;
        return recruiterProfile;
    } catch (error) {
        throw new AppError(
            CALLER.getById,
            500,
            "An error occurred while accessing the database: " + error
        );
    }
};


export const getRecruiterByEmailService = async (email: string): Promise<Recruiter | null> => {
    try {
        return await Recruiter.findOne({
            where: { email }
        });
    } catch (error) {
        throw new AppError(
            CALLER.getByEmail,
            500,
            "An error occurred while accessing the database: " + error
        );
    }
};


export const createRecruiterService = async (
    recruiterData: { companyId: number, email: string, firstName: string, lastName: string, phone: string }
): Promise<Recruiter | null> => {
    try {
        await checkIdService(CALLER.create, Company, recruiterData.companyId);
        return await Recruiter.create(recruiterData);
    } catch (error) {
        throw new AppError(
            CALLER.create,
            500,
            "An error occurred while accessing the database: " + error
        );
    }
};

export const updateRecruiterService = async (
    id: number,
    recruiterData: Partial<Recruiter>
): Promise<Recruiter | null> => {
    return await updateService(CALLER.update, Recruiter, id, recruiterData);
};


export const deleteRecruiterService = async (id: number): Promise<number | void> => {
    return await deleteService(CALLER.delete, Recruiter, id);
};

