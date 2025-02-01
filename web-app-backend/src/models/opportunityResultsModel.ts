import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import sequelize from '../config/database';

import JobSeeker from './jobSeekerModel';
import JobPost, { JobPostAttributes } from './jobPostModel';
import { OpportunityResultsStatus, opportunityResultsStatuses } from '../interfaces/common';

export interface OpportunityResultsAttributes {
    id: number;
    jobSeekerId: number; // Foreign key
    jobPostId: number; // Foreign key
    oneTimeAccessKey: string;
    matchingScore: number;
    interviewCompletionDate: Date | null;
    status: OpportunityResultsStatus;
    recordingUri: string | null;
    // interviewCallTranscriptUri: string | null;
    // aiFeedbackForJobSeeker: string | null;
    // aiTailoredResumeFileName: string | null; // it will be accessed based on the id in OpportunityResultsAttributes in specific S3 bucket/prefix
    // aiSentiment: string | null;
    // Optional associations (so maybe these models can be loaded)
    JobPost?: JobPostAttributes | null;
}

interface OpportunityResultsCreationAttributes extends Optional<OpportunityResultsAttributes, 'id'> { }

class OpportunityResults extends Model<OpportunityResultsAttributes, OpportunityResultsCreationAttributes> implements OpportunityResultsAttributes {
    public id!: number;
    public jobSeekerId!: number; // Foreign key
    public jobPostId!: number; // Foreign key
    public oneTimeAccessKey!: string;
    public matchingScore!: number;
    public interviewCompletionDate!: Date | null;
    public status!: OpportunityResultsStatus;
    public recordingUri!: string | null;
    // public interviewCallTranscriptUri!: string | null;
    // public aiFeedbackForJobSeeker!: string | null;
    // public aiTailoredResumeFileName!: string | null; 
    // public aiSentiment!: string | null;
    JobPost?: JobPostAttributes | null;
    static initModel(sequelize: Sequelize) {
        OpportunityResults.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                jobSeekerId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: JobSeeker,
                        key: 'id',
                    },
                },
                jobPostId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: JobPost,
                        key: 'id',
                    },
                },
                oneTimeAccessKey: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                matchingScore: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                interviewCompletionDate: {
                    type: DataTypes.DATE,
                    allowNull: true
                },
                status: {
                    type: DataTypes.ENUM(...opportunityResultsStatuses),
                    allowNull: false
                },
                recordingUri: {
                    type: DataTypes.STRING,
                    allowNull: true
                },
                // interviewCallTranscriptUri: {
                //     type: DataTypes.TEXT,
                //     allowNull: true
                // },
                // aiFeedbackForJobSeeker: {
                //     type: DataTypes.TEXT,
                //     allowNull: true
                // },
                // aiTailoredResumeFileName: {
                //     type: DataTypes.STRING,
                //     allowNull: true
                // },
                // aiSentiment: {
                //     type: DataTypes.STRING,
                //     allowNull: true
                // },
            },
            {
                sequelize,
                modelName: 'OpportunityResults',
            }
        );
    }
}



export default OpportunityResults;
