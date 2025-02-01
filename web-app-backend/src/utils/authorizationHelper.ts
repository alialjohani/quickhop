import { AppError } from "../errors/AppError";
import { USERS } from "../interfaces/common";


export const checkAuthorization = (
    callerName: string,
    role: USERS | undefined,
    allowedRole: USERS[],
): void => {
    if (role === undefined || !allowedRole.includes(role)) {
        throw new AppError(`checkAuthorization/${callerName}`, 401, "Unauthorized access.");
    }
}