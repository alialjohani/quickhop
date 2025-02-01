import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import JobSeeker from './jobSeekerModel';
import sequelize from '../config/database';


export interface CertificationAttributes {
    id: number;
    jobSeekerId: number;
    name: string;
    issuingOrganization: string;
    credentialUrl: string;
    description: string;
    noExpirationDate: boolean;
    issueDate: Date;
    expirationDate: Date | null;
}

interface CertificationCreationAttributes extends Optional<CertificationAttributes, 'id'> { }

class Certification extends Model<CertificationAttributes, CertificationCreationAttributes> implements CertificationAttributes {
    public id!: number;
    public jobSeekerId!: number;
    public name!: string;
    public issuingOrganization!: string;
    public credentialUrl!: string;
    public description!: string;
    public noExpirationDate!: boolean;
    public issueDate!: Date;
    public expirationDate!: Date | null;
    static initModel(sequelize: Sequelize) {
        Certification.init(
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
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                issuingOrganization: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                credentialUrl: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                noExpirationDate: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                },
                issueDate: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
                expirationDate: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },


            },
            {
                sequelize,
                modelName: 'Certification',
            }
        );
    }
}



export default Certification;