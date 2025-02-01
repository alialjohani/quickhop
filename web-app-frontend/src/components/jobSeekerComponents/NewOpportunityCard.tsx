/**
 * NewOpportunityCard.tsx
 *
 * The card summaries info about the opportunity for the job seeker to proceed.
 * It gives information that are: company name, job title,
 * link to the job opportunity details (for requirement, responsibility, title, details how to proceed, etc),
 * end date for the interview, a phone number to call, oneTimeAccessKey, how many accepted interviewees,
 * matching score between CV and the job post
 */

import React from "react";
import IconLabel from "../IconLabel/IconLabel";
import { useNavigate } from "react-router-dom";
import Card from "../common/Card/Card";
import { Dictionary } from "../../common/types";
import Button from "../common/Form/Button";

interface PropsType {
  opportunityId: number;
  companyName: string;
  jobTitle: string;
  matchingScore: number;
  startInterviewDate: string;
  lastInterviewDate: string;
  businessPhone: string;
  oneTimeAccessKey: string;
  maxNumberinterviewees: number;
}

const NewOpportunityCard = ({
  opportunityId,
  companyName,
  jobTitle,
  matchingScore,
  startInterviewDate,
  lastInterviewDate,
  businessPhone,
  oneTimeAccessKey,
  maxNumberinterviewees,
}: PropsType) => {
  const navigate = useNavigate();

  const showPostInfoHandler = () => {
    // console.log(">> Show job seeker more info about the job opportunity.");
    navigate(`job-opportunity/${opportunityId}`);
  };

  const header: JSX.Element = <IconLabel title={jobTitle} />;
  const bodyCard: Dictionary[] = [
    { "Company Name: ": companyName },
    { "Matching Score: ": matchingScore.toString() },
    { "Start Interview Date: ": startInterviewDate },
    { "Last Interview Date: ": lastInterviewDate },
    { "Interview Phone Number: ": businessPhone },
    { "One-Time Access Code: ": oneTimeAccessKey },
    { "Limit of Accepted Interviewees: ": maxNumberinterviewees },
  ];

  const footerLeft: JSX.Element = (
    <Button
      label="View"
      classes="btn btn-outline text-primary"
      onClick={showPostInfoHandler}
    />
  );

  return (
    <Card
      header={header}
      bodyCard={bodyCard}
      footerLeft={footerLeft}
      isSeparatedLine
    />
  );
};

export default NewOpportunityCard;
