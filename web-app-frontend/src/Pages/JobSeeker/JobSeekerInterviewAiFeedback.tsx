// import React, { useEffect, useState } from "react";
// import FormView from "../../../components/common/FormView/FormView";
// import Section from "../../../components/common/Section/Section";
// import { useNavigate, useParams } from "react-router-dom";

// import { NOTIFICATION_STYLE } from "../../../config/constants";
// import {
//   FormViewDataType,
//   JobSeekerInterviewResults,
// } from "../../../config/types";
// import { useGetJobSeekerInterviewResultsQuery } from "../../../app/slices/apiSlice";
// import useNotifyAndRoute from "../../../hooks/useNotifyAndRoute";
// import { useAppSeclector } from "../../../app/store/store";
// import { authUserIdSelector } from "../../../app/slices/authSlice";

// const JobSeekerInterviewAiFeedback = () => {
//   const notifyAndRoute = useNotifyAndRoute();
//   const navigate = useNavigate();
//   const { interviewResultId } = useParams();
//   const [interviewResult, setInterviewResult] =
//     useState<JobSeekerInterviewResults>();

//   useEffect(() => {
//     checkIdInUrl(interviewResultId, navigate);
//   }, [interviewResultId, navigate]);

//   const userId: number = useAppSeclector(authUserIdSelector);
//   const {
//     data: results,
//     isLoading,
//     isError,
//     error,
//   } = useGetJobSeekerInterviewResultsQuery(userId);

//   useEffect(() => {
//     if (results) {
//       setInterviewResult(
//         results?.data.find((r) => r.id === Number(interviewResultId)),
//       );
//     }
//   }, [results, interviewResultId]);

//   const data: FormViewDataType[] = [
//     {
//       label: "AI Feedback",
//       value: interviewResult?.aiFeedbackForJobSeeker ?? "",
//     },
//   ];

//   // Handle any fetching data api errors
//   if (isError) {
//     console.error(error);
//     notifyAndRoute(
//       "", // using default error message
//       NOTIFICATION_STYLE.ERROR,
//     );
//   }

//   return (
//     <Section
//       title={`AI Interview Feedback for ${interviewResult?.companyName}`}
//     >
//       <LoadingSpinner isLoading={isLoading}>
//         <FormView data={data} />
//       </LoadingSpinner>
//     </Section>
//   );
// };

// export default JobSeekerInterviewAiFeedback;
