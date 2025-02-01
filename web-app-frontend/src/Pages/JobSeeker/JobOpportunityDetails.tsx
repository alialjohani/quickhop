import React, { useEffect, useState } from "react";
import FormView from "../../components/common/FormView/FormView";
import Section from "../../components/common/Section/Section";
import { useNavigate, useParams } from "react-router-dom";
import { NOTIFICATION_STYLE } from "../../common/constants";
import { FormViewDataType, JobSeekerOpportunity } from "../../common/types";
import { useGetJobSeekerOpportunitiesQuery } from "../../app/slices/apiSlice";
import useNotifyAndRoute from "../../hooks/useNotifyAndRoute";
import { useAppSeclector } from "../../app/store/store";
import { authUserIdSelector } from "../../app/slices/authSlice";
import useSpinner from "../../hooks/useSpinner";
import { checkIdInUrl } from "../../common/utils";

const Details = () => {
  const notifyAndRoute = useNotifyAndRoute();
  const navigate = useNavigate();
  const { opportunityId } = useParams();
  const [opportunity, setOpportunity] = useState<JobSeekerOpportunity>();

  const userId: number = useAppSeclector(authUserIdSelector);
  const {
    data: results,
    isLoading,
    isError,
    error,
  } = useGetJobSeekerOpportunitiesQuery(userId);

  useEffect(() => {
    checkIdInUrl(opportunityId, navigate);
  }, [opportunityId, navigate]);

  useEffect(() => {
    if (results) {
      setOpportunity(results?.data.find((r) => r.id === Number(opportunityId)));
    }
  }, [results, opportunityId]);

  const data: FormViewDataType[] = opportunity
    ? [
        { label: "Job Title: ", value: opportunity.jobTitle },
        {
          label: "Starting Interview Date: ",
          value: opportunity.aiCallsStartDate.split("T")[0],
        },
        {
          label: "End Interview Date: ",
          value: opportunity.aiCallsEndDate.split("T")[0],
        },
        {
          label: "Job Requirements: ",
          value: opportunity.requiredQualification,
        },
        {
          label: "Job Preferred Qualification: ",
          value: opportunity.preferredQualification,
        },
        { label: "Job Responsibility: ", value: opportunity.responsibility },
        {
          label: "Minimum Accepted Matching Score: ",
          value: opportunity.matchingScore.toString(),
        },
        {
          label: "Instruction to Proceed: ",
          value: opportunity.instruction,
        },
        {
          label: "Maximum Number of Interviewees: ",
          value: opportunity.maxCandidates.toString(),
        },
        {
          label: "Phone Number to Call: ",
          value: opportunity.recruitmentPhone,
        },
        {
          label: "One Time Access Key: ",
          value: opportunity.oneTimeAccessKey,
        },
      ]
    : [];

  // Handle any fetching data api errors
  if (isError) {
    console.error(error);
    notifyAndRoute(
      "", // using default error message
      NOTIFICATION_STYLE.ERROR,
    );
  }

  useSpinner([isLoading]);

  return (
    <Section title={`Job Opportunity with ${opportunity?.companyName}`}>
      <FormView data={data} cancelUrlNavigate="/job-seeker" />
    </Section>
  );
};

export default Details;
