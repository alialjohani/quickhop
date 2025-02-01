import { AppError } from '../../errors/AppError';
import OpportunityResults from '../../models/opportunityResultsModel';
import { updateService } from './common/updateService';
import { deleteService } from './common/deleteService';
import { checkIdService } from './common/checkIdService';
import JobSeeker from '../../models/jobSeekerModel';
import { OpportunityResultsStatus } from '../../interfaces/common';
import JobPost from '../../models/jobPostModel';

const enum CALLER {
    getAll = "getAllOpportunityResultsService",
    getById = "getOpportunityResultsByIdService",
    create = "createOpportunityResultsService",
    update = "updateOpportunityResultsService",
    delete = "deleteOpportunityResultsService",
}

export const getAllOpportunityResultsService = async (): Promise<OpportunityResults[] | null> => {
    try {
        return await OpportunityResults.findAll();
    } catch (error) {
        throw new AppError(
            CALLER.getAll,
            500,
            "An error occurred while accessing the database: " + error
        );
    }

};

export const getOpportunityResultsByIdService =
    async (id: number): Promise<OpportunityResults | null> => {
        try {
            return await OpportunityResults.findByPk(id);
        } catch (error) {
            throw new AppError(
                CALLER.getById,
                500,
                "An error occurred while accessing the database: " + error
            );
        }
    };

export const createOpportunityResultsService = async (
    opportunityResultsData: {
        jobSeekerId: number,
        jobPostId: number,
        oneTimeAccessKey: string,
        matchingScore: number,
        interviewCompletionDate: Date | null,
        status: OpportunityResultsStatus,
        recordingUri: string | null,
    }
): Promise<OpportunityResults | null> => {
    try {
        await checkIdService(CALLER.create, JobSeeker, opportunityResultsData.jobSeekerId);
        await checkIdService(CALLER.create, JobPost, opportunityResultsData.jobPostId);
        return await OpportunityResults.create(opportunityResultsData);
    } catch (error) {
        throw new AppError(
            CALLER.create,
            500,
            "An error occurred while accessing the database: " + error
        );
    }
};

export const updateOpportunityResultsService = async (
    id: number,
    opportunityResultsData: Partial<OpportunityResults>
): Promise<OpportunityResults | null> => {
    return await updateService(CALLER.update, OpportunityResults, id, opportunityResultsData);
};


export const deleteOpportunityResultsService = async (id: number): Promise<number | void> => {
    return await deleteService(CALLER.delete, OpportunityResults, id);
};

