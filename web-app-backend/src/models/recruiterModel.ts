import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import Company, { CompanyAttributes } from './companyModel';
import sequelize from '../config/database';

export interface RecruiterAttributes {
    id: number;
    companyId: number; // Foreign key
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    // Additional model that has association with recruiter that might be loaded
    Company?: CompanyAttributes | null;
}

interface RecruiterCreationAttributes extends Optional<RecruiterAttributes, 'id'> { }

class Recruiter extends Model<RecruiterAttributes, RecruiterCreationAttributes> implements RecruiterAttributes {
    public id!: number;
    public companyId!: number; // Foreign key
    public email!: string;
    public firstName!: string;
    public lastName!: string;
    public phone!: string;
    Company?: CompanyAttributes | null;
    static initModel(sequelize: Sequelize) {
        Recruiter.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                companyId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: Company,
                        key: 'id',
                    },
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                firstName: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                lastName: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                phone: {
                    type: DataTypes.STRING,
                    allowNull: false
                }
            },
            {
                sequelize,
                modelName: 'Recruiter',
            }
        );

    }
}


export default Recruiter;
