// two type of users in the app
export enum USERS {
  RECRUITER = "RECRUITER",
  JOB_SEEKER = "JOB_SEEKER",
}

// NOTIFICATION MESSAGE
export enum NOTIFICATION_STYLE {
  SUCCESS = "success",
  ERROR = "error",
}

// ACCORDION STATUS
export enum ACCORDION_STATUS {
  INITIAL = "initial",
  SUCCESS = "success",
  ERROR = "error",
}

// POST STATUS: details on each status is in ListPost.tsx file.
export const POST_STATUS = {
  NEW: {
    val: "NEW",
    label: "New Job Post",
    color: "text-warning",
  },
  SELECTING: {
    val: "SELECTING",
    label: "Selecting",
    color: "text-warning",
  },
  READY: { val: "READY", label: "Ready To Run", color: "text-warning" },
  RUNNING: { val: "RUNNING", label: "Running", color: "text-danger" },
  COMPLETED: { val: "COMPLETED", label: "Completed", color: "text-success" },
} as const;

export type PostStatusType =
  (typeof POST_STATUS)[keyof typeof POST_STATUS]["val"];

export const getPostStatus = (
  status: string,
): (typeof POST_STATUS)[keyof typeof POST_STATUS]["val"] => {
  return POST_STATUS[status as keyof typeof POST_STATUS].val;
};

// STATUS for job seeker after completing an interview
export const CANDIDATE_STATUS = {
  SELECTED: {
    val: "SELECTED",
    label: "Selected",
    color: "text-success",
  },
  NOT_SELECTED: {
    val: "NOT_SELECTED",
    label: "Not-Selecting",
    color: "text-black-50",
  },
  PENDING: {
    val: "PENDING",
    label: "Pending",
    color: "text-white",
  },
} as const;
export type CandidateStatusType =
  (typeof CANDIDATE_STATUS)[keyof typeof CANDIDATE_STATUS]["val"];

// FORM FIELDS' NAMES CONSTANTS
export enum FIELDS_CVForm {
  userId = "id",
  firstName = "firstName",
  lastName = "lastName",
  email = "email",
  phone = "phone",
  linkedin = "linkedin",
  country = "country",
  region = "region",
  city = "city",
  Education = "Education",
  Works = "Works",
  Certifications = "Certifications",
}

export enum FIELDS_CVEducations {
  Education = FIELDS_CVForm.Education,
  educations_Id = "id",
  educations_School = "school",
  educations_Location = "location",
  educations_StartDate = "startDate",
  educations_EndDate = "endDate",
  educations_IsEnrolled = "isEnrolled",
  educations_Degree = "degree",
  educations_FieldStudy = "fieldOfStudy",
  educations_Description = "description",
}

export enum FIELDS_CVCertification {
  certifications = FIELDS_CVForm.Certifications,
  Id = "id",
  Name = "name",
  IssuingOrganization = "issuingOrganization",
  IssueDate = "issueDate",
  ExpirationDate = "expirationDate",
  noExpirationDate = "noExpirationDate",
  CredentialUrl = "credentialUrl",
  Description = "description",
}

export enum FIELDS_CVWorks {
  works = FIELDS_CVForm.Works,
  work_Id = "id",
  work_JobTitle = "title",
  work_CompanyName = "company",
  work_Location = "location",
  work_StartDate = "startDate",
  work_EndDate = "endDate",
  work_IsWorking = "isStillWorking",
  work_Description = "description",
}

export enum FIELDS_PostForm {
  jobId = "id",
  jobTitle = "title",
  jobDescription = "description",
  jobResponsibility = "responsibility",
  preferredQualification = "preferredQualification",
  requiredQualification = "requiredQualification",
  maxCandidates = "maxCandidates",
  minMatchingPercentage = "minMatchingPercentage",
  aiCallsStartingDate = "aiCallsStartingDate",
  aiCallsEndDate = "aiCallsEndDate",
  jobKB = "jobKB",
  aiInterviewQuestions = "aiInterviewQuestions",
}

// ENV variables
export const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const DEV_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
export const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN;
export const COGNITO_REDIRECT_URI = import.meta.env.VITE_COGNITO_REDIRECT_URI;
