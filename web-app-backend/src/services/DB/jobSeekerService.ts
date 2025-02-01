import { AppError } from '../../errors/AppError';
import JobSeeker from '../../models/jobSeekerModel';
import { deleteService } from './common/deleteService';
import { updateService } from './common/updateService';

const enum CALLER {
    getAll = "getAllJobSeekersService",
    getById = "getJobSeekerByIdService",
    getByEmail = "getJobSeekerByEmailService",
    create = "createJobSeekerService",
    update = "updateJobSeekerService",
    delete = "deleteJobSeekerService",
}

export const getAllJobSeekersService = async (): Promise<JobSeeker[] | null> => {
    try {
        return await JobSeeker.findAll();
    } catch (error) {
        throw new AppError(
            CALLER.getAll,
            500,
            "An error occurred while accessing the database: " + error
        );
    }
};

export const getJobSeekerByIdService = async (id: number): Promise<JobSeeker | null> => {
    try {
        return await JobSeeker.findByPk(id);
    } catch (error) {
        throw new AppError(
            CALLER.getById,
            500,
            "An error occurred while accessing the database: " + error
        );
    }
};

export const getJobSeekerByEmailService = async (email: string): Promise<JobSeeker | null> => {
    try {
        return await JobSeeker.findOne({
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

export const createJobSeekerService = async (
    jobSeekerData: {
        firstName: string,
        lastName: string,
        email: string,
        phone: string,
        linkedin: string,
        country: string,
        region: string,
        city: string
    }
): Promise<JobSeeker | null> => {
    try {
        return await JobSeeker.create(jobSeekerData);
    } catch (error) {
        throw new AppError(
            CALLER.create,
            500,
            "An error occurred while accessing the database: " + error
        );
    }
};

export const updateJobSeekerService = async (
    id: number,
    jobSeekerData: Partial<JobSeeker>
): Promise<JobSeeker | null> => {
    return await updateService(CALLER.update, JobSeeker, id, jobSeekerData);
};

export const deleteJobSeekerService = async (id: number): Promise<number | void> => {
    return await deleteService(CALLER.delete, JobSeeker, id);
};


