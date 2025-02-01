import { AppError } from '../../errors/AppError';
import JobPost from '../../models/jobPostModel';
import { updateService } from './common/updateService';
import { deleteService } from './common/deleteService';
import { checkIdService } from './common/checkIdService';
import Recruiter from '../../models/recruiterModel';
import { JobPostStatus, QuestionType } from '../../interfaces/common';
import { Op } from 'sequelize';


const enum CALLER {
    getAll = "getAllJobPostsService",
    getById = "getJobPostByIdService",
    create = "createJobPostService",
    update = "updateJobPostService",
    delete = "deleteJobPostService",
}

export const getAllJobPostsService = async (): Promise<JobPost[] | null> => {
    try {
        return await JobPost.findAll();
    } catch (error) {
        throw new AppError(
            CALLER.getAll,
            500,
            "An error occurred while accessing the database: " + error
        );
    }

};

export const getJobPostByIdService = async (id: number): Promise<JobPost | null> => {
    try {
        return await JobPost.findByPk(id);
    } catch (error) {
        throw new AppError(
            CALLER.getById,
            500,
            "An error occurred while accessing the database: " + error
        );
    }
};



export const createJobPostService = async (
    jobPostData: {
        recruiterId: number,
        status: JobPostStatus,
        title: string,
        description: string,
        responsibility: string,
        preferredQualification: string | null,
        requiredQualification: string | null,
        maxCandidates: number,
        minMatchingPercentage: number,
        aiCallsStartingDate: Date,
        aiCallsEndDate: Date,
        jobKB: string | null,
        aiInterviewQuestions: QuestionType[],
    }
): Promise<JobPost | null> => {
    try {
        await checkIdService(CALLER.create, Recruiter, jobPostData.recruiterId);
        return await JobPost.create(jobPostData);
    } catch (error) {
        throw new AppError(
            CALLER.create,
            500,
            "An error occurred while accessing the database: " + error
        );
    }
};

export const updateJobPostService = async (
    id: number,
    jobPostData: Partial<JobPost>
): Promise<JobPost | null> => {
    return await updateService(CALLER.update, JobPost, id, jobPostData);
};


export const deleteJobPostService = async (id: number): Promise<number | void> => {
    return await deleteService(CALLER.delete, JobPost, id);
};





