import { DestroyOptions, InferAttributes, Sequelize } from "sequelize";
import { AppError } from "../../errors/AppError";
import JobPost, { JobPostAttributes } from "../../models/jobPostModel";
import OpportunityResults from "../../models/opportunityResultsModel";
import Recruiter from "../../models/recruiterModel";
import {
    MappedJobPostOpportunities,
    MappedJobSeekerCV,
    MappedInterviewResultsForJobSeeker,
    MappedOpportunityResultsForRecruiter,
    MappedOpportunitiesForJobSeeker,
    INSTRUCTION,
} from "../../interfaces/common";
import Company from "../../models/companyModel";
import { Certification, Education, JobSeeker, Work } from "../../models";
import { Model, ModelStatic, Op } from 'sequelize';
import logger from "../../utils/logger";
import dotenv from 'dotenv';
dotenv.config();

const RECRUITMENT_PHONE = process.env.RECRUITMENT_PHONE || '';

const syncDataWithDatabase = async <T extends { id?: number }, M extends Model>(
    model: ModelStatic<M>,            // The Sequelize model to use
    records: T[],                      // The incoming data records
    jobSeekerId: number,               // The jobSeeker ID to match
    updatedFields: (keyof T)[],        // Fields to update on duplicate
): Promise<void> => {
    // Extract the IDs from the incoming records
    const incomingIds = records.map(record => record.id).filter(id => id != null) as number[];

    // Step 1: Delete records not present in the incoming data
    await model.destroy({
        where: {
            jobSeekerId: jobSeekerId,
            id: {
                [Op.notIn]: incomingIds, // Delete if the ID is not in the incoming data
            },
        },
    } as DestroyOptions);

    // Step 2: Bulk create or update records
    await model.bulkCreate(
        records.map(record => ({
            ...record,
            jobSeekerId: jobSeekerId,
            id: record.id || undefined, // Create new record if no ID
        })) as M["_creationAttributes"][], // Type assertion to match the model’s creation attributes
        {
            updateOnDuplicate: updatedFields as (keyof M["_creationAttributes"])[], // Type assertion for fields to update on duplicate
        }
    );
}



const enum CALLER {
    getAllPosts = "getJobPostsOpportunitiesByRecruiterIdService",
    updateCompanyKB = "updateCompanyKBByRecruiterIdService",
    getCompanyByRecruiter = "getCompanyByRecruiterIdService",
    getTotalOpportunities = "getTotalOpportunityResultsByRecruiterIdService",
    getAllOpportunitiesByJobPostId = "getAllOpportunityResultsByJobPostIdService",
    getCVService = "getJobSeekerCVService",
    getAllCVsService = "getAllJobSeekerCVsService",
    postCVService = "postJobSeekerCVService",
    getInterviewResults = "getJobSeekerInterviewResultsService",
    readyToRunning = "getAllJobPostsReadyToRunningService",
    runningToComplete = "getAllJobPostsRunningToCompleteService",
    deactivateJobPost = "deactivateJobPostService",
}

export const getCompanyByRecruiterIdService = async (recruiterId: number): Promise<Company | null> => {
    try {
        return await Company.findOne(
            {
                include: [
                    {
                        model: Recruiter,
                        where: { id: recruiterId },
                        attributes: []
                    }
                ]
            }
        );
    } catch (error) {
        throw new AppError(
            CALLER.getCompanyByRecruiter,
            500,
            "An error occurred while accessing the database: " + error
        );
    }

};

export const updateCompanyKBByRecruiterIdService = async (
    id: number,
    companyData: Partial<Company>
): Promise<Company | null> => {
    try {
        const recruiter = await Recruiter.findOne({
            where: { id: id },
            include: [{ model: Company }]
        });
        if (!recruiter) {
            logger.info('Recruiter not found');
            throw new AppError(
                CALLER.updateCompanyKB,
                500,
                "Recruiter not found in database."
            );
        }
        const company = recruiter.Company;
        if (!company) {
            logger.info('Company not found');
            throw new AppError(
                CALLER.updateCompanyKB,
                500,
                "Company not found in database."
            );
        }
        const companyInstance = company as typeof Company.prototype;
        await companyInstance.update(companyData);
        return Company.findOne({ where: { id: company.id } });
    } catch (error) {
        throw new AppError(
            CALLER.updateCompanyKB,
            500,
            "An error occurred while accessing the database: " + error
        );
    }
};

export const getJobPostsOpportunitiesByRecruiterIdService =
    async (id: number, recruiterEmail: string): Promise<MappedJobPostOpportunities[] | null> => {
        try {
            const allPostsWithOpportunities: MappedJobPostOpportunities[] = await JobPost.findAll({
                where: { recruiterId: id },
                attributes: {
                    include: [
                        [Sequelize.fn("COUNT", Sequelize.col("OpportunityResults.id")), "totalSelectedCandidates"]
                    ]
                },
                include: [
                    {
                        model: OpportunityResults,
                        attributes: [], // Exclude individual OpportunityResults attributes
                    },
                    {
                        model: Recruiter,
                        where: { email: recruiterEmail }, // to only allow the data owner to access
                        attributes: []
                    }
                ],
                group: ['JobPost.id'],
                raw: true, // This will return plain objects
            }) as (JobPost & { totalSelectedCandidates: number })[];;

            logger.info('getJobPostsOpportunitiesByRecruiterIdService(): ' + allPostsWithOpportunities.length)

            // Transform result if needed (depending on your data structure)
            const result: MappedJobPostOpportunities[] = allPostsWithOpportunities.map(post => ({
                id: Number(post.id || 0),
                recruiterId: Number(post.recruiterId || 0),
                status: post.status,
                title: post.title,
                description: post.description,
                responsibility: post.responsibility,
                preferredQualification: post.preferredQualification,
                requiredQualification: post.requiredQualification,
                maxCandidates: Number(post.maxCandidates || 0),
                minMatchingPercentage: Number(post.minMatchingPercentage || 0),
                aiCallsStartingDate: new Date(post.aiCallsStartingDate),
                aiCallsEndDate: new Date(post.aiCallsEndDate),
                jobKB: post.jobKB,
                aiInterviewQuestions: post.aiInterviewQuestions,
                totalSelectedCandidates: Number(post.totalSelectedCandidates || 0), // Should now exist
            }));

            return result;


        } catch (error) {
            throw new AppError(
                CALLER.getAllPosts,
                500,
                "An error occurred while accessing the database: " + error
            );
        }

    };

export const deactivateJobPostService =
    async (recruiterId: number, jobPostId: number): Promise<void> => {
        try {

            const foundJobPost = await JobPost.findOne({
                where: { id: jobPostId, recruiterId: recruiterId },
            });

            if (foundJobPost) {
                foundJobPost?.update({ status: 'COMPLETED' });
                logger.info('deactivateJobPost(): ' + foundJobPost.id + ' updated to complete status.');
            } else {
                throw new AppError(CALLER.deactivateJobPost, 500, "Could not find the job post in DB to be updated as complete (to deactivate).")
            }
        } catch (error) {
            throw new AppError(
                CALLER.getAllPosts,
                500,
                "An error occurred while accessing the database: " + error
            );
        }

    };

export const getAllOpportunityResultsByJobPostIdService = async (id: number, recruiterEmail: string): Promise<MappedOpportunityResultsForRecruiter[] | null> => {
    try {
        logger.info('getAllOpportunityResultsByJobPostIdService id= ' + id)
        logger.info('getAllOpportunityResultsByJobPostIdService recruiterEmail= ' + recruiterEmail)
        const opportunityResults = await OpportunityResults.findAll(
            {
                where: { jobPostId: id },
                include: [
                    {
                        model: JobSeeker, // Assuming JobSeeker is the related model
                        attributes: ['firstName', 'lastName', 'phone'], // Specify only the fields you want
                    },
                    {
                        model: JobPost,
                        where: { id: id },
                        // include: [
                        //     {
                        //         model: Recruiter,
                        //         where: { email: recruiterEmail }, // to only allow the data owner to access
                        //         attributes: []
                        //     }
                        // ]
                    }
                ],
            }
        );
        return opportunityResults as MappedOpportunityResultsForRecruiter[];
    } catch (error) {
        throw new AppError(
            CALLER.getAllOpportunitiesByJobPostId,
            500,
            "An error occurred while accessing the database: " + error
        );
    }

};

// Job seeker profile form JobSeeker model, as well as: his works, educations, certifications
export const getJobSeekerCVService = async (id: number): Promise<JobSeeker | null> => {
    try {
        const cv = await JobSeeker.findOne(
            {
                where: { id: id },
                include: [
                    {
                        model: Education,
                    },
                    {
                        model: Work,
                    },
                    {
                        model: Certification,
                    },
                ],
            }
        );
        return cv;
    } catch (error) {
        throw new AppError(
            CALLER.getCVService,
            500,
            "An error occurred while accessing the database: " + error
        );
    }

};


export interface JobSeekerCV extends JobSeeker {
    Educations?: InferAttributes<Education>[];
    Works?: InferAttributes<Work>[];
    Certifications?: InferAttributes<Certification>[];
}

// All Job seeker profile form JobSeeker model, as well as: his works, educations, certifications
export const getAllJobSeekerCVsService = async (): Promise<MappedJobSeekerCV[]> => {
    try {
        const cv: MappedJobSeekerCV[] = await JobSeeker.findAll(
            {
                include: [
                    {
                        model: Education,
                    },
                    {
                        model: Work,
                    },
                    {
                        model: Certification,
                    },
                ],
            }
        );
        return cv;
    } catch (error) {
        throw new AppError(
            CALLER.getAllCVsService,
            500,
            "An error occurred while accessing the database: " + error
        );
    }

};


// Job seeker profile form JobSeeker model, as well as: his works, educations, certifications
export const postJobSeekerCVService = async (data: MappedJobSeekerCV): Promise<JobSeeker | null> => {
    try {
        const [jobSeeker, created] = await JobSeeker.upsert(data);

        if (data.Education) {
            await syncDataWithDatabase(
                Education,
                data.Education,
                jobSeeker.id,
                ["degree", "fieldOfStudy", "school", "location", "description",
                    "isEnrolled", "startDate", "endDate"]
            );
        }

        if (data.Works) {
            await syncDataWithDatabase(
                Work,
                data.Works,
                jobSeeker.id,
                ["title", "company", "location", "description", "isStillWorking",
                    "startDate", "endDate"]
            );
        }

        if (data.Certifications) {
            await syncDataWithDatabase(
                Certification,
                data.Certifications,
                jobSeeker.id,
                [
                    "name", "issuingOrganization", "credentialUrl",
                    "description", "noExpirationDate", "issueDate", "expirationDate",
                ]
            );
        }

        return await getJobSeekerCVService(jobSeeker.id);

    } catch (error) {
        throw new AppError(
            CALLER.postCVService,
            500,
            "An error occurred while accessing the database: " + error
        );
    }

};


export const getJobSeekerInterviewResultsService =
    async (jobSeekerId: number): Promise<MappedInterviewResultsForJobSeeker[] | null> => {
        try {

            const opportunityResults = await OpportunityResults.findAll({
                where: {
                    jobSeekerId,
                    interviewCompletionDate: {
                        [Op.not]: null,
                    }
                }, // Filter by specific jobSeekerId
                include: [
                    {
                        model: JobPost,
                        attributes: ['title'], // get job title
                        include: [
                            {
                                model: Recruiter,
                                include: [
                                    {
                                        model: Company,
                                        attributes: ['name']
                                    }
                                ]
                            }
                        ]
                    }
                ],
                raw: true, // This flattens the response
                nest: true // Keeps nested objects but allows us to access them directly
            });

            const formattedData: MappedInterviewResultsForJobSeeker[] = opportunityResults.map(data => ({
                id: data.id,
                jobSeekerId: data.jobSeekerId,
                jobPostId: data.jobPostId,
                oneTimeAccessKey: data.oneTimeAccessKey,
                matchingScore: data.matchingScore,
                interviewCompletionDate: data.interviewCompletionDate,
                status: data.status,
                jobPostTitle: data.JobPost?.title,
                companyName: data.JobPost?.Recruiter?.Company?.name,
                recordingUri: data.recordingUri,
            })) as MappedInterviewResultsForJobSeeker[];

            return formattedData;

        } catch (error) {
            throw new AppError(
                CALLER.getInterviewResults,
                500,
                "An error occurred while accessing the database: " + error
            );
        }
    };



export const getJobSeekerOpportunitiesService =
    async (jobSeekerId: number): Promise<MappedOpportunitiesForJobSeeker[] | null> => {
        try {

            const opportunityResults = await OpportunityResults.findAll({
                where: {
                    jobSeekerId,
                    interviewCompletionDate: {
                        [Op.eq]: null,
                    }
                }, // Filter by specific jobSeekerId
                include: [
                    {
                        model: JobPost,
                        attributes: ['title', 'description', 'responsibility', 'preferredQualification',
                            'requiredQualification', 'maxCandidates', 'aiCallsStartingDate', 'aiCallsEndDate'], // get job title
                        include: [
                            {
                                model: Recruiter,
                                include: [
                                    {
                                        model: Company,
                                        attributes: ['name']
                                    }
                                ]
                            }
                        ]
                    }
                ],
                raw: true, // This flattens the response
                nest: true // Keeps nested objects but allows us to access them directly
            });

            const formattedData: MappedOpportunitiesForJobSeeker[] = opportunityResults.map(data => ({
                id: data.id,
                jobSeekerId: data.jobSeekerId,
                jobPostId: data.jobPostId,
                oneTimeAccessKey: data.oneTimeAccessKey,
                matchingScore: data.matchingScore,
                status: data.status,
                companyName: data.JobPost?.Recruiter?.Company?.name,
                jobTitle: data.JobPost?.title,
                description: data.JobPost?.description,
                responsibility: data.JobPost?.responsibility,
                preferredQualification: data.JobPost?.preferredQualification,
                requiredQualification: data.JobPost?.requiredQualification,
                maxCandidates: data.JobPost?.maxCandidates,
                aiCallsStartDate: data.JobPost?.aiCallsStartingDate ?? "",
                aiCallsEndDate: data.JobPost?.aiCallsEndDate ?? "",
                instruction: INSTRUCTION,
                recruitmentPhone: RECRUITMENT_PHONE
            })) as MappedOpportunitiesForJobSeeker[];

            return formattedData;

        } catch (error) {
            throw new AppError(
                CALLER.getInterviewResults,
                500,
                "An error occurred while accessing the database: " + error
            );
        }
    };

// get job post that should be changed to 'RUNNING' status 
// Have 'READY' status & aiCallsStartingDate >= todayDate
export const getAllJobPostsReadyToRunningService = async (): Promise<JobPost[] | null> => {
    try {
        const todayDate: Date = new Date();
        return await JobPost.findAll({
            where: {
                status: 'READY',
                aiCallsStartingDate: {
                    [Op.lte]: todayDate
                }
            }
        });
    } catch (error) {
        throw new AppError(
            CALLER.readyToRunning,
            500,
            "An error occurred while accessing the database: " + error
        );
    }

};

// get job post that should be changed to 'COMPLETE' status 
// Have 'RUNNING' status & aiCallsEndDate > todayDate
export const getAllJobPostsRunningToCompleteService = async (): Promise<JobPost[] | null> => {
    try {
        const todayDate: Date = new Date();
        return await JobPost.findAll({
            where: {
                status: 'RUNNING',
                aiCallsEndDate: {
                    [Op.lt]: todayDate
                }
            }
        });
    } catch (error) {
        throw new AppError(
            CALLER.runningToComplete,
            500,
            "An error occurred while accessing the database: " + error
        );
    }
};