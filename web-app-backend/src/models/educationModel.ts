import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import JobSeeker from './jobSeekerModel';
import sequelize from '../config/database';


export interface EducationAttributes {
    id: number;
    jobSeekerId: number;
    degree: string;
    fieldOfStudy: string;
    school: string;
    location: string;
    description: string;
    isEnrolled: boolean;
    startDate: Date;
    endDate: Date | null;
}

interface EducationCreationAttributes extends Optional<EducationAttributes, 'id'> { }

class Education extends Model<EducationAttributes, EducationCreationAttributes> implements EducationAttributes {
    public id!: number;
    public jobSeekerId!: number;
    public degree!: string;
    public fieldOfStudy!: string;
    public school!: string;
    public location!: string;
    public description!: string;
    public isEnrolled!: boolean;
    public startDate!: Date;
    public endDate!: Date | null;
    static initModel(sequelize: Sequelize) {
        Education.init(
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
                degree: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                fieldOfStudy: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                school: {
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
                isEnrolled: {
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
                modelName: 'Education',
            }
        );
    }
}



export default Education;