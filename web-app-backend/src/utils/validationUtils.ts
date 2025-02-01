import { AppError } from '../errors/AppError'; // Adjust the import based on your project structure


export const validateAndGetId = (callerName: string, id: string): number | void => {
    const idNumber = Number(id);
    if (isNaN(idNumber)) {
        throw new AppError(`validateId/${callerName}`, 400, "The provided ID is not a number.");
    } else {
        return idNumber;
    }
};

export const validateAtLeastOneField = (callerName: string, fields: any[]) => {
    if (fields.every(field => !field)) {
        throw new AppError(`validateAtLeastOneField/${callerName}`, 400, "Please, check field names, at least one field is required.");
    }
};

export const validateAllFields = (callerName: string, fields: any[]) => {
    if (fields.some(field => field === undefined || field === null || field === '')) {
        throw new AppError(`validateAllFields/${callerName}`, 400, "All required fields, which do not accept null, must be provided.");
    }
};

export const validateFoundRecord = (callerName: string, isNotFound: boolean) => {
    if (isNotFound) {
        throw new AppError(`validateFoundRecord/${callerName}`, 404, "The record could not be found in DB.");
    }
};

export const validateDeletedRecord = (callerName: string, total: number) => {
    if (total <= 0) {
        throw new AppError(`validateFoundRecord/${callerName}`, 404, "The record could not be found in order to be deleted.");
    }
};