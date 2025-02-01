import { AppError } from '../../errors/AppError';
import Work from '../../models/workModel';
import { updateService } from './common/updateService';
import { deleteService } from './common/deleteService';
import { checkIdService } from './common/checkIdService';
import JobSeeker from '../../models/jobSeekerModel';

const enum CALLER {
    getAll = "getAllWorksService",
    getById = "getWorkByIdService",
    create = "createWorkService",
    update = "updateWorkService",
    delete = "deleteWorkService",
}

export const getAllWorksService = async (): Promise<Work[] | null> => {
    try {
        return await Work.findAll();
    } catch (error) {
        throw new AppError(
            CALLER.getAll,
            500,
            "An error occurred while accessing the database: " + error
        );
    }

};

export const getWorkByIdService = async (id: number): Promise<Work | null> => {
    try {
        return await Work.findByPk(id);
    } catch (error) {
        throw new AppError(
            CALLER.getById,
            500,
            "An error occurred while accessing the database: " + error
        );
    }
};

export const createWorkService = async (
    workData: {
        jobSeekerId: number,
        title: string,
        company: string,
        location: string,
        description: string,
        isStillWorking: boolean,
        startDate: Date,
        endDate: Date | null,
    }
): Promise<Work | null> => {
    try {
        await checkIdService(CALLER.create, JobSeeker, workData.jobSeekerId);
        return await Work.create(workData);
    } catch (error) {
        throw new AppError(
            CALLER.create,
            500,
            "An error occurred while accessing the database: " + error
        );
    }
};

export const updateWorkService = async (
    id: number,
    workData: Partial<Work>
): Promise<Work | null> => {
    return await updateService(CALLER.update, Work, id, workData);
};


export const deleteWorkService = async (id: number): Promise<number | void> => {
    return await deleteService(CALLER.delete, Work, id);
};

