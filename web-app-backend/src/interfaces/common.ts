import { JobSeeker, Recruiter } from "../models";
import { EducationAttributes } from "../models/educationModel";
import { JobPostAttributes } from "../models/jobPostModel";
import OpportunityResults from "../models/opportunityResultsModel";
import { WorkAttributes } from "../models/workModel";
import { CertificationAttributes } from "../models/certificationModel";
import { JobSeekerAttributes } from "../models/jobSeekerModel";

// Add and use these tags when uploading Resumes to S3 for permission access
export const AWS_S3_TAG_RECRUITER = "allowed-email-recruiter";
export const AWS_S3_TAG_JOBSEEKER = "allowed-email-JOBSEEKER";

// S3 folder where Resumes will be uploaded/downloaded (path)
export const AWS_S3_RESUME_FOLDER = 'RESUME/';

export enum USERS {
    RECRUITER = "RECRUITER",
    JOB_SEEKER = "JOB_SEEKER",
    ADMIN = "ADMIN"
}

export interface AuthUserData {
    email: string;
    firstName: string;
    lastName: string;
    role: USERS;
}

// To inject data on the req, as a process in authMiddleware.
declare global {
    namespace Express {
        interface Request {
            authUserData?: AuthUserData; // Add other fields as necessary
        }
    }
}




export interface ApiResponse<T> {
    status: 'success' | 'error';
    message: string;
    data?: T; // This allows `data` to be flexible and fit the model
    error?: string;
}

export const jobPostStatuses = ['NEW', 'SELECTING', 'READY', 'RUNNING', 'COMPLETED'] as const;
export type JobPostStatus = typeof jobPostStatuses[number];

export interface QuestionType {
    question: string;
}


export interface MappedJobPostOpportunities extends JobPostAttributes {
    totalSelectedCandidates: number;
}

export interface MappedOpportunityResultsForRecruiter extends OpportunityResults {
    JobSeeker: Pick<JobSeeker, 'firstName' | 'lastName' | 'phone'>;
}

export interface MappedInterviewResultsForJobSeeker extends OpportunityResults {
    jobPostTitle: string;
    companyName: string;
}

export interface MappedOpportunitiesForJobSeeker
    extends Omit<OpportunityResults, 'recordingUri' | 'interviewCompletionDate'> {
    companyName: string;
    jobTitle: string;
    description: string;
    responsibility: string;
    preferredQualification: string;
    requiredQualification: string;
    maxCandidates: number;
    aiCallsStartDate: string;
    aiCallsEndDate: string;
    instruction: string;
    recruitmentPhone: string;
}

export interface RecruiterProfile extends Recruiter {
    companyName: string;
}

export interface MappedJobSeekerCV extends Omit<JobSeekerAttributes, 'id'> {
    id?: number; // Optional in MappedJobSeekerCV, to remove -1/0 id from being inserted
    Education?: EducationAttributes[];
    Works?: WorkAttributes[];
    Certifications?: CertificationAttributes[];
}


export const opportunityResultsStatuses = ['SELECTED', 'NOT_SELECTED', 'PENDING'] as const;
export type OpportunityResultsStatus = typeof opportunityResultsStatuses[number];

export const INSTRUCTION = `Congratulations!
You can now schedule your interview at a time that is convenient for you.
Please make sure to call before the due date.
Kindly note that the number of accepted interviewees is limited. If you call after the limit has been reached, you will lose your chance.
When you call, you must enter your one-time access key. After doing so, you will proceed with the interview conducted by the AI.
Please note that the call will be recorded for monitoring purposes.`;

export interface AiFeedbackCVRequest {
    section: string,
    titleOrField: string,
    description: string,
}

// For `education_history`, redefine `description` as an array of strings:
export interface EducationWithBulletPoints extends Omit<EducationAttributes, 'description'> {
    description: string[]; // Array of strings for multiple descriptions as points
}
export interface WorkWithBulletPoints extends Omit<WorkAttributes, 'description'> {
    description: string[]; // Array of strings for multiple descriptions as points
}
export interface CertificationWithBulletPoints extends Omit<CertificationAttributes, 'description'> {
    description: string[]; // Array of strings for multiple descriptions as points
}

export interface AiMatchingInput {
    job: {
        title: string;
        description: string;
        responsibility: string[];
        required_qualifications: string[];
        preferred_qualifications: string[];
        minimum_accepted_score: number;
    };
    candidate: {
        education_history: EducationWithBulletPoints[];
        work_history: WorkWithBulletPoints[];
        CV_certifications: CertificationWithBulletPoints[];
    };
};

export interface AiResumeOutput extends Omit<AiMatchingInput, 'job'> { };

export interface ResumeDataType {
    outputFileName: string;
    fullName: string;
    location: string;
    email: string;
    phone: string;
    linkedin?: string;
    education_history: EducationWithBulletPoints[];
    work_history: WorkWithBulletPoints[];
    certifications: CertificationWithBulletPoints[];
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

export interface JobPostPhoneCallRecord {
    JobPostId: string;
    message: string;
    TTL: number;
}

export interface JobPostPhoneCallCounterRecord {
    JobPostId: string;
    DidCallCounter: number;
    TTL: number;
}

export const INITIAL_AI_PHONE_MESSAGE_DIRECTIVE = `
**Prompt**:
You are an HR professional conducting a phone call interview.
Your only goal is to ask the exact questions listed in the 'Pre-defined Questions' section and gather responses from the candidate.
**Rules**:
- If 'Pre-defined Questions' has one question, then you will only ask this question.
- If 'Pre-defined Questions' has more than one question, then you will ask one question every single time until you cover all of them. 
- Do not ask additional or follow-up questions beyond those explicitly 'Pre-defined Questions'.
- Do not rephrase, modify, or expand the questions.
- End the conversation once all questions from the list are asked, regardless of how brief the conversation is.
- If the candidate provides an unexpected or irrelevant response, politely bring them back to answer the current question or proceed to the next question.
- Do not ask the same question more than once. If unanswered after being asked twice, move to the next question.
- Conclude the interview immediately after completing all listed questions.
- Your final message must include this: {END_CONVERSATION} to be on the same line.
**Format**:
Thank the candidate at the beginning and end of the interview. Use their name, {USER_NAME}.
Tell the candidate the interview is completed at the end.
**Pre-defined Questions**:
{{QUESTIONS}}
`;

export enum DownloadFileTypes {
    RESUME = 'resume',
    RECORDING = 'recording'
};