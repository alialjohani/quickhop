import { AppError } from '../../errors/AppError';
import Education from '../../models/educationModel';
import { updateService } from './common/updateService';
import { deleteService } from './common/deleteService';
import { checkIdService } from './common/checkIdService';
import JobSeeker from '../../models/jobSeekerModel';


const enum CALLER {
    getAll = "getAllEducationsService",
    getById = "getEducationByIdService",
    create = "createEducationService",
    update = "updateEducationService",
    delete = "deleteEducationService",
}

export const getAllEducationsService = async (): Promise<Education[] | null> => {
    try {
        return await Education.findAll();
    } catch (error) {
        throw new AppError(
            CALLER.getAll,
            500,
            "An error occurred while accessing the database: " + error
        );
    }

};

export const getEducationByIdService = async (id: number): Promise<Education | null> => {
    try {
        return await Education.findByPk(id);
    } catch (error) {
        throw new AppError(
            CALLER.getById,
            500,
            "An error occurred while accessing the database: " + error
        );
    }
};



export const createEducationService = async (
    educationData: {
        jobSeekerId: number,
        degree: string,
        fieldOfStudy: string,
        school: string,
        location: string,
        description: string,
        isEnrolled: boolean,
        startDate: Date,
        endDate: Date | null,
    }
): Promise<Education | null> => {
    try {
        await checkIdService(CALLER.create, JobSeeker, educationData.jobSeekerId);
        return await Education.create(educationData);
    } catch (error) {
        throw new AppError(
            CALLER.create,
            500,
            "An error occurred while accessing the database: " + error
        );
    }
};

export const updateEducationService = async (
    id: number,
    educationData: Partial<Education>
): Promise<Education | null> => {
    return await updateService(CALLER.update, Education, id, educationData);
};


export const deleteEducationService = async (id: number): Promise<number | void> => {
    return await deleteService(CALLER.delete, Education, id);
};

