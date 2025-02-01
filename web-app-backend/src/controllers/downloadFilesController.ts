import { NextFunction, Request, Response } from 'express';
import { validateAllFields, validateAndGetId } from '../utils/validationUtils';
import { S3GetSignedUrlForObject } from '../services/AWS/S3GetSignedUrlForObject';
import { sendSuccessResponse } from '../utils/responseHandler';
import logger from '../utils/logger';
import { AWS_S3_RESUME_FOLDER, DownloadFileTypes } from '../interfaces/common';
import { getOpportunityResultsByIdService } from '../services/DB/opportunityResultsService';
import { AppError } from '../errors/AppError';


const enum CALLER {
    resume = "downloadResumeController",
};

// Gets a signed url from S3 to download a resume/recording file
const FILE_EXTENSION = '.pdf';
export const downloadFileController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

        logger.info(`${CALLER.resume}() x-forwarded-for={${req.headers['x-forwarded-for']}}`);
        const email = req.authUserData?.email;
        const opportunityResultId: number = validateAndGetId(CALLER.resume, req.params.id) as number;
        const { fileType } = req.params;
        validateAllFields(CALLER.resume, [email, opportunityResultId, fileType]);
        let objectKey = '';
        if (fileType === DownloadFileTypes.RESUME) {
            objectKey = AWS_S3_RESUME_FOLDER + opportunityResultId + FILE_EXTENSION;
        } else if (fileType === DownloadFileTypes.RECORDING) {
            const opportunityResult = await getOpportunityResultsByIdService(opportunityResultId);
            objectKey = opportunityResult?.recordingUri || ''
        } else {
            throw new AppError(CALLER.resume, 400, "fileType must be: 'RESUME' or 'RECORDING.");
        }
        const url = await S3GetSignedUrlForObject(email!, objectKey);
        logger.info(`${CALLER.resume}() x-forwarded-for={${req.headers['x-forwarded-for']}}, COMPLETED`);
        sendSuccessResponse<String | void>(res, 'Retrieved data', url);
    } catch (error) {
        next(error);
    }
};