import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import sequelize from '../config/database';


export interface JobSeekerAttributes {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    linkedin: string;
    country: string;
    region: string;
    city: string;
}

interface JobSeekerCreationAttributes extends Optional<JobSeekerAttributes, 'id'> { }

class JobSeeker extends Model<JobSeekerAttributes, JobSeekerCreationAttributes> implements JobSeekerAttributes {
    public id!: number;
    public firstName!: string;
    public lastName!: string;
    public email!: string;
    public phone!: string;
    public linkedin!: string;
    public country!: string;
    public region!: string;
    public city!: string;
    static initModel(sequelize: Sequelize) {
        JobSeeker.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                firstName: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                lastName: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                phone: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                linkedin: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                country: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                region: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                city: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
            },
            {
                sequelize,
                modelName: 'JobSeeker',
            }
        );
    }
}



export default JobSeeker;