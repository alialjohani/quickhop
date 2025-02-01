import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import Recruiter, { RecruiterAttributes } from './recruiterModel';
import { JobPostStatus, jobPostStatuses, QuestionType } from '../interfaces/common';
import sequelize from '../config/database';


export interface JobPostAttributes {
    id: number;
    recruiterId: number;
    status: JobPostStatus;
    title: string;
    description: string;
    responsibility: string;
    preferredQualification: string | null;
    requiredQualification: string | null;
    maxCandidates: number;
    minMatchingPercentage: number;
    aiCallsStartingDate: Date;
    aiCallsEndDate: Date;
    jobKB: string | null;
    aiInterviewQuestions: QuestionType[];
    // Association, that can be loaded
    Recruiter?: RecruiterAttributes | null;
}

interface JobPostCreationAttributes extends Optional<JobPostAttributes, 'id'> { }

class JobPost extends Model<JobPostAttributes, JobPostCreationAttributes> implements JobPostAttributes {
    public id!: number;
    public recruiterId!: number; // FK
    public status!: JobPostStatus;
    public title!: string;
    public description!: string;
    public responsibility!: string;
    public preferredQualification!: string | null;
    public requiredQualification!: string | null;
    public maxCandidates!: number;
    public minMatchingPercentage!: number;
    public aiCallsStartingDate!: Date;
    public aiCallsEndDate!: Date;
    public jobKB!: string | null;
    public aiInterviewQuestions!: QuestionType[];
    Recruiter?: RecruiterAttributes | null;
    static initModel(sequelize: Sequelize) {
        JobPost.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                recruiterId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: Recruiter,
                        key: 'id',
                    },
                },
                status: {
                    type: DataTypes.ENUM(...jobPostStatuses),
                    allowNull: false,
                },
                title: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                responsibility: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                preferredQualification: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                requiredQualification: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                maxCandidates: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                minMatchingPercentage: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                aiCallsStartingDate: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
                aiCallsEndDate: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
                jobKB: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                aiInterviewQuestions: {
                    type: DataTypes.JSON, // Store as JSON in the database, allow replacement
                    allowNull: false,
                    defaultValue: [], // Optional: define default as an empty array if desired
                },
            },
            {
                sequelize,
                modelName: 'JobPost',
            }
        );
    }
}



export default JobPost;