/**
 * ListNewOpportunities.tsx
 *
 * This page list all new opportunities for the job seeker.
 * The opportunity appears after the system match the job seeker with the job post based on
 * the job post's requirements, description, and qualification.
 * Each opportunity is presented as a card with a details about how to proceed for a job interview.
 */

import React from "react";
import NewOpportunityCard from "../../components/jobSeekerComponents/NewOpportunityCard";
import Section from "../../components/common/Section/Section";
import ListCards from "../../components/common/Card/ListCards";
import { useGetJobSeekerOpportunitiesQuery } from "../../app/slices/apiSlice";
import { NOTIFICATION_STYLE } from "../../common/constants";
import useNotifyAndRoute from "../../hooks/useNotifyAndRoute";
import { useAppSeclector } from "../../app/store/store";
import { authUserIdSelector } from "../../app/slices/authSlice";
import useSpinner from "../../hooks/useSpinner";
import useRefreshPage from "../../hooks/useRefreshPage";

const ListNewOpportunities = () => {
  const notifyAndRoute = useNotifyAndRoute();
  const elements: JSX.Element[] = [];

  const userId: number = useAppSeclector(authUserIdSelector);
  const {
    data: results,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetJobSeekerOpportunitiesQuery(userId, {
    refetchOnMountOrArgChange: true, // Re-fetches every time the component mounts
    refetchOnFocus: true, // Re-fetches when the page regains focus
  });

  results?.data.map((r) => {
    elements.push(
      <NewOpportunityCard
        opportunityId={r.id}
        companyName={r.companyName}
        jobTitle={r.jobTitle}
        matchingScore={r.matchingScore}
        startInterviewDate={r.aiCallsStartDate.split("T")[0]}
        lastInterviewDate={r.aiCallsEndDate.split("T")[0]}
        businessPhone={r.recruitmentPhone}
        oneTimeAccessKey={r.oneTimeAccessKey}
        maxNumberinterviewees={r.maxCandidates}
      />,
    );
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
    <Section title="Job Opportunities">
      <ListCards elements={elements} />
    </Section>
  );
};

export default ListNewOpportunities;
