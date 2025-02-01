import { Response } from "../../../Common/constants";


export enum RESULTS {
    ALREADY_CALLED = "AlreadyCalled",
    JOB_EXPIRED = "JobExpired",
    FOUND = "Found",
    NOT_FOUND = "NotFound",
    PHONE_NOT_MATCH = "PhoneNotMatch",
    NOT_ACCEPTING_CANDIDATES = "NotAcceptingMoreCandidates"
}

export interface JobSeekerPhoneCallRecord {
    OneTimeAccessKey: string;
    Name: string;
    JobPostId: string;
    OpportunityResultId: string;
    JobSeekerEmail: string;
    RecruiterEmail: string;
    maxCandidates: string;
    DidCall: boolean;
    TTL: number;
    PhoneNumber: string;
    isActive: boolean;
}

export const DID_CALL_ATTRIBUTE = "DidCall"; // Attribute name in dynamoDB table
export const ONE_TIME_ACCESS_KEY = "OneTimeAccessKey"; // Attribute name in dynamoDB table

export interface CallerRecordResponse extends Response {
    body: JobSeekerPhoneCallRecord,
    msgResult: RESULTS
}



