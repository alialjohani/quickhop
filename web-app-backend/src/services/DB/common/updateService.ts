/**
 * Generic function utility to be used with all models to update a record
 */

import { Model, ModelStatic, UpdateOptions } from "sequelize";
import { AppError } from "../../../errors/AppError";

export const updateService = async <T extends Model>(
    callerName: string,
    model: ModelStatic<T>, // Model constructor
    id: number,          // ID of the record to update
    data: Partial<T>,    // Data to update (partial type of the model)
    options?: UpdateOptions // Optional update options
): Promise<T | null> => {
    try {
        const [affectedCount] = await model.update(data, {
            where: { id },
            ...options // Merge any additional options
        });
        // Fetch the updated record if affectedCount is greater than 0
        if (affectedCount > 0) {
            return await model.findByPk(id, {
                attributes: { exclude: ['createdAt', 'updatedAt'] }
            });
        }
        throw new AppError(
            `updateService/${callerName}`,
            404,
            "The service could not make the update on the record, please check the ID."
        ); // No record was updated
    } catch (error) {
        throw new AppError(
            `updateService/${callerName}`,
            500,
            "An error occurred while accessing the database: " + error
        );

    }
}