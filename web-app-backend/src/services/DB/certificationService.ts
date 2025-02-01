import { AppError } from '../../errors/AppError';
import Certification from '../../models/certificationModel';
import { updateService } from './common/updateService';
import { deleteService } from './common/deleteService';
import { checkIdService } from './common/checkIdService';
import JobSeeker from '../../models/jobSeekerModel';

const enum CALLER {
    getAll = "getAllCertificationsService",
    getById = "getCertificationByIdService",
    create = "createCertificationService",
    update = "updateCertificationService",
    delete = "deleteCertificationService",
}

export const getAllCertificationsService = async (): Promise<Certification[] | null> => {
    try {
        return await Certification.findAll();
    } catch (error) {
        throw new AppError(
            CALLER.getAll,
            500,
            "An error occurred while accessing the database: " + error
        );
    }

};

export const getCertificationByIdService = async (id: number): Promise<Certification | null> => {
    try {
        return await Certification.findByPk(id);
    } catch (error) {
        throw new AppError(
            CALLER.getById,
            500,
            "An error occurred while accessing the database: " + error
        );
    }
};

export const createCertificationService = async (
    certificationData: {
        jobSeekerId: number,
        name: string,
        issuingOrganization: string,
        credentialUrl: string,
        description: string,
        noExpirationDate: boolean,
        issueDate: Date,
        expirationDate: Date | null,
    }
): Promise<Certification | null> => {
    try {
        await checkIdService(CALLER.create, JobSeeker, certificationData.jobSeekerId);
        return await Certification.create(certificationData);
    } catch (error) {
        throw new AppError(
            CALLER.create,
            500,
            "An error occurred while accessing the database: " + error
        );
    }
};

export const updateCertificationService = async (
    id: number,
    certificationData: Partial<Certification>
): Promise<Certification | null> => {
    return await updateService(CALLER.update, Certification, id, certificationData);
};


export const deleteCertificationService = async (id: number): Promise<number | void> => {
    return await deleteService(CALLER.delete, Certification, id);
};

