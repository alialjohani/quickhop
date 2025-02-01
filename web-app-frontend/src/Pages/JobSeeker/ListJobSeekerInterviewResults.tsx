/**
 * ListInterviewResults.tsx
 *
 * This page list all the interviews that the job seeker has taken.
 * Each interview result is presented as a card.
 */

import React from "react";
import JobSeekerResultCard from "../../components/jobSeekerComponents/JobSeekerResultCard";
import { CANDIDATE_STATUS, NOTIFICATION_STYLE } from "../../common/constants";
import Section from "../../components/common/Section/Section";
import ListCards from "../../components/common/Card/ListCards";
import { useGetJobSeekerInterviewResultsQuery } from "../../app/slices/apiSlice";
import useNotifyAndRoute from "../../hooks/useNotifyAndRoute";
import { useAppSeclector } from "../../app/store/store";
import { authUserIdSelector } from "../../app/slices/authSlice";
import useSpinner from "../../hooks/useSpinner";
import useRefreshPage from "../../hooks/useRefreshPage";
import { isValidStatus } from "../../common/utils";

const ListJobSeekerInterviewResults = () => {
  const notifyAndRoute = useNotifyAndRoute();

  const userId: number = useAppSeclector(authUserIdSelector);
  const {
    data: results,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetJobSeekerInterviewResultsQuery(userId, {
    refetchOnMountOrArgChange: true, // Re-fetches every time the component mounts
    refetchOnFocus: true, // Re-fetches when the page regains focus
  });

  const elements: JSX.Element[] = [];
  results?.data?.map((result) => {
    if (isValidStatus(result.status, CANDIDATE_STATUS)) {
      elements.push(
        <JobSeekerResultCard
          opportunityResultId={result.id}
          companyName={result.companyName}
          jobTitle={result.jobPostTitle}
          interviewCompletionDate={
            result.interviewCompletionDate?.split("T")[0] ?? ""
          }
          status={result.status}
          // aiFeedback={result.aiFeedbackForJobSeeker ?? ""}
          // interviewResultId={result.id}
        />,
      );
    } else {
      throw new Error(
        "Candidate Status is not matching to well defined CANDIDATE_STATUS.",
      );
    }
  });

  // Handle any fetching data api errors
  if (isError) {
    console.error(error);
    notifyAndRoute(
      "", // using default error message
      NOTIFICATION_STYLE.ERROR,
    );
  }

  useRefreshPage(refetch); // refresh page every few minutes to update the data

  useSpinner([isLoading]);

  return (
    <Section title="Interview Results">
      <ListCards elements={elements} />
    </Section>
  );
};

export default ListJobSeekerInterviewResults;
