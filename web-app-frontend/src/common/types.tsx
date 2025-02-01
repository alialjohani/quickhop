/**
 * Shared interfaces/types in two or more files.
 */
import React from "react";
import { CandidateStatusType, PostStatusType } from "./constants";

type DictionaryValue = string | number | React.ReactElement;

export interface Dictionary {
  [key: string]: DictionaryValue;
}

export type NavLinkType = {
  title: string;
  ref: string;
};

export interface RecruiterJobPostInteviewQuestionType {
  question: string;
}

export interface RecruiterJobPostFormType {
  id: number;
  status: PostStatusType;
  title: string;
  description: string;
  responsibility: string;
  preferredQualification: string | null;
  requiredQualification: string | null;
  maxCandidates: number;
  minMatchingPercentage: number;
  aiCallsStartingDate: string;
  aiCallsEndDate: string;
  jobKB: string | null; // job knowledge base, to be used as a KB for GenAI LLM module;
  aiInterviewQuestions: RecruiterJobPostInteviewQuestionType[];
}

export interface PostResultType {
  id: number;
  JobId: number;
  JobSeekerId: number;
  JobSeekerName: string;
  JobSeekerPhone: string;
  MatchingScore: number;
  InterviewDate: string;
  Resume: string;
  Recording: string;
  status: CandidateStatusType;
}

export interface SelectOptionType {
  label: string;
  value: string;
}

// JobSeeker: education form in CV page
export interface JobSeekerCVEductionType {
  id: number;
  degree: string;
  fieldOfStudy: string;
  school: string;
  location: string;
  description: string;
  isEnrolled: boolean;
  startDate: string;
  endDate: string | null;
}

// JobSeeker: work form in CV page
export interface JobSeekerCVWorkType {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  isStillWorking: boolean;
  startDate: string;
  endDate: string | null;
}

// JobSeeker: work form in CV page
export interface JobSeekerCVCertificationType {
  id: number;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate: string | null;
  noExpirationDate: boolean;
  credentialUrl: string;
  description: string;
}

interface JobSeekerProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin: string;
  country: string;
  region: string;
  city: string;
}

export interface JobSeekerCVFormType extends JobSeekerProfile {
  Education: JobSeekerCVEductionType[];
  Works: JobSeekerCVWorkType[];
  Certifications: JobSeekerCVCertificationType[];
}

export interface FormViewDataType {
  label: string;
  value: string;
}

/**
 * API Endpoints Interfaces
 */
export interface ResponseEndpointAttributes {
  status: string;
  message: string;
}

// Base interface with shared properties
export interface CompanyAttributes {
  id?: number; // Optional, since it may not be present in requests
  name?: string;
  knowledge_base: string;
}

// Response interface extending the base interface
export interface ResponseCompany extends ResponseEndpointAttributes {
  data: CompanyAttributes;
}

// Request interface using the base interface
export interface RequestCompany extends Omit<CompanyAttributes, "id" | "name"> {
  // You can include additional properties if necessary
  recruiterId: number;
}

export interface RequestDeactivateJobPost {
  recruiterId: number;
  jobPostId: number;
}

export interface RecruiterProfileAttributes {
  id?: 1;
  companyId?: number;
  companyName?: string;
  email?: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface ResponseRecruiterProfile extends ResponseEndpointAttributes {
  data: RecruiterProfileAttributes;
}

export interface RequestRecruiterProfile
  extends Omit<RecruiterProfileAttributes, "id" | "companyId" | "email"> {
  recruiterId: number;
}

export interface RecruiterJobPostAttributes extends RecruiterJobPostFormType {
  recruiterId: number;
}

interface JobPostAdditonalData extends RecruiterJobPostAttributes {
  totalSelectedCandidates: number;
}

export interface ResponseAllJobPosts extends ResponseEndpointAttributes {
  data: JobPostAdditonalData[];
}

/* eslint-disable @typescript-eslint/no-empty-object-type */
export interface RequestRecruiterJobPost
  extends Omit<RecruiterJobPostAttributes, "id"> {}
/* eslint-enable @typescript-eslint/no-empty-object-type */

interface OpportunityResults {
  id: number;
  jobSeekerId: number;
  jobPostId: number;
  oneTimeAccessKey: string;
  matchingScore: number;
  interviewCompletionDate: string | null;
  status: CandidateStatusType;
  recordingUri: string | null;
  // aiFeedbackForJobSeeker: string | null;
}

interface OpportunityResultsJobSeeker extends OpportunityResults {
  JobSeeker: {
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export interface ResponseOpportunityResults extends ResponseEndpointAttributes {
  data: OpportunityResultsJobSeeker[];
}

export interface ResponseIsOpenEndQuestion extends ResponseEndpointAttributes {
  data: boolean;
}

export interface ResponseJobSeekerCV extends ResponseEndpointAttributes {
  data: JobSeekerProfile & {
    Education?: JobSeekerCVEductionType[];
    Works?: JobSeekerCVWorkType[];
    Certifications?: JobSeekerCVCertificationType[];
  };
}

export interface RequestJobSeekerCV extends JobSeekerProfile {
  Education?: JobSeekerCVEductionType[];
  Works?: JobSeekerCVWorkType[];
  Certifications?: JobSeekerCVCertificationType[];
}

export interface RequestOpportunityResultsStatus {
  id: number;
  status: CandidateStatusType;
}

export interface JobSeekerInterviewResults extends OpportunityResults {
  jobPostTitle: string;
  companyName: string;
}

export interface JobSeekerOpportunity
  extends Omit<OpportunityResults, "interviewCompletionDate" | "recordingUri"> {
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

export interface ResponseJobSeekerInterviewResults
  extends ResponseEndpointAttributes {
  data: JobSeekerInterviewResults[];
}

export interface ResponseJobSeekerOpportunities
  extends ResponseEndpointAttributes {
  data: JobSeekerOpportunity[];
}

export interface ResponseUser extends ResponseEndpointAttributes {
  data: {
    id: number;
    email: string;
  };
}

export interface RequestInterviewQuestions {
  totalQuestions: number;
  questions?: string[];
  jobTitle: string;
  jobDescription: string;
  jobResponsibility: string;
  requiredQualification: string;
  preferredQualification: string;
}

export interface ResponseInterviewQuestions extends ResponseEndpointAttributes {
  data: RecruiterJobPostInteviewQuestionType[];
}

export interface RequestAiFeedbackCV {
  section: string;
  titleOrField: string;
  description: string;
}

export interface ResponseAiFeedbackCV extends ResponseEndpointAttributes {
  data: string[];
}

export interface RequestDownloadableUrl {
  opportunityResultId: number;
  fileType: "resume" | "recording";
}

export interface ResponseDownloadFile extends ResponseEndpointAttributes {
  data: string;
}
