import { ErrorResponse } from "../constants";

const handleException = (ex: any, functionName: string): ErrorResponse => {
    console.error(functionName + " catch ex:", ex);
    return {
        statusCode: ex.statusCode || ex["$metadata"]?.httpStatusCode || 500, // Default to 500 if not available
        errorMessage: ex.message || "An unexpected error occurred",
    };
}

export default handleException;