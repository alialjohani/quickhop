import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import sequelize from '../config/database';

export interface CompanyAttributes {
    id: number;
    name: string;
    knowledge_base: string;
}

interface CompanyCreationAttributes extends Optional<CompanyAttributes, 'id'> { }

class Company extends Model<CompanyAttributes, CompanyCreationAttributes> implements CompanyAttributes {
    public id!: number;
    public name!: string;
    public knowledge_base!: string;
    static initModel(sequelize: Sequelize) {
        Company.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                knowledge_base: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
            },
            {
                sequelize,
                modelName: 'Company',
            }
        );

    }
}



export default Company;
