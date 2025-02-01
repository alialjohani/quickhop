import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import JobSeeker from './jobSeekerModel';
import sequelize from '../config/database';


export interface WorkAttributes {
    id: number;
    jobSeekerId: number;
    title: string;
    company: string;
    location: string;
    description: string;
    isStillWorking: boolean;
    startDate: Date;
    endDate: Date | null;
}

interface WorkCreationAttributes extends Optional<WorkAttributes, 'id'> { }

class Work extends Model<WorkAttributes, WorkCreationAttributes> implements WorkAttributes {
    public id!: number;
    public jobSeekerId!: number;
    public title!: string;
    public company!: string;
    public location!: string;
    public description!: string;
    public isStillWorking!: boolean;
    public startDate!: Date;
    public endDate!: Date | null;
    static initModel(sequelize: Sequelize) {
        Work.init(
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
                title: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                company: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                location: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                isStillWorking: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                },
                startDate: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
                endDate: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
            },
            {
                sequelize,
                modelName: 'Work',
            }
        );
    }
}



export default Work;