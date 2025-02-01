import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  RequestCompany,
  ResponseCompany,
  ResponseRecruiterProfile,
  RequestRecruiterProfile,
  ResponseAllJobPosts,
  RequestRecruiterJobPost,
  RecruiterJobPostAttributes,
  ResponseOpportunityResults,
  ResponseJobSeekerCV,
  RequestJobSeekerCV,
  ResponseJobSeekerInterviewResults,
  ResponseJobSeekerOpportunities,
  ResponseUser,
  ResponseInterviewQuestions,
  RequestInterviewQuestions,
  ResponseAiFeedbackCV,
  RequestAiFeedbackCV,
  ResponseDownloadFile,
  RequestOpportunityResultsStatus,
  ResponseEndpointAttributes,
  RequestDeactivateJobPost,
  RequestDownloadableUrl,
  ResponseIsOpenEndQuestion,
} from "../../common/types";
import { DEV_BACKEND_BASE_URL } from "../../common/constants";
import { RootState } from "../store/store";

// Create the base query with token injection
const baseQuery = fetchBaseQuery({
  baseUrl: DEV_BACKEND_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Access the token from the Redux state (adjust path based on your store)
    const { token, userType } = (getState() as RootState).auth;
    // console.log(">>> Prepared token:", token);
    // console.log(">>> Prepared userType:", userType);
    if (token && userType) {
      headers.set("authorization", `Bearer ${token}`);
      headers.set("usertype", `${userType}`);
    }
    // console.log(">>> Prepared Headers:");
    // headers.forEach((value, key) => {
    //   // console.log(`${key}: ${value}`);
    // });
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQuery,
  tagTypes: [
    "Company",
    "Recruiter",
    "JobPosts",
    "PostResults",
    "CV",
    "JobSeekerResults",
    "JobSeekerOpportunities",
    "InterviewQuestions",
    "CVAiFeedback",
    "OpportunityResult",
  ],
  endpoints: (builder) => ({
    getUserId: builder.query<ResponseUser, void>({
      query: () => `/recruitment/users`,
    }),
    getJobSeekerId: builder.query<ResponseUser, void>({
      // the data (userId, email) is being cached,
      // when logout from Recruiter, and login as JobSeeker,
      // old data is being used,
      // so adding this duplicate endpoint fixed the caching issue for now.
      query: () => `/recruitment/users`,
    }),
    getRecruiterCompany: builder.query<ResponseCompany, number>({
      query: (recruiterId) => `/recruitment/recruiter/${recruiterId}/company`,
      providesTags: (result) =>
        result ? [{ type: "Company", id: "DETAIL" }] : [],
    }),
    updateRecruiterCompany: builder.mutation<ResponseCompany, RequestCompany>({
      query: (companyData) => ({
        url: `/recruitment/recruiter/${companyData.recruiterId}/company/knowledge-base`,
        method: "PUT",
        body: companyData,
      }),
      invalidatesTags: [{ type: "Company", id: "DETAIL" }],
    }),
    getRecruiterProfile: builder.query<ResponseRecruiterProfile, number>({
      query: (recruiterId) => `/recruiters/${recruiterId}`,
      providesTags: (result) =>
        result ? [{ type: "Recruiter", id: "DETAIL" }] : [],
    }),
    updateRecruiterProfile: builder.mutation<
      ResponseRecruiterProfile,
      RequestRecruiterProfile
    >({
      query: (profileData) => ({
        url: `/recruitment/${profileData.recruiterId}/profile`,
        method: "PUT",
        body: profileData,
      }),
      invalidatesTags: [{ type: "Recruiter", id: "DETAIL" }],
    }),
    getRecruiterAllJobPosts: builder.query<ResponseAllJobPosts, number>({
      query: (recruiterId) => `recruitment/${recruiterId}/job-posts`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "JobPosts" as const,
                id,
              })),
              { type: "JobPosts", id: "LIST" },
            ]
          : [{ type: "JobPosts", id: "LIST" }],
    }),
    deactivateJobPost: builder.mutation<
      ResponseEndpointAttributes,
      RequestDeactivateJobPost
    >({
      query: (deactivateIds: RequestDeactivateJobPost) =>
        `recruitment/${deactivateIds.recruiterId}/job-posts/${deactivateIds.jobPostId}`,
      invalidatesTags: () => [{ type: "JobPosts", id: "LIST" }],
    }),
    postRecruiterJobPost: builder.mutation<
      RecruiterJobPostAttributes,
      RequestRecruiterJobPost
    >({
      query: (jobPost) => ({
        url: `job-posts`,
        method: "POST",
        body: jobPost,
      }),
      invalidatesTags: [{ type: "JobPosts", id: "LIST" }],
    }),
    deleteRecruiterJobPost: builder.mutation<void, number>({
      query: (id) => ({
        url: `job-posts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "JobPosts", id: "LIST" }],
    }),
    getRecruiterPostResults: builder.query<ResponseOpportunityResults, number>({
      query: (id: number) => `recruitment/job-post/${id}/results`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "PostResults" as const,
                id,
              })),
              { type: "PostResults", id: "LIST" },
            ]
          : [{ type: "PostResults", id: "LIST" }],
    }),
    getJobSeekerCV: builder.query<ResponseJobSeekerCV, number>({
      query: (jobSeekerId: number) =>
        `recruitment/job-seeker/${jobSeekerId}/cv`,
      providesTags: ["CV"],
    }),

    postJobSeekerCV: builder.mutation<ResponseJobSeekerCV, RequestJobSeekerCV>({
      query: (cvPost) => ({
        url: `recruitment/job-seeker/${cvPost.id}/cv`,
        method: "POST",
        body: cvPost,
      }),
      invalidatesTags: ["CV"],
    }),
    getJobSeekerInterviewResults: builder.query<
      ResponseJobSeekerInterviewResults,
      number
    >({
      query: (jobSeekerId: number) =>
        `recruitment/job-seeker/${jobSeekerId}/interview-results`,
      providesTags: (result, _error, jobSeekerId) =>
        result ? [{ type: "JobSeekerResults", id: jobSeekerId }] : [],
    }),
    getJobSeekerOpportunities: builder.query<
      ResponseJobSeekerOpportunities,
      number
    >({
      query: (jobSeekerId: number) =>
        `recruitment/job-seeker/${jobSeekerId}/opportunities`,
      providesTags: (result, _error, jobSeekerId) =>
        result ? [{ type: "JobSeekerOpportunities", id: jobSeekerId }] : [],
    }),
    postRecruiterInterviewQuestions: builder.mutation<
      ResponseInterviewQuestions,
      RequestInterviewQuestions
    >({
      query: (params) => ({
        url: `recruitment/ai/interview-questions`,
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["InterviewQuestions"],
    }),
    postJobSeekerCVAiFeedback: builder.mutation<
      ResponseAiFeedbackCV,
      RequestAiFeedbackCV[]
    >({
      query: (params) => ({
        url: `recruitment/ai/cv-feedback`,
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["CVAiFeedback"],
    }),
    getDownloadableUrl: builder.query<
      ResponseDownloadFile,
      RequestDownloadableUrl
    >({
      query: (params) =>
        `recruitment/opportunity-results/${params.opportunityResultId}/download/${params.fileType}`,
      providesTags: (result) =>
        result ? [{ type: "Company", id: "DETAIL" }] : [],
    }),
    postOpportunityResultStatus: builder.mutation<
      ResponseOpportunityResults,
      RequestOpportunityResultsStatus
    >({
      query: (params) => ({
        url: `recruitment/recruiter/opportunity-result-status/${params.id}`,
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["PostResults"],
    }),
    postIsOpenEndQuestion: builder.mutation<ResponseIsOpenEndQuestion, string>({
      query: (questionText) => ({
        url: `recruitment/ai/is-open-end-question`,
        method: "POST",
        body: {
          question: questionText,
        },
      }),
    }),
  }),
});

export const {
  useGetUserIdQuery,
  useLazyGetJobSeekerIdQuery,
  useGetRecruiterCompanyQuery,
  useUpdateRecruiterCompanyMutation,
  useGetRecruiterProfileQuery,
  useUpdateRecruiterProfileMutation,
  useGetRecruiterAllJobPostsQuery,
  useDeactivateJobPostMutation,
  usePostRecruiterJobPostMutation,
  useDeleteRecruiterJobPostMutation,
  useGetRecruiterPostResultsQuery,
  useGetJobSeekerCVQuery,
  usePostJobSeekerCVMutation,
  useGetJobSeekerInterviewResultsQuery,
  useGetJobSeekerOpportunitiesQuery,
  usePostRecruiterInterviewQuestionsMutation,
  usePostJobSeekerCVAiFeedbackMutation,
  useLazyGetDownloadableUrlQuery,
  usePostOpportunityResultStatusMutation,
  usePostIsOpenEndQuestionMutation,
} = apiSlice;
