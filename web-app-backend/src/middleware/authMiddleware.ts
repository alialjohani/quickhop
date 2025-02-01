/**
 * authMiddleware.ts
 * This middleware will be always called to authenticate the request.
 * It must has a header that is: Authorization: 'Bearer Token' and a userType of type USERS
 */
import dotenv from 'dotenv';
dotenv.config();
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { OAuth2Client } from 'google-auth-library';
import {
    CognitoIdentityProviderClient,
    GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import jwt from "jsonwebtoken";
import { AuthUserData, USERS } from '../interfaces/common';

const adminEmailId = process.env.ADMIN_EMAIL_ID;

// GOOGLE for Job Seeker
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
// AWS Cognito for Recruiter
const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION,
});

// AWS Cognito for Recruiter
const awsVerification = async (token: string, userType: USERS): Promise<AuthUserData> => {
    try {
        // Use the token to fetch user information
        const command = new GetUserCommand({ AccessToken: token });
        const response = await cognitoClient.send(command);

        // Extract email, first name, and last name from user attributes
        const email = response.UserAttributes?.find(
            (attr) => attr.Name === "email"
        )?.Value ?? "";
        const firstName = response.UserAttributes?.find(
            (attr) => attr.Name === "given_name"
        )?.Value ?? "";
        const lastName = response.UserAttributes?.find(
            (attr) => attr.Name === "family_name"
        )?.Value ?? "";
        return { email, firstName, lastName, role: (email === adminEmailId && userType === USERS.ADMIN) ? (USERS.ADMIN) : (USERS.RECRUITER) };
    } catch (error) {
        throw new AppError(`authHandler/awsVerification`, 401, " " + error);
    }
};

// GOOGLE for Job Seeker
const googleVerification = async (jwt: string): Promise<AuthUserData> => {
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: jwt,
            audience: GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        // Google verifyIdToken throws an error if not verified
        if (payload === undefined || !payload?.email_verified) {
            throw new AppError(`authHandler/googleVerification`, 401, "User is not verified with Google. ");
        }

        return {
            email: payload?.email ?? "",
            firstName: payload?.given_name ?? "",
            lastName: payload?.family_name ?? "",
            role: USERS.JOB_SEEKER
        }

    } catch (error) {
        throw new AppError(`authHandler/googleVerification`, 401, " " + error);
    }

}

export const authHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Check required fields in the headers are passed
        const authorizationHeader = req.headers?.authorization;
        const userType = req.headers?.usertype;
        const token = req.headers?.authorization?.split(' ')[1];
        // QUICK ACCESS: temp access as ADMIN, 
        // simpler way rather than getting the token from Cognito; for quick testing endpoints through Postman  
        if (
            userType === USERS.ADMIN
            && authorizationHeader === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMDAiLCJ1c2VydHlwZSI6IkFETUlOIiwiaWF0IjoxNzA3MDk2MDAwfQ.dQw4w9WgXcQ'
        ) {
            req.authUserData = {
                email: adminEmailId ?? "",
                role: USERS.ADMIN,
                firstName: '',
                lastName: ''
            }; // 
            next();
            return;
        }
        if (
            !authorizationHeader ||                        // Missing Authorization header
            !authorizationHeader.startsWith('Bearer ') || // Authorization header does not include 'Bearer'
            !userType ||                              // Missing userType header
            !token
        ) {
            throw new AppError(`authHandler`, 401, "User is not authenticated to proceed. Missing required header values.");
        }


        //Validate token that it can be decoded correctly as valid JWT.
        const decodedToken = jwt.decode(token, { complete: true });
        if (!decodedToken) {
            throw new AppError(`authHandler`, 401, "User is not authenticated to proceed. Invalid token.");
        }

        //verify the token for Recruiter with AWS Cognito, or for job seeker with google
        if (userType === USERS.RECRUITER || userType === USERS.ADMIN) {
            req.authUserData = await awsVerification(token, userType);
        }
        else if (userType === USERS.JOB_SEEKER) {
            req.authUserData = await googleVerification(token);
        }
        else {
            throw new AppError(`authHandler`, 401, "User is not authenticated to proceed. User type is not recognized.");
        }
        if (userType !== req.authUserData.role) {
            throw new AppError(`authHandler`, 401, "User is not authenticated to proceed. User types is mismatching.");
        }
        next();
    } catch (error) {
        next(error);
    }

}