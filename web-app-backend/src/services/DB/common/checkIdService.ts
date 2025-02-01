
/**
 * Generic function utility to be used with all models that have relationships (1:M) 
 * to check if Foreign Key is valid or not.
 */

import { Model, ModelStatic } from "sequelize";
import { AppError } from "../../../errors/AppError";
export const checkIdService = async <T extends Model>(
    callerName: string,
    model: ModelStatic<T>, // Model constructor
    id: number,          // ID of the record to update
): Promise<void> => {
    try {
        const recordFound = await model.findOne({
            where: { id: id } as any,
        });
        if (!recordFound) {
            throw new AppError(
                `checkIdService/${callerName}`,
                404,
                "The ID is invalid."
            );
        }
    } catch (error) {
        throw new AppError(
            `checkIdService/${callerName}`,
            500,
            "An error occurred while accessing the database: " + error
        );
    }
};