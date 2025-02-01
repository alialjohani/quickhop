/**
 * Generic function utility to be used with all models to delete a record
 */

import { DestroyOptions, ForeignKeyConstraintError, Model, ModelStatic } from "sequelize";
import { AppError } from "../../../errors/AppError";

export const deleteService = async <T extends Model>(
    callerName: string,
    model: ModelStatic<T>, // Model constructor
    id: number,          // ID of the record to update
): Promise<number | void> => {
    try {
        const affectedCount = await model.destroy({
            where: { id: id }
        } as DestroyOptions);
        return affectedCount;
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            throw new AppError(
                `deleteService/${callerName}`,
                409,
                `${formatErrorMessage(error.message)}`
            );
        }
        throw new AppError(
            `deleteService/${callerName}`,
            500,
            "An error occurred while accessing the database: " + error
        );
    }
};

function formatErrorMessage(error: string): string {
    const regex = /update or delete on table "(.+?)" violates foreign key constraint "(.+?)" on table "(.+?)"/;
    const match = error.match(regex);

    if (match) {
        const tableName = match[1]; // "Companies"
        const constraintName = match[2]; // "Recruiters_companyId_fkey"
        const referencingTable = match[3]; // "Recruiters"

        return `Cannot delete the ${tableName} because it is referenced by records in the ${referencingTable} table. Please remove or update the related records first.`;
    }

    // Fallback message if the regex does not match
    return 'An error occurred while processing your request. Please assure the ID is not referenced by another records.';
}